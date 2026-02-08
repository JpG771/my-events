// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

import { firebaseConfig } from "./firebase.secret";

// Initialize Firebase
export const firebase: any = {};

firebase.app = initializeApp(firebaseConfig);

// Initialize Analytics only when running in a browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
	try {
		firebase.analytics = getAnalytics(firebase.app);
	} catch (err) {
		// Analytics not supported in this environment (e.g., SSR or unsupported browser)
		firebase.analytics = null;
	}
} else {
	firebase.analytics = null;
}

// Initialize Firebase Authentication and get a reference to the service
firebase.auth = getAuth(firebase.app);

// Initialize Firestore
firebase.firestore = getFirestore(firebase.app);

// Initialize Storage
firebase.storage = getStorage(firebase.app);

// Initialize Messaging (for notifications)
if (typeof window !== 'undefined') {
	isSupported().then((supported) => {
		if (supported) {
			firebase.messaging = getMessaging(firebase.app);
		}
	});
}