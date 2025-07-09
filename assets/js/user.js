import { auth, db } from "../../firebase/firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { logEvent } from "../../assets/js/logger.js";


// Logout button
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    logEvent(auth.currentUser.uid, "Logout", "User logged out.");
    window.location.href = "login.html";
  });    
});

// Fetch services with Apply/Status management
function searchServices() {
  const servicesRef = collection(db, "services");
  getDocs(servicesRef).then(snapshot => {
    const list = document.getElementById("servicesList");
    list.innerHTML = "";

    snapshot.forEach(serviceDoc => {
      const service = serviceDoc.data();
      const serviceDiv = document.createElement("div");
      serviceDiv.className = "service-box";

      serviceDiv.innerHTML = `
        <h4>${service.title}</h4>
        <p>${service.description}</p>
        <div id="action-${serviceDoc.id}"></div>
      `;

      list.appendChild(serviceDiv);

      checkApplicationStatus(serviceDoc.id);
    });
  });
}

// Apply for a service
function applyForService(serviceId) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login first.");
    return;
  }

  const applicationsRef = collection(db, "applications");
  addDoc(applicationsRef, {
    userId: user.uid,
    serviceId: serviceId,
    status: "Pending",
    appliedAt: new Date()
  }).then(() => {
    logEvent(user.uid, "Application Submitted", `Applied for service ${serviceId}`);
    searchServices();
  });
}

function cancelApplication(applicationId, serviceId) {
  const appRef = doc(db, "applications", applicationId);
  deleteDoc(appRef).then(() => {
    logEvent(auth.currentUser.uid, "Application Cancelled", `Cancelled application for service ${serviceId}`);
    searchServices();
  });
}


// Check and display status (or Apply button)
function checkApplicationStatus(serviceId) {
  const user = auth.currentUser;
  const applicationsRef = collection(db, "applications");
  const q = query(applicationsRef, where("userId", "==", user.uid), where("serviceId", "==", serviceId));

  getDocs(q).then(snapshot => {
    const actionDiv = document.getElementById(`action-${serviceId}`);
    actionDiv.innerHTML = "";

    if (snapshot.empty) {
      const applyBtn = document.createElement("button");
      applyBtn.textContent = "Apply";
      applyBtn.className = "btn apply-btn";
      applyBtn.addEventListener("click", () => {
        applyForService(serviceId);
      });
      actionDiv.appendChild(applyBtn);
    } else {
      snapshot.forEach(appDoc => {
        displayLiveStatus(appDoc.id, serviceId);
      });
    }
  });
}

// Real-time status display with Cancel button if pending
function displayLiveStatus(applicationId, serviceId) {
  const appRef = doc(db, "applications", applicationId);
  const actionDiv = document.getElementById(`action-${serviceId}`);

  const statusSpan = document.createElement("span");
  statusSpan.className = "status-text";
  actionDiv.appendChild(statusSpan);

  onSnapshot(appRef, (docSnap) => {
    if (!docSnap.exists()) {
      searchServices();
      return;
    }

    const status = docSnap.data().status;
    statusSpan.textContent = `Status: ${status}`;

    if (status === "Pending") {
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel Application";
      cancelBtn.className = "btn cancel-btn";
      cancelBtn.style.marginLeft = "10px";
      cancelBtn.addEventListener("click", () => {
        cancelApplication(applicationId, serviceId);
      });
      actionDiv.appendChild(cancelBtn);
    }
  });
}

// View application statuses (on button click)
document.getElementById("viewStatusBtn")?.addEventListener("click", () => {
  const user = auth.currentUser;
  const applicationsRef = collection(db, "applications");
  const q = query(applicationsRef, where("userId", "==", user.uid));

  getDocs(q).then(snapshot => {
    if (snapshot.empty) {
      alert("No applications found.");
    } else {
      let result = "";
      snapshot.forEach(doc => {
        const app = doc.data();
        result += `Service ID: ${app.serviceId} | Status: ${app.status}\n`;
      });
      alert(result);
    }
  });
});

let currentUserData = {}; 

// Protect route + load services
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    fetchUserDetails();
    searchServices();
  }
});

function displayUserDetails() {
  const userInfoDiv = document.getElementById("userInfo");

  userInfoDiv.innerHTML = `
    <h3>Welcome, ${currentUserData.name || "Unnamed User"}</h3>
    <p><strong>Email:</strong> ${currentUserData.mobile}
  `;
}

function fetchUserDetails() {
  const user = auth.currentUser;
  const userRef = doc(db, "users", user.uid);

  onSnapshot(userRef, (docSnap) => {
    currentUserData = docSnap.data();
    displayUserDetails();
  });
}

document.getElementById("viewProfileBtn").addEventListener("click", () => {
  document.getElementById("updateProfileForm").style.display = "block";
});

document.getElementById("cancelProfileBtn").addEventListener("click", () => {
  document.getElementById("updateProfileForm").style.display = "none";
});

document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const user = auth.currentUser;
  const userRef = doc(db, "users", user.uid);

  // Get values
  const newName = document.getElementById("newName").value.trim();
  const newMobile = document.getElementById("newMobile").value.trim();

  // Prepare update object only with non-empty fields
  const updateData = {};
  if (newName) updateData.name = newName;
  if (newMobile) updateData.mobile = newMobile;

  if (Object.keys(updateData).length === 0) {
    alert("No changes made.");
    return;
  }

  updateDoc(userRef, updateData)
    .then(() => {
      logEvent(user.uid, "Profile Updated", `Updated fields: ${Object.keys(updateData).join(", ")}`);
      alert("Profile updated successfully.");
      document.getElementById("updateProfileForm").style.display = "none";
      document.getElementById("newName").value = "";
      document.getElementById("newMobile").value = "";
    });
});
