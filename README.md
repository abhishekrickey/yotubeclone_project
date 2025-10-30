# YouTube Clone

A YouTube clone built with Next.js, Firebase, and Google Cloud Platform services.

## Features

- User authentication with Google
- Video upload with secure URLs
- Automatic video processing with multiple resolutions
- Video listing and playback
- Real-time status updates

## Tech Stack

- TypeScript
- Next.js
- Express.js
- Docker
- FFmpeg
- Firebase Auth
- Firebase Functions
- Firebase Firestore
- Google Cloud Storage
- Google Cloud Pub/Sub
- Google Cloud Run

## Project Structure

```
youtube-clone/
├── packages/
│   ├── client/               # Next.js frontend
│   ├── functions/            # Firebase Functions
│   └── video-processor/      # Video processing service
├── package.json              # Root package.json for workspaces
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
└── storage.rules            # Storage security rules
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the client directory with your Firebase configuration.

3. Run the development server:
```bash
npm run dev:client
```

## Deployment

1. Deploy Firebase Functions:
```bash
npm run deploy:functions
```

2. Deploy video processor to Cloud Run:
```bash
npm run deploy:video-processor
```

3. Deploy Next.js app:
```bash
npm run deploy:client
```
