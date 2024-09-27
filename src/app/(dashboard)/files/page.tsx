'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Fetch videos from the API
  const fetchVideos = async () => {
    try {
      const response = await fetch('https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/retrieve');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      const parsedBody = JSON.parse(data.body);
      setVideos(parsedBody.items);
      console.log(parsedBody.items);

       // Set checkedVideos state based on active videos
       const activeVideos = parsedBody.items.filter(video => video.active === "true");
       const newCheckedVideos = activeVideos.reduce((acc, video) => {
         acc[video.id] = true; // or whatever value you want to set
         return acc;
       }, {});
 
       setCheckedVideos((prev) => ({
         ...prev,
         ...newCheckedVideos,
       }));
       
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleEditClick = (video) => {
    setCurrentVideo(video);
    setEditedTitle(video.title || '');
    setEditedDescription(video.description || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updateUrl =`https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/retrieve/update?id=${currentVideo.id}&timestamp=${currentVideo.timestamp}&title=${editedTitle}&desc=${editedDescription}`
    try {
      const response = await fetch(updateUrl, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === currentVideo.id ? { ...video, title: editedTitle, description: editedDescription } : video
        )
      );
      
      setIsEditing(false);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleteConfirmationOpen(false);
      setVideoToDelete(null);
    }

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
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleteConfirmationOpen(false);
      setVideoToDelete(null);
    }
  };

  const handleVideoPlay = (video) => {
    const videoElement = document.getElementById(`video-${video.id}`);
    if (videoElement) {
      videoElement.play();
    }
  };

  const handleSaveAdvertisments = async () => {
    const checkedVideosList = videos.filter((video) => checkedVideos[video.id]);
    const unCheckedVideosList = videos.filter((video) => !checkedVideos[video.id]);
    
    // Create an array of promises for the API calls
    const promises = checkedVideosList.map(async (video) => {
      const updateUrl = `https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/retrieve/update?id=${video.id}&timestamp=${video.timestamp}&active=true`;
      try {
        const response = await fetch(updateUrl, { method: 'POST' });
        if (!response.ok) {
          throw new Error(`Failed to update video ${video.id}`);
        }
        const data = await response.json(); // Optional: Handle the response data if needed
        return data; // Return the response if needed for further processing
      } catch (error) {
        console.error(error.message);
      }
    });

    // Create an array of promises for the API calls
    const promiseUnchecked = unCheckedVideosList.map(async (video) => {
      const uncheckUrl = `https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/retrieve/update?id=${video.id}&timestamp=${video.timestamp}&active=false`;
      try {
        const response = await fetch(uncheckUrl, { method: 'POST' });
        if (!response.ok) {
          throw new Error(`Failed to update video ${video.id}`);
        }
        const data = await response.json(); // Optional: Handle the response data if needed
        return data; // Return the response if needed for further processing
      } catch (error) {
        console.error(error.message);
      }
    });
  
    // Wait for all promises to resolve
    await Promise.all(promises);
    await Promise.all(promiseUnchecked);

    // Optional: Perform any additional actions after all updates
    console.log("Advertisements saved for checked videos.");
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

  const checkedVideosList = videos.filter((video) => checkedVideos[video.id]);
  const uncheckedVideosList = videos.filter((video) => !checkedVideos[video.id]);

  return (
    <div className="containe mx-auto p-4">
      <h1 className="text-2xl text-gray-700 font-bold mb-4">動画</h1>

      {/* Checked Videos Box */}
      <div className="bg-white-100 p-4 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-500">広告動画</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checkedVideosList.length === 0 ? (
            // Placeholder for when there are no videos
            <div className="flex items-center justify-center" style={{ height: '250px', backgroundColor: '#f9fafb', border: '1px dashed #e5e7eb' }}>
              <span className="text-gray-500">No videos available</span>
            </div>
          ) : (
            checkedVideosList.map((video) => (
              <div key={video.id} className="bg-white rounded shadow p-4 flex flex-col justify-between">
                <h2 className="font-semibold text-gray-700 mb-2">{video.title || 'Untitled Video'}</h2>
                <video
                  id={`video-${video.id}`}
                  width="100%"
                  height="200"
                  controls
                  src={video.s3Link} // Directly set the src for loading on refresh
                  title={video.title}
                  className="mb-4"
                  style={{ height: '200px' }} // Ensure the video height remains 200px
                >
                  Your browser does not support the video tag.
                </video>

                <div className="flex justify-between items-center mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="appearance-none h-5 w-5 border border-gray-300 rounded-sm checked:bg-red-500 hover:bg-red-600 checked:border-transparent focus:outline-none cursor-pointer"
                      checked={checkedVideos[video.id] || false}
                      onChange={() => handleCheckboxChange(video.id)}
                    />
                    <span className="ml-2 text-gray-700">外す</span>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="pt-5">
          <button
            onClick={() => handleSaveAdvertisments()}
            className="py-1 px-2 bg-blue-500 hover:bg-blue-600 rounded text-white">
            保存
          </button>
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
                id={`video-${video.id}`}
                width="100%"
                height="100%"
                controls
                src={video.s3Link} // Directly set the src for loading on refresh
                title={video.title}
                className=""
                onPlay={() => handleVideoPlay(video)}
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
                  <span className="ml-1 text-gray-700">使用</span>
                </label>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(video)}
                    className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteConfirmation(video)}
                    className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Edit Video</h2>
            <label className="block mb-2">Title:</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="border rounded w-full p-2 mb-4"
            />
            <label className="block mb-2">Description:</label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="border rounded w-full p-2 mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this video?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded mr-2"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteConfirmationOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-4 rounded"
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
