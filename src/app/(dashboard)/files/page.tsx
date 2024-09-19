'use client';
import React, { useState, useEffect } from 'react';
import { Blocks } from 'react-loader-spinner';

const VideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Control modal visibility
  const [currentVideo, setCurrentVideo] = useState(null); // Store the video being edited
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  // Checkbox states
  const [checkedVideos, setCheckedVideos] = useState({});

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/retrieve');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const data = await response.json();
        const parsedBody = JSON.parse(data.body);
        setVideos(parsedBody.items);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleEditClick = (video) => {
    setCurrentVideo(video); // Set the video to be edited
    setEditedTitle(video.title || '');
    setEditedDescription(video.description || ''); // Assuming you have a description field
    setIsEditing(true); // Open the modal
  };

  const handleSave = () => {
    // Save the edited video details (this is a placeholder, you can add API integration)
    console.log('Updated Title:', editedTitle);
    console.log('Updated Description:', editedDescription);

    // Update the video details locally
    const updatedVideos = videos.map((video) =>
      video.id === currentVideo.id
        ? { ...video, title: editedTitle, description: editedDescription }
        : video
    );
    setVideos(updatedVideos);

    setIsEditing(false); // Close the modal
  };

  const handleCancel = () => {
    setIsEditing(false); // Close the modal without saving
  };

  const handleCheckboxChange = (videoId) => {
    setCheckedVideos((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Blocks height="80" width="80" color="#3498db" ariaLabel="loading" />
        <p className="mt-4 text-lg font-semibold text-gray-600">Loading</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-gray-700 font-bold mb-4">Video List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded shadow p-4 flex flex-col justify-between">
            <h2 className="font-semibold text-gray-700 mb-2">{video.title || 'Untitled Video'}</h2>
            <video
              width="100%"
              height="200"
              controls
              src={video.s3Link}
              title={video.title}
              className="mb-4"
            >
              Your browser does not support the video tag.
            </video>

            {/* Edit and Delete Buttons */}
            <div className="flex justify-between items-center mt-2">
              {/* Checkbox */}
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="appearance-none h-5 w-5 border border-gray-300 rounded-sm checked:bg-green-500 checked:border-transparent focus:outline-none"
                  checked={checkedVideos[video.id] || false}
                  onChange={() => handleCheckboxChange(video.id)}
                />
                <span className="ml-2 text-gray-700">{checkedVideos[video.id] ? 'Active' : 'Inactive'}</span>
              </label>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditClick(video)}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
                >
                  編集
                </button>
                <button
                  onClick={() => console.log(`Delete video with ID: ${video.id}`)}
                  className="bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && currentVideo && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-xl text-gray-700 font-bold mb-4">Edit Video</h2>
            <video
              width="100%"
              height="200"
              controls
              src={currentVideo.s3Link}
              title={currentVideo.title}
              className="mb-4"
            >
              Your browser does not support the video tag.
            </video>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Description</label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
