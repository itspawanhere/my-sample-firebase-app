// Import necessary Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    //..put your key here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI Elements
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');
const userDetails = document.getElementById('userDetails');
const createThing = document.getElementById('createThing');
const thingsList = document.getElementById('thingsList');

// Google Auth provider
const provider = new GoogleAuthProvider();

// Sign-in and sign-out functionality
signInBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider);
});

signOutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Auth state listener
onAuthStateChanged(auth, user => {
    if (user) {
        // User is signed in
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
        
        // Firestore Database operations
        const thingsRef = collection(db, 'things');

        createThing.onclick = async () => {
            await addDoc(thingsRef, {
                uid: user.uid,
                name: faker.commerce.productName(),
                createdAt: serverTimestamp()
            });
        };

        // Firestore query and real-time updates
        const thingsQuery = query(thingsRef, where('uid', '==', user.uid), orderBy('createdAt'));
        const unsubscribe = onSnapshot(thingsQuery, (querySnapshot) => {
            const items = querySnapshot.docs.map(doc => {
                return `<li>${doc.data().name}</li>`;
            });
            thingsList.innerHTML = items.join('');
        });

    } else {
        // User is signed out
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        userDetails.innerHTML = '';
        thingsList.innerHTML = ''; // Clear the list on sign-out
    }
});
