import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import { PubSub } from '@google-cloud/pubsub';

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();
const pubsub = new PubSub();

// Function triggered when a new user signs up
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
});

// Function to generate signed URLs for video uploads
exports.getUploadUrl = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }

  const bucket = storage.bucket(functions.config().storage.bucket);
  const fileName = `${context.auth.uid}/${Date.now()}_${data.fileName}`;
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000 // 15 minutes
  });

  return { url, fileName };
});

// Function triggered when a new video is uploaded
exports.processVideo = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  if (!filePath) return;

  // Only process video files
  if (!object.contentType?.startsWith('video/')) return;

  const userId = filePath.split('/')[0];
  const videoId = filePath.split('/')[1];

  // Send message to video processing service
  const dataBuffer = Buffer.from(JSON.stringify({
    bucketName: object.bucket,
    objectName: object.name,
    userId,
    videoId
  }));

  await pubsub.topic(functions.config().pubsub.videoProcessingTopic).publish(dataBuffer);
});

// Function triggered when video processing is complete
exports.updateVideoStatus = functions.pubsub
  .topic(functions.config().pubsub.videoProcessingTopic)
  .onPublish(async (message) => {
    const { userId, videoId, status, resolutions } = message.json;

    await db.collection('videos').doc(videoId).update({
      status,
      resolutions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });