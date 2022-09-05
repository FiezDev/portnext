import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const _req = {
    collections: req.body.collections,
    name: req.body.name,
    data: {
      name: req.body.name,
      email: req.body.email,
      massage: req.body.massage,
    },
  };
  try {
    setDoc(doc(DBref, _req.collections, _req.name), _req.data);

    res.status(200);
  } catch (e) {
    res.status(405).json({
      status: 'failure',
      message: 'Error submitting the enquiry form',
    });
  }
}
