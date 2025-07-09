import { auth, db } from "../../firebase/firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.getElementById("logoutBtn")?.addEventListener("click", logoutUser);

function registerUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(cred => {
      return setDoc(doc(db, "users", cred.user.uid), {
        name: name,
        email: email,
        role: role
      });
    })
    .then(() => {
      alert("User registered: " + email);
      window.location.href = "login.html";
    })
    .catch(error => alert(error.message));
}

function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      const userRef = doc(db, "users", cred.user.uid);
      return getDoc(userRef);
    })
    .then((userDoc) => {
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === "officer") {
          window.location.href = "officer-dashboard.html";
        } else if (role === "staff") {
          window.location.href = "staff-dashboard.html";
        } else {
          window.location.href = "dashboard.html";
        }
      } else {
        alert("No user record found!");
      }
    })
    .catch((error) => {
      alert(error.message);
    });
  }  

function logoutUser() {
  signOut(auth)
    .then(() => {
      console.log("User logged out");
      window.location.href = "../components/index.html";
    });
}

function authStateListener() {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "../components/login.html";
  });
}

// Attach event listeners
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", e => {
    e.preventDefault();
    registerUser();
  });
}
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    loginUser();
  });
}

export {
  loginUser,
  logoutUser,
  registerUser,
  authStateListener
}
