import { auth, db } from "../../firebase/firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { logEvent } from "../../assets/js/logger.js";


document.getElementById("logoutBtn").addEventListener("click", () => {
  console.log(auth)
  signOut(auth).then(() => {
    logEvent(auth.currentUser, "Logout", "Staff logged out.");
    window.location.href = "login.html";
  });
  
});

function viewAllApplications() {
  const appsRef = collection(db, "applications");
  getDocs(appsRef).then(snapshot => {
    const list = document.getElementById("applicationsList");
    list.innerHTML = "";

    snapshot.forEach(appDoc => {
      const appData = appDoc.data();
      const appDiv = document.createElement("div");
      appDiv.className = "application-box";

      appDiv.innerHTML = `
        <p><strong>Application ID:</strong> ${appDoc.id}</p>
        <p><strong>Name of Applicant:</strong> ${appData.serviceId}</p>
        <p><strong>User ID:</strong> ${appData.userId}</p>
        <p><strong>Status:</strong> <span id="status-${appDoc.id}">${appData.status}</span></p>
        <div id="action-btns-${appDoc.id}"></div>
      `;

      list.appendChild(appDiv);

      const actionsDiv = document.getElementById(`action-btns-${appDoc.id}`);

      if (appData.status === "Pending") {
        const approveBtn = document.createElement("button");
        approveBtn.textContent = "Approve";
        approveBtn.className = "btn approve-btn";
        approveBtn.addEventListener("click", () => {
          updateApplicationStatus(appDoc.id, "Approved");
        });

        const rejectBtn = document.createElement("button");
        rejectBtn.textContent = "Reject";
        rejectBtn.className = "btn reject-btn";
        rejectBtn.addEventListener("click", () => {
          updateApplicationStatus(appDoc.id, "Rejected");
        });

        actionsDiv.appendChild(approveBtn);
        actionsDiv.appendChild(rejectBtn);
      } else {
        // If already approved/rejected, show Update button
        const updateBtn = document.createElement("button");
        updateBtn.textContent = "Update";
        updateBtn.className = "btn update-btn";
        updateBtn.addEventListener("click", () => {
          const newStatus = prompt("Enter new status (Pending, Approved, Rejected):");
          if (["Pending", "Approved", "Rejected"].includes(newStatus)) {
            updateApplicationStatus(appDoc.id, newStatus);
          } else {
            alert("Invalid status.");
          }
        });
        actionsDiv.appendChild(updateBtn);
      }
    });
  });
}

function updateApplicationStatus(applicationId, newStatus) {
  const appRef = doc(db, "applications", applicationId);
  updateDoc(appRef, {
    status: newStatus
  }).then(() => {
    logEvent(auth.currentUser.uid, "Application Status Updated", `Application ${applicationId} set to ${newStatus}`);
    alert(`Application ${applicationId} updated to ${newStatus}`);
    viewAllApplications();
  });
  
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    viewAllApplications();
  }
});
