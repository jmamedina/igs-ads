'use client'
import React, { useState } from 'react';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      if (selectedFile.size > 0 && isValidVideoFile(selectedFile)) {
        setFile(selectedFile);
        setError(null);

        // Create a preview URL
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
      } else {
        setError('Please select a valid video file.');
      }
    }
  };

  const isValidVideoFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    return validTypes.includes(file.type);
  };

  const handleUpload = async () => {
    if (file) {
      setUploading(true);

      // Handle upload process (e.g., chunked upload) here
      // For demo purposes, this is just a placeholder
      setTimeout(() => {
        setUploading(false);
        alert('Upload complete!');
      }, 2000);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="p-5 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Your Video</h1>
      <div
        className="border-dashed border-2 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition"
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          className="hidden"
          id="file-input"
          accept="video/*"
          onChange={handleFileChange}
        />
        <label htmlFor="file-input" className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 15.828A4 4 0 0112 16a4 4 0 01-1.828-.172L7.293 16.707a1 1 0 01-1.414-1.414L9.586 12 5.878 8.293A1 1 0 016.293 6.878l3.293 3.293A4 4 0 0112 8a4 4 0 011.828.172l4.707-4.707a1 1 0 011.414 1.414L14.414 8l3.707 3.707a1 1 0 01-1.414 1.414L13.828 15.828z"
            />
          </svg>
          <span className="text-gray-600">Drag and drop your video here, or click to select</span>
        </label>
        {error && <div className="mt-4 text-red-500">{error}</div>}
        {file && (
          <div className="mt-4 text-center">
            <span className="block font-medium text-gray-700">Selected video:</span>
            <span className="text-gray-600">{file.name}</span>
          </div>
        )}
        {preview && (
          <div className="mt-4">
            <video
              src={preview as string}
              controls
              className="max-w-full h-auto rounded-lg shadow-md"
              onError={() => setError('Failed to load video preview.')}
            />
          </div>
        )}
      </div>
      {file && (
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
