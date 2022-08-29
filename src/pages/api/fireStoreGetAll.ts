import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, query } from 'firebase/firestore';
import config from '../../../config.json';

const firebaseConfig = config.Firebase;
const app = initializeApp(firebaseConfig);
const DBref = getFirestore(app);

export default async function handler(collections: string) {
  let res: any = [];
  const _query = query(collection(DBref, collections));
  const querySnapshot = await getDocs(_query);
  querySnapshot.forEach((doc) => {
    res.push(doc.data());
  });
  console.log(res);
  return res;
}
