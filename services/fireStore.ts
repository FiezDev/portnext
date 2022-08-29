import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
} from 'firebase/firestore';
import { useState } from 'react';
import config from '../config.json';

const firebaseConfig = config.Firebase;
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
//   measurementId: process.env.FIREBASE_MEASUREMENT_ID,
// };

const app = initializeApp(firebaseConfig);
const DBref = getFirestore(app);

const useFirebase = () => {
  const [projectQuantity, setprojectQuantity] = useState(0);

  async function setProject(data: object, name: string) {
    try {
      await setDoc(doc(DBref, 'Projects', name), data);
      console.log('Error When setProject');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  async function getProject(refname: string) {
    const docRef = doc(DBref, 'Projects', refname);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data());
      return docSnap.data();
    } else {
      console.log('No such document!');
    }
  }

  async function getAllProject() {
    let quan = projectQuantity;
    const _query = query(collection(DBref, 'Projects'));
    const querySnapshot = await getDocs(_query);
    querySnapshot.forEach((doc) => {
      quan++;
      console.log(doc.data(), ' => ', doc.data());
    });
    console.log(quan);
    return quan;
  }

  return { setProject, getProject, getAllProject };
};

export default useFirebase;
