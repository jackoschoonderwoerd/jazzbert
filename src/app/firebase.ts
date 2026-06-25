import { isDevMode } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'jazzfry-c0727',
  appId: 'YOUR_APP_ID',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const functions = getFunctions(app, 'us-central1');

if (isDevMode()) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

// import { isDevMode } from '@angular/core';
// import { getApp, getApps, initializeApp } from 'firebase/app';
// import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

// const firebaseConfig = {
//   apiKey: 'YOUR_API_KEY',
//   authDomain: 'YOUR_PROJECT.firebaseapp.com',
//   projectId: 'jazzfry-c0727',
//   appId: 'YOUR_APP_ID',
// };

// const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// export const functions = getFunctions(app, 'us-central1');

// if (isDevMode()) {
//   connectFunctionsEmulator(functions, '127.0.0.1', 5001);
// }