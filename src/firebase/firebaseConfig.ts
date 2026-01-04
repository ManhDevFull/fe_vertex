// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, type Auth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

const requiredConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
};

export const firebaseConfigReady = Object.values(requiredConfig).every(Boolean);

if (!firebaseConfigReady && typeof window !== "undefined") {
  console.warn("Firebase config is missing. Check NEXT_PUBLIC_* env values.");
}

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

let authInstance: Auth | null = null;
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

export const getAuthClient = (): Auth => {
  if (!authInstance) {
    authInstance = getAuth(app);
    authInstance.languageCode = "vi";
  }
  return authInstance;
};

export const getAnalyticsClient = () => {
  if (typeof window !== "undefined" && !analyticsInstance) {
    analyticsInstance = getAnalytics(app);
  }
  return analyticsInstance;
};

export { storage };
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});
googleProvider.addScope("email");
googleProvider.addScope("profile");

facebookProvider.addScope("email");
facebookProvider.addScope("public_profile");
facebookProvider.setCustomParameters({
  display: "popup",
});
