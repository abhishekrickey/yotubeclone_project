import { useState } from 'react';
import { auth, storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

export default function UploadVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !auth.currentUser) return;

    try {
      setUploading(true);
      
      // Upload video to storage
      const videoRef = ref(storage, `videos/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(videoRef, file);
      const videoUrl = await getDownloadURL(videoRef);

      // Create video document in Firestore
      await addDoc(collection(db, 'videos'), {
        title: file.name,
        description: '',
        videoUrl,
        thumbnailUrl: '',
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        status: 'processing'
      });

      setFile(null);
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
}