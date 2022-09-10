import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPNEXT_PUBLIC__ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const DBref = getFirestore(app);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let data: any = [];
  const _collections: string = req.query.colname
  ? req.query.colname as string
  : "";
  const colRef = collection(DBref, _collections);

  try {
    const docsSnap = await getDocs(colRef);
    if (docsSnap.docs.length > 0) {
      docsSnap.forEach((doc) => {
        data.push(doc.data());
      });
      console.log(data);
    }
    return res.status(200).json(data);
  } catch (error) {
    console.log(`error : ${res.status} - message : $re`);
    return res.status(500);
  }
}
