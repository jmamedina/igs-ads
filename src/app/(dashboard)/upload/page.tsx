'use client'
import React, { useState } from 'react';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [uploadId, setUploadId] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.size > 0 && isValidVideoFile(selectedFile)) {
        setFile(selectedFile);
        setError(null);
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

  const initiateUpload = async (filename: string) => {
    try {
      const response = await fetch('https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/upload/initiate', {
        method: 'POST',
        body: JSON.stringify({
          key: "linemo.mp4", // Use the dynamic filename
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Initiate response JSON:', data);

      const parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
      console.log('Parsed body:', parsedBody);

      if (parsedBody && parsedBody.uploadId) {
        setUploadId(parsedBody.uploadId);
        console.log('uploadId set to:', parsedBody.uploadId);
        return parsedBody.uploadId; // Return uploadId
      } else {
        throw new Error('No uploadId in response');
      }
    } catch (error) {
      console.error('Failed to initiate upload:', error);
      setError('Failed to initiate upload.');
      return null;
    }
  };

  const uploadPart = async (partNumber: number, filePart: Blob, uploadId: string, fileKey: string) => {
    if (!uploadId) {
      console.error('uploadId is missing.');
      setError('uploadId is missing');
      return;
    }
  
    const formData = new FormData();
    formData.append('uploadId', uploadId);
    formData.append('partNumber', partNumber.toString());
    formData.append('filePart', filePart, fileKey); // Use the same fileKey for all parts
  
    try {
      const response = await fetch('https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/upload/part', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const rawResponse = await response.text(); // Read response as text
      console.log(`Raw response for part ${partNumber}:`, rawResponse);
  
      // Parse the fixed response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch (error) {
        console.error('Error parsing raw response:', error);
        setError(`Error parsing raw response: ${error}`);
        return;
      }
  
      // Store the ETag for this part
      if (parsedResponse && parsedResponse.body && parsedResponse.body.result && parsedResponse.body.result.ETag) {
        const etag = parsedResponse.body.result.ETag;
        console.log(`ETag for part ${partNumber}: ${etag}`);
        return etag; // Return the ETag to use later in completing the upload
      } else {
        throw new Error('ETag missing in the response');
      }
  
    } catch (error) {
      console.error(`Error uploading part ${partNumber}:`, error);
      setError(`Error uploading part ${partNumber}: ${error}`); // Use error.message for clarity
    }
  };
  
  
  const completeUpload = async (uploadId: string, parts: { ETag: string, PartNumber: number }[], fileKey: string) => {
    try {
      const response = await fetch('https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/upload/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uploadId,
          key: fileKey,
          parts // Pass the ETags and part numbers here
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      alert('Upload completed successfully!');
      // Reset form
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
      setUploadId(null);
    } catch (error) {
      console.error('Failed to complete upload:', error);
      setError('Failed to complete upload.');
    }
  };
  


  const handleUpload = async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }

    let localUploadId = uploadId;

    if (!localUploadId) {
      console.log('No uploadId, initiating upload...');
      try {
        setUploading(true);
        const filename = file.name; // Get the filename from the file state

        localUploadId = await initiateUpload(filename);

        if (!localUploadId) {
          setError('Failed to initiate upload.');
          console.log('uploadId still undefined after initiateUpload.');
          setUploading(false);
          return;
        }

        setUploadId(localUploadId); // Update state
        console.log('Upload initiated successfully with uploadId:', localUploadId);
      } catch (error) {
        console.error('Error during upload initiation:', error);
        setError('Error during upload initiation.');
        setUploading(false);
        return;
      }
    }

    // Proceed with upload
    const chunkSize = 3 * 1024 * 1024; // 5MB chunks
    const numParts = Math.ceil(file.size / chunkSize);

    try {
      for (let i = 0; i < numParts; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const filePart = file.slice(start, end);
        console.log(`Uploading part ${i + 1} of ${numParts}`);
        await uploadPart(i + 1, filePart, localUploadId); // Pass localUploadId here
      }

      console.log('Completing upload');
      await completeUpload(localUploadId); // Pass localUploadId to completeUpload
      console.log('Upload completed successfully');
      setUploading(false);
    } catch (error) {
      console.error('Error during upload process:', error);
      setError('Error uploading part.');
      setUploading(false);
    }
  };


  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setTitle('');
    setDescription('');
    setUploadId(null);
  };

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-700">Upload Your Video</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div
          className={`flex-1 border-dashed border-2 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition
            ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          `}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const droppedFile = e.dataTransfer.files[0];
              setFile(droppedFile);
              setPreview(URL.createObjectURL(droppedFile));
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            type="file"
            className="hidden"
            id="file-input"
            accept="video/*"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              className="w-12 h-12 text-gray-500 mb-4"
              fill="currentColor"
              viewBox="0 0 24 24">
              <path
                d="M16 16h-3v5h-2v-5h-3l4-4 4 4zm3.479-5.908c-.212-3.951-3.473-7.092-7.479-7.092s-7.267 3.141-7.479 7.092c-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h3.5v-2h-3.5c-1.93 0-3.5-1.57-3.5-3.5 0-2.797 2.479-3.833 4.433-3.72-.167-4.218 2.208-6.78 5.567-6.78 3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5h-3.5v2h3.5c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408z" />
            </svg>
            <span className="text-gray-600 text-center">Drag and drop your video here, or click anywhere to select</span>
          </div>
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
          <div className="w-full md:w-80 flex flex-col gap-4 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
              rows={4}
            />
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                onClick={async () => {
                  await initiateUpload();
                  await handleUpload();
                }}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
