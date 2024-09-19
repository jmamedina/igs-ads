import React from 'react';

const VideoPage = () => {
  const videos = [
    { id: 1, title: 'Video 1', url: 'https://igs-test-ads.s3.ap-northeast-1.amazonaws.com/toyota_2024-09-19T09-03-11-168Z.mp4' },
    { id: 2, title: 'Video 2', url: 'https://igs-test-ads.s3.ap-northeast-1.amazonaws.com/linemo_2024-09-19T09-08-53-258Z.mp4' },
    { id: 3, title: 'Video 3', url: 'https://igs-test-ads.s3.ap-northeast-1.amazonaws.com/toyota_2024-09-19T09-03-11-168Z.mp4' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Video List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map(video => (
          <div key={video.id} className="bg-white rounded shadow p-4">
            <h2 className="font-semibold">{video.title}</h2>
            <video
              width="100%"
              height="200"
              controls
              src={video.url}
              title={video.title}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPage;
