import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDlX0XlIiTmqBoRq-whTMlVcw6I1U_XnvY',
  authDomain: 'fiezport.firebaseapp.com',
  databaseURL:
    'https://fiezport-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'fiezport',
  storageBucket: 'fiezport.appspot.com',
  messagingSenderId: '10093093757',
  appId: '1:10093093757:web:50d1a301bc34d3aa086214',
  measurementId: 'G-KK7H46FWTR',
};
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
