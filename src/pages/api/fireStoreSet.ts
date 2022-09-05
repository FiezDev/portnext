import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Access-Control-Allow-Origin', '*');
      myHeaders.append('Access-Control-Allow-Credentials', 'true');
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

      fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: myHeaders,
        body: `secret=6LfBo9IhAAAAAEXlXtgABpwG-CFJz6en-cmtM5Ev&response=${req.body.gRecaptchaToken}`,
      })
        .then((reCaptchaRes) => reCaptchaRes.json())
        .then(async (reCaptchaRes) => {
          console.log(
            reCaptchaRes,
            'Response from Google reCatpcha verification API'
          );
          if (reCaptchaRes?.score > 0.5) {
            const _req = {
              collections: req.body.collections,
              data: req.body.data,
            };

            await db.collection(_req.collections).add(_req.data);

            return res.status(200).json({
              status: 'success',
              message: 'Enquiry submitted successfully',
            });
          } else {
            return res.status(200).json({
              status: 'failure',
              message: 'Google ReCaptcha Failure',
            });
          }
        });
    } catch (err) {
      return res.status(405).json({
        status: 'failure',
        message: 'Error submitting the enquiry form',
      });
    }
  } else {
    res.status(405);
    res.end();
  }
}
