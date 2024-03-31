import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp  } from 'firebase/firestore';

    const firebaseConfig  = {
        apiKey: "AIzaSyCeauEJfELASw3MjMEq6btYa2Y7pqvO8vE",
        authDomain: "schedule-manager-16145.firebaseapp.com",
        projectId: "schedule-manager-16145",
        storageBucket: "schedule-manager-16145.appspot.com",
        messagingSenderId: "889921878488",
        appId: "1:889921878488:web:975b869e20d8ba0be35aad",
        measurementId: "G-3RS9SBB4B2"
      };
      
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Register User
function register() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            // ...
            setDoc(doc(db, 'users', user.uid), {
                username: username,
                email: email
            });
            // Redirect to budget.html
            window.location.href = "budget.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
}


// Add user data to Firestore
function addUserToFirestore(userId, username, email) {
    setDoc(doc(db, 'users', userId), {
        username: username,
        email: email
    });
}

// Login User
function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            // ...
            // Redirect to budget.html
            window.location.href = "budget.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
}
function signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // ...
            setDoc(doc(db, 'users', user.uid), {
                username: user.displayName,
                email: user.email
            });
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}
// Attach event listeners after the DOM has loaded
document.addEventListener('DOMContentLoaded', function() {
    // Register button
    document.getElementById('submit-register').addEventListener('click', register);

    // Login button
    document.querySelector('.submit-btn').addEventListener('click', loginUser);

    // Google sign-in button
    document.getElementById('google-btn').addEventListener('click', signInWithGoogle);
    
    document.getElementById('add').addEventListener('click', addItemToFirestore);
});


// Save user data in session
function saveUserDataInSession(userId) {
    setDoc(doc(db, 'sessions', 'current'), {
        userId: userId
    });
}

// Retrieve user data from session
async function retrieveUserDataFromSession() {
    const sessionDoc = await getDoc(doc(db, 'sessions', 'current'));
    if (sessionDoc.exists()) {
        const userId = sessionDoc.data().userId;
        console.log("User ID from session:", userId);
        // You can use this userId to fetch user data from Firestore if needed
    } else {
        console.log("No session data found.");
    }
}

// Detect auth state
onAuthStateChanged(auth, user => {
    if (user) {
        console.log("Logged in as:", user.email);
        // Save user data in session
        saveUserDataInSession(user.uid);
    } else {
        console.log("Not logged in");
        // Clear session data
        clearSession();
    }
});

// Clear session data
function clearSession() {
    setDoc(doc(db, 'sessions', 'current'), {});
}

// Example usage:
// Register a user
// registerUser("username", "user@example.com", "password");

// Login a user
// loginUser("user@example.com", "password");

// Retrieve user data from session
retrieveUserDataFromSession();



async function addItemToFirestore() {
    const userId = auth.currentUser.uid; // Get the current user's UID
    const itemName = document.getElementById('item').value;
    const itemPrice = parseFloat(document.getElementById('price').value); // Parse item price as float

    try {
        const docRef = await addDoc(collection(db, 'items'), {
            userId: userId,
            name: itemName,
            price: itemPrice,
            dateAdded: serverTimestamp() // Use Firestore's serverTimestamp to get the server's current timestamp
        });
        console.log("Item added with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding item: ", error);
    }
}
