import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import config from '../../../config.json';

const firebaseConfig = config.Firebase;
const app = initializeApp(firebaseConfig);
const DBref = getFirestore(app);

export default async function handler(collections: string, refname: string) {
  const docRef = doc(DBref, collections, refname);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log('Document data:', docSnap.data());
    return docSnap.data();
  } else {
    console.log('No such document!');
  }
}
