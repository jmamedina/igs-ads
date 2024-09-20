'use client';
import React, { useState, useEffect } from 'react';
import { Blocks } from 'react-loader-spinner';

const VideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [checkedVideos, setCheckedVideos] = useState({});

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

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
    setCurrentVideo(video);
    setEditedTitle(video.title || '');
    setEditedDescription(video.description || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedVideos = videos.map((video) =>
      video.id === currentVideo.id
        ? { ...video, title: editedTitle, description: editedDescription }
        : video
    );
    setVideos(updatedVideos);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleCheckboxChange = (videoId) => {
    setCheckedVideos((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  const handleDeleteConfirmation = (video) => {
    setVideoToDelete(video);
    setIsDeleteConfirmationOpen(true);
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;

    const deleteUrl = `https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/retrieve/delete?id=${videoToDelete.id}&timestamp=${videoToDelete.timestamp}&s3key=${videoToDelete.s3Key}`;

    try {
      const response = await fetch(deleteUrl, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      setVideos((prevVideos) => prevVideos.filter((v) => v.id !== videoToDelete.id));
      console.log(`Deleted video with ID: ${videoToDelete.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleteConfirmationOpen(false);
      setVideoToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
    setVideoToDelete(null);
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

  // Filter videos into two rows based on checkbox status
  const checkedVideosList = videos.filter((video) => checkedVideos[video.id]);
  const uncheckedVideosList = videos.filter((video) => !checkedVideos[video.id]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-gray-700 font-bold mb-4">動画</h1>

      {/* Checked Videos Box */}
      <div className="bg-white-100 p-4 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-500 mb-4">広告動画</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checkedVideosList.map((video) => (
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

              <div className="flex justify-between items-center mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="appearance-none h-5 w-5 border border-gray-300 rounded-sm checked:bg-green-500 checked:border-transparent focus:outline-none"
                    checked={checkedVideos[video.id] || false}
                    onChange={() => handleCheckboxChange(video.id)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unchecked Videos Box */}
      <div className="bg-white-100 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-4">動画リスト</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uncheckedVideosList.map((video) => (
            <div key={video.id} className="bg-white rounded shadow p-4 flex flex-col justify-between transform scale-90">
              <h2 className="font-semibold text-gray-700 mb-2">{video.title || 'Untitled Video'}</h2>
              <video
                width="100%"
                height="150"
                controls
                src={video.s3Link}
                title={video.title}
                className="mb-4"
              >
                Your browser does not support the video tag.
              </video>

              <div className="flex justify-between items-center mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="appearance-none h-5 w-5 border border-gray-300 rounded-sm checked:bg-green-500 checked:border-transparent focus:outline-none"
                    checked={checkedVideos[video.id] || false}
                    onChange={() => handleCheckboxChange(video.id)}
                  />
                  <span className="ml-2 text-gray-700">使用</span>
                </label>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(video)}
                    className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteConfirmation(video)}
                    className="bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
              <button onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded">
                Save
              </button>
              <button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmationOpen && videoToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl text-gray-700 font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete the video titled '{videoToDelete.title}'?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
