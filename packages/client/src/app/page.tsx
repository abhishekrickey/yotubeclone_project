import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import VideoCard from '@/components/VideoCard';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  userId: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const videosRef = collection(db, 'videos');
      const q = query(videosRef);
      const querySnapshot = await getDocs(q);
      const videosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Video));
      setVideos(videosList);
    };

    fetchVideos();
  }, []);

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </main>
  );
}