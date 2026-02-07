import { auth, database, onValue, ref, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, push, set } from "./firebase-config.js";

// State
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart') || "[]");
let products = [];
let isLoginMode = true;

// DOM Elements
const productListEl = document.getElementById('product-list');
const cartCountEl = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');

// --- Initialization ---
window.toggleView = (viewName) => {
    document.getElementById('view-products').classList.add('hidden');
    document.getElementById('view-cart').classList.add('hidden');
    document.getElementById(`view-${viewName}`).classList.remove('hidden');
    if(viewName === 'cart') renderCart();
};

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateAuthUI();
});

// --- Product Logic ---
const productsRef = ref(database, 'products');
onValue(productsRef, (snapshot) => {
    productListEl.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
        productListEl.innerHTML = "<p class='p-4'>No products available yet.</p>";
        return;
    }
    
    products = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = "bg-white p-3 rounded shadow hover:shadow-lg transition";
        card.innerHTML = `
            <img src="${p.imageUrl}" class="w-full h-40 object-cover rounded mb-2 bg-gray-200">
            <h3 class="font-bold text-sm truncate">${p.name}</h3>
            <div class="flex justify-between items-center mt-2">
                <span class="text-blue-900 font-bold">₹${p.price}</span>
                <button onclick="addToCart('${p.id}')" class="bg-blue-900 text-white px-3 py-1 rounded text-xs">
                    ADD
                </button>
            </div>
        `;
        productListEl.appendChild(card);
    });
});

// --- Cart Logic ---
window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    if(product) {
        cart.push(product);
        saveCart();
        alert("Added to cart");
    }
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    saveCart();
    renderCart();
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    cartCountEl.innerText = cart.length;
}

function renderCart() {
    cartItemsEl.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += parseInt(item.price);
        cartItemsEl.innerHTML += `
            <div class="flex justify-between items-center bg-white p-3 rounded shadow">
                <div class="flex gap-3">
                    <img src="${item.imageUrl}" class="w-12 h-12 rounded object-cover">
                    <div>
                        <div class="font-bold">${item.name}</div>
                        <div class="text-sm">₹${item.price}</div>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-500">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `;
    });
    cartTotalEl.innerText = `₹${total}`;
}

// --- Checkout (Razorpay) ---
window.initiateCheckout = () => {
    if (!currentUser) {
        alert("Please login to checkout");
        window.handleAuthClick();
        return;
    }
    if (cart.length === 0) return alert("Cart is empty");

    const totalAmount = cart.reduce((sum, item) => sum + parseInt(item.price), 0);

    const options = {
        "key": "rzp_test_YOUR_KEY_HERE", // REPLACE WITH YOUR RAZORPAY TEST KEY
        "amount": totalAmount * 100,
        "currency": "INR",
        "name": "Pankaj Enterprises",
        "description": "Order Payment",
        "handler": function (response){
            saveOrder(response.razorpay_payment_id, totalAmount);
        },
        "prefill": {
            "email": currentUser.email
        },
        "theme": { "color": "#1e3a8a" }
    };
    
    const rzp1 = new Razorpay(options);
    rzp1.open();
};

async function saveOrder(paymentId, total) {
    const orderData = {
        userId: currentUser.uid,
        items: cart,
        total: total,
        paymentId: paymentId,
        date: new Date().toISOString(),
        status: 'Paid'
    };

    try {
        await push(ref(database, `orders/${currentUser.uid}`), orderData);
        cart = [];
        saveCart();
        window.toggleView('products');
        alert("Order Placed Successfully!");
    } catch(e) {
        alert("Error saving order: " + e.message);
    }
}

// --- Auth Logic ---
window.handleAuthClick = () => {
    if (currentUser) {
        signOut(auth);
    } else {
        document.getElementById('auth-modal').classList.remove('hidden');
    }
};

window.closeAuth = () => document.getElementById('auth-modal').classList.add('hidden');

window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Login" : "Register";
    document.getElementById('auth-switch-text').innerText = isLoginMode ? "Register" : "Login";
};

window.performAuth = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);
            // Create user entry
            await set(ref(database, 'users/' + userCred.user.uid), {
                email: email,
                role: 'user', // Default role
                joined: new Date().toISOString()
            });
        }
        closeAuth();
        alert("Success!");
    } catch (e) {
        alert(e.message);
    }
};

function updateAuthUI() {
    const btn = document.getElementById('auth-btn');
    if (currentUser) {
        btn.innerHTML = `<i class="fa fa-sign-out text-xl text-red-300"></i>`;
    } else {
        btn.innerHTML = `<i class="fa fa-user text-xl"></i>`;
    }
    // Simple way to check admin UI (secure check happens on DB write)
    if(currentUser) {
        // Check if admin to show dashboard link (optional UI enhancement)
    }
}

// Save initial cart state
saveCart();
