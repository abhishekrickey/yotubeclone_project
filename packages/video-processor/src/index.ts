import express from 'express';
import { PubSub } from '@google-cloud/pubsub';
import { Storage } from '@google-cloud/storage';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
const pubsub = new PubSub();
const storage = new Storage();

const BUCKET_NAME = process.env.BUCKET_NAME || 'your-bucket-name';
const VIDEO_PROCESSING_TOPIC = process.env.VIDEO_PROCESSING_TOPIC || 'video-processing';

interface VideoMessage {
  bucketName: string;
  objectName: string;
  userId: string;
  videoId: string;
}

app.post('/process-video', express.json(), async (req, res) => {
  const message: VideoMessage = req.body;

  try {
    const inputFile = storage.bucket(message.bucketName).file(message.objectName);
    const outputBucket = storage.bucket(BUCKET_NAME);

    // Process video for different resolutions
    const resolutions = [
      { height: 360, suffix: '360p' },
      { height: 720, suffix: '720p' }
    ];

    for (const resolution of resolutions) {
      const outputFileName = `${message.userId}/${message.videoId}/${resolution.suffix}.mp4`;
      const outputFile = outputBucket.file(outputFileName);
      const outputStream = outputFile.createWriteStream();

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(inputFile.createReadStream())
          .size(`?x${resolution.height}`)
          .videoBitrate('1000k')
          .audioBitrate('128k')
          .format('mp4')
          .on('end', resolve)
          .on('error', reject)
          .pipe(outputStream);
      });

      // Make the processed video public
      await outputFile.makePublic();
    }

    // Notify completion via Pub/Sub
    const dataBuffer = Buffer.from(JSON.stringify({
      userId: message.userId,
      videoId: message.videoId,
      status: 'processed',
      resolutions: resolutions.map(r => r.suffix)
    }));

    await pubsub.topic(VIDEO_PROCESSING_TOPIC).publish(dataBuffer);
    res.status(200).send('Video processing completed');
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).send('Error processing video');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Video processing service listening on port ${port}`);
});