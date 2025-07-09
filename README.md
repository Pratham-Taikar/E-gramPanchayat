# Digital E Gram Panchayat System

A fully functional web application for managing digital governance services at the village level — enabling citizens to apply for services online, staff members to process applications, and officers to manage available services and schemes.

---

## Features

**User Dashboard**
- View available government services
- Apply for services
- Track live application status
- Cancel pending applications
- Update personal profile (name, mobile)

**Staff Dashboard**
- View all citizen applications
- Approve / Reject / Return applications
- Update application statuses in real-time

**Officer Dashboard**
- Create, view, and delete new government services/schemes
- Manage citizen applications
- Approve / Reject / Return service requests

--> **Real-Time Updates** via Firestore listeners  
--> **Activity Logging** via a custom `logger.js` into a logs file  
--> Clean and responsive UI with modular role-based dashboards

---

## Technologies Used

- HTML, CSS, JavaScript
- Firebase Authentication
- Firebase Firestore Database
- Firebase Hosting (optional)
- Modular ES6 Imports
- Environment Variable Handling (supports both `config.js` and `.env` setups)

---

## 📁 Project Structure

```text
/firebase/
  config.js
  firebase-config.js
/assets/
  /css/
    style.css
  /js/
    user.js
    staff.js
    officer.js
    auth.js
    app.js
    logger.js
/components/
  login.html
  signup.html
  index.html
  user-dashboard.html
  staff-dashboard.html
  officer-dashboard.html
README.md
package-lock.json
package.json
```
---

## 🔥 Firebase Initial Setup Guide

Before running this project, you need to set up a Firebase project and configure your services. Follow these steps:

### Step 1: Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project**
3. Enter your project name (example: `e-grampanchayat`)
4. Disable Google Analytics if not needed
5. Click **Create Project**

---

### Step 2: Register a Web App
1. Inside your Firebase project dashboard, click the **Web (</>) icon**
2. Enter a nickname for your app
3. Click **Register App**

---

### Step 3: Add Firebase SDKs to Your Project
Copy the `firebaseConfig` values shown on screen  
**(apiKey, authDomain, projectId, etc.)**  
You'll need these in your:

- `/firebase/config.js` (if using config file)

---

### Step 4: Enable Required Firebase Services

In your Firebase Console → Go to **Build** section:
- 📦 **Authentication** → Enable **Email/Password** sign-in method
- 📦 **Firestore Database** → Click **Create Database**
  - Start in **Test Mode**
  - Choose your location and proceed

---

## Environment Variable Setup

for handling sensitive Firebase config:

---

### Using `config.js` (for static hosting / plain HTML+JS)

Create `/firebase/config.js`:
```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};
```
---

## Add this file to .gitignore to prevent pushing sensitive keys:
```javascript
/firebase/config.js
```
---

## Then import this in your /firebase/firebase-config.js:

```javascript

import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### How to Run
For static HTML+JS
Clone the repository
Add your Firebase config to /firebase/config.js
Open index.html in your browser

## Logs

All application activities like logins, service creations, application updates are logged via logger.js
Logs can be saved to a logs/log.txt file (if hosted with Node server or cloud function)

## Author

**Pratham Taikar** - https://github.com/Pratham-Taikar

