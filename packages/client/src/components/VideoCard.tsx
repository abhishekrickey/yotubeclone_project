interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  userId: string;
}

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={video.thumbnailUrl} 
        alt={video.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
      </div>
    </div>
  );
}