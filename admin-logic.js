import { auth, database, storage, signInWithEmailAndPassword, ref, push, set, sRef, uploadBytes, getDownloadURL, get } from "./firebase-config.js";

window.adminLogin = async () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        // Verify Admin Role
        const roleRef = ref(database, `users/${userCred.user.uid}/role`);
        const snapshot = await get(roleRef);
        
        if (snapshot.exists() && snapshot.val() === 'admin') {
            document.getElementById('admin-login').classList.add('hidden');
            document.getElementById('product-form').classList.remove('hidden');
            alert("Welcome Admin");
        } else {
            alert("Access Denied: You are not an Admin");
        }
    } catch (e) {
        alert("Login failed: " + e.message);
    }
};

window.uploadProduct = async () => {
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const file = document.getElementById('p-image').files[0];
    const btn = document.getElementById('upload-btn');
    const status = document.getElementById('status');

    if (!name || !price || !file) return alert("Fill all fields");

    try {
        btn.disabled = true;
        status.innerText = "Uploading Image...";

        // 1. Upload Image to Storage
        const imageRef = sRef(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(imageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        status.innerText = "Saving to Database...";

        // 2. Save Data to Realtime DB
        const newProductRef = push(ref(database, 'products'));
        await set(newProductRef, {
            name: name,
            price: Number(price),
            imageUrl: url,
            createdAt: new Date().toISOString()
        });

        alert("Product Added Successfully!");
        // Reset form
        document.getElementById('p-name').value = "";
        document.getElementById('p-price').value = "";
        document.getElementById('p-image').value = "";
        status.innerText = "";
    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
    } finally {
        btn.disabled = false;
    }
};
