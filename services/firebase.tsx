import firebase from 'firebase/compat/app';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, getBlob } from 'firebase/storage';
import { useState } from 'react';
import config from '@/context/config.json';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

const firebaseConfig = config.Firebase;
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);
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

  async function getStorage(fileRef: string) {
    let data;
    const starsRef = ref(storage, fileRef);
    try {
      data = await getBlob(starsRef);
    } catch (error) {
      switch (error) {
        case 'storage/object-not-found':
          break;
        case 'storage/unauthorized':
          break;
        case 'storage/canceled':
          break;
        case 'storage/unknown':
          break;
      }
    }
    return data;
  }

  return { getStorage, setProject, getProject, getAllProject };
};

export default useFirebase;
