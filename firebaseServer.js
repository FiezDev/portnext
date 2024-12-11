import admin from 'firebase-admin';
import functions from 'firebase-functions';
import next from 'next';
import config from './next.config';

admin.initializeApp();

const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev,
  conf: config,
});
const handle = app.getRequestHandler();

const server = functions.https.onRequest((request, response) => {
  console.log('File: ' + request.originalUrl);
  return app.prepare().then(() => handle(request, response));
});

exports.nextjs = { server };