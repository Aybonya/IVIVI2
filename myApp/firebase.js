import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC0SYxZNJbVYuK94qznywhVM1FytLMvil0",
  authDomain: 'ivivi-dc4c7.firebaseapp.com',
  projectId: 'ivivi-dc4c7',
  storageBucket: 'ivivi-dc4c7.firebasestorage.app',
  messagingSenderId: '166156709765',
  appId: '1:166156709765:web:15d8497797aa223261eec',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    const { getReactNativePersistence, initializeAuth } = require('firebase/auth/react-native');

    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export const defaultProfile = {
  avatarUrl: '',
  firstName: '',
  lastName: '',
  gender: '',
  disabilities: '',
  hideDisabilities: false,
  occupation: '',
  email: '',
  createdAt: null,
};

export { app, auth, db, storage };

export async function registerUser(email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await createUserProfileDocument(credential.user.uid, {
    email: credential.user.email ?? email,
  });

  return credential.user;
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function createUserProfileDocument(uid, overrides = {}) {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      ...defaultProfile,
      ...overrides,
      createdAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(
    userRef,
    {
      ...overrides,
    },
    { merge: true }
  );
}

export async function loadUserProfile(uid, email = '') {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const initialProfile = {
      ...defaultProfile,
      email,
    };

    await setDoc(userRef, {
      ...initialProfile,
      createdAt: serverTimestamp(),
    });

    return initialProfile;
  }

  return {
    ...defaultProfile,
    ...snapshot.data(),
    email: snapshot.data().email ?? email,
  };
}

export async function saveUserProfile(uid, profile) {
  const userRef = doc(db, 'users', uid);

  await setDoc(
    userRef,
    {
      ...defaultProfile,
      ...profile,
    },
    { merge: true }
  );
}

function uriToBlob(uri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError('Failed to convert image to uploadable blob.'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

export async function uploadAvatarAsync(uid, uri) {
  const blob = await uriToBlob(uri);
  const avatarRef = ref(storage, `avatars/${uid}/${Date.now()}.jpg`);

  await uploadBytes(avatarRef, blob, {
    contentType: 'image/jpeg',
  });

  if (typeof blob.close === 'function') {
    blob.close();
  }

  return getDownloadURL(avatarRef);
}
