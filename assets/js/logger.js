import { db } from "../../firebase/firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Logs to 'logs' collection in Firestore
function logEvent(userId, eventType, details) {
  const logsRef = collection(db, "logs");
  addDoc(logsRef, {
    userId: userId,
    eventType: eventType,
    details: details,
    timestamp: serverTimestamp()
  });
}

export { logEvent };
