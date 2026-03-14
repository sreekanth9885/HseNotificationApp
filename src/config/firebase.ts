// config/firebase.ts

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import storage from '@react-native-firebase/storage';

console.log('🔥 Firebase ready');

// DO NOT initialize manually
// React Native Firebase auto-initializes using google-services.json

export { firebase, auth, firestore, messaging, storage };
export default firebase;