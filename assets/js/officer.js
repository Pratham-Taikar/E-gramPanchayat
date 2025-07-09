import { auth, db } from "../../firebase/firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { logEvent } from "./logger.js";

// Event listeners
document.getElementById("createService")?.addEventListener("click", createService);
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  logEvent(auth.currentUser.uid, "Logout", "Officer logged out.");
  signOut(auth).then(() => window.location.href = "login.html");
});

// Load services on login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    viewServices();
    viewApplications();
  }
});

// Delete a service
function deleteService(serviceId, serviceTitle) {
  const confirmDelete = confirm(`Delete service "${serviceTitle}"?`);
  if (!confirmDelete) return;

  const serviceRef = doc(db, "services", serviceId);
  deleteDoc(serviceRef).then(() => {
    logEvent(auth.currentUser.uid, "Service Deleted", `Deleted service: ${serviceTitle}`);
    viewServices();
  });
}

// Display all services in a clean numbered table
function viewServices() {
  const servicesRef = collection(db, "services");
  getDocs(servicesRef).then(snapshot => {
    const list = document.getElementById("servicesList");
    list.innerHTML = "";
    let count = 1;

    snapshot.forEach(docSnap => {
      const service = docSnap.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${count}</td>
        <td>${service.title}</td>
        <td>${service.description}</td>
        <td>
          <button class="btn delete-btn" data-id="${docSnap.id}" data-title="${service.title}">Delete</button>
        </td>
      `;

      list.appendChild(row);
      count++;
    });

    // Attach delete events
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const title = button.dataset.title;
        deleteService(id, title);
      });
    });
  });
}

function viewApplications() {
  const appsRef = collection(db, "applications");
  getDocs(appsRef).then(snapshot => {
    const list = document.getElementById("applicationsList");
    list.innerHTML = "";
    let count = 1;

    snapshot.forEach(appDoc => {
      const app = appDoc.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${count}</td>
        <td>${app.serviceId}</td>
        <td>${app.userId}</td>
        <td>${app.status}</td>
        <td>
          <button class="btn approve-btn" data-id="${appDoc.id}">Approve</button>
          <button class="btn reject-btn" data-id="${appDoc.id}">Reject</button>
          <button class="btn return-btn" data-id="${appDoc.id}">Return</button>
        </td>
      `;

      list.appendChild(row);
      count++;
    });

    // Attach events
    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        updateApplicationStatus(btn.dataset.id, "Approved");
      });
    });

    document.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        updateApplicationStatus(btn.dataset.id, "Rejected");
      });
    });

    document.querySelectorAll(".return-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        updateApplicationStatus(btn.dataset.id, "Pending");
      });
    });
  });
}

// Update application status + log
function updateApplicationStatus(applicationId, newStatus) {
  const appRef = doc(db, "applications", applicationId);
  updateDoc(appRef, {
    status: newStatus
  }).then(() => {
    logEvent(auth.currentUser.uid, "Application Status Updated", `Application ${applicationId} set to ${newStatus}`);
    viewApplications();
  });
}

document.getElementById("createService")?.addEventListener("click", createService);

document.getElementById("createService").addEventListener("click", () => {
  document.getElementById("createServiceForm").style.display = "block";
});

document.getElementById("cancelServiceBtn").addEventListener("click", () => {
  document.getElementById("createServiceForm").style.display = "none";
  document.getElementById("newServiceTitle").value = "";
  document.getElementById("newServiceDescription").value = "";
});

document.getElementById("saveServiceBtn").addEventListener("click", () => {
  const title = document.getElementById("newServiceTitle").value.trim();
  const description = document.getElementById("newServiceDescription").value.trim();

  if (!title || !description) {
    alert("Please fill both fields.");
    return;
  }

  const servicesRef = collection(db, "services");
  addDoc(servicesRef, {
    title: title,
    description: description,
    createdAt: serverTimestamp()
  }).then(() => {
    logEvent(auth.currentUser.uid, "Service Created", `Service: ${title}`);
    alert("Service created successfully.");
    viewServices();
    document.getElementById("createServiceForm").style.display = "none";
    document.getElementById("newServiceTitle").value = "";
    document.getElementById("newServiceDescription").value = "";
  });
});

