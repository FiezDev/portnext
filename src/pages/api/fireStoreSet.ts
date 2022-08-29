import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import config from '../../../config.json';

const firebaseConfig = config.Firebase;
const app = initializeApp(firebaseConfig);
const DBref = getFirestore(app);

export default async function handler(
  collections: string,
  data: object,
  name: string
) {
  try {
    await setDoc(doc(DBref, collections, name), data);
    console.log('Error When setProject');
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}
