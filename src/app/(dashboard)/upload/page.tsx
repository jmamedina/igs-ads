'use client';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';


const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);

  const PART_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // Set to 500 MB

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.size > 0 && selectedFile.size <= MAX_FILE_SIZE && isValidVideoFile(selectedFile)) {
        setFile(selectedFile);
        setError(null);
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
      } else {
        setError(selectedFile.size > MAX_FILE_SIZE ? 'File size exceeds 500 MB.' : 'Please select a valid video file.');
      }
    }
  };

  const isValidVideoFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    return validTypes.includes(file.type);
  };

  const clearForm = () => {
    setFile(null);
    setPreview(null);
    setTitle('');
    setDescription('');
    setError(null);
  };

  const getUniqueFileName = (originalName) => {
    const now = new Date();
    const dateTimeString = now.toISOString().replace(/[:.]/g, '-');
    const fileExtension = originalName.split('.').pop();
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));

    return `${baseName}_${dateTimeString}.${fileExtension}`;
  }

  const initiateUpload = async () => {
    if (!file) {
      console.warn('No file selected for upload');
      return;
    }

    toast.info('Upload initiated. Please wait...', { autoClose: true });
    setShowLoadingDialog(true);

    try {
      const uniqueFileName = getUniqueFileName(file.name); // Generate unique filename
      const numberOfParts = Math.ceil(file.size / PART_SIZE);

      const response = await fetch('https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/upload/pre-signed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: uniqueFileName,
          fileType: file.type,
          fileSize: file.size,
          numberOfParts: numberOfParts,
        }),
      });

      const responseBody = await response.text();

      if (!response.ok) {
        console.error('Error initiating upload:', responseBody);
        throw new Error('Failed to initiate upload');
      }

      const data = JSON.parse(responseBody);
      const { statusCode, body } = data;

      if (!body) {
        console.error('No body in the response:', data);
        throw new Error('Missing body in response');
      }

      const bodyData = JSON.parse(body);
      const { uploadId, presignedUrls } = bodyData;

      await uploadParts(presignedUrls, numberOfParts, uploadId, uniqueFileName);
      toast.success('Upload completed successfully!');
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
      setError(error.message);
    } finally {
      setShowLoadingDialog(false);
    }
  };

  const uploadParts = async (presignedUrls, numberOfParts, uploadId, uniqueFileName) => {
    setUploading(true);
    const partETags = new Array(numberOfParts).fill(null);
    let successfulUploads = 0;

    try {
      const uploadPromises = Array.from({ length: numberOfParts }, async (_, index) => {
        const partNumber = index + 1;
        const part = presignedUrls[index];

        if (!part || !part.presignedUrl) {
          console.error(`Part ${partNumber} is undefined or missing presignedUrl.`);
          return; // Skip to the next part
        }

        try {
          const partBody = file.slice((partNumber - 1) * PART_SIZE, Math.min(partNumber * PART_SIZE, file.size));
          const etag = await uploadPartWithRetry(part.presignedUrl, partBody);
          if (etag) {
            partETags[partNumber - 1] = { ETag: etag.replace(/"/g, ''), PartNumber: partNumber };
            successfulUploads++;
          }
        } catch (error) {
          console.error(`Error uploading part ${partNumber}:`, error);
        }
      });

      await Promise.all(uploadPromises);

      if (successfulUploads !== numberOfParts) {
        throw new Error(`Uploaded parts (${successfulUploads}) do not match expected parts (${numberOfParts}).`);
      }

      await finalizeUpload(partETags.filter(Boolean), uploadId, uniqueFileName);
    } catch (uploadError) {
      console.error('Error uploading parts:', uploadError);
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  const uploadPartWithRetry = async (url, body) => {
    const maxRetries = 3;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(url, {
        method: 'PUT',
        body,
      });

      if (response.ok) {
        return response.headers.get('ETag');
      } else {
        const errorBody = await response.text();
        console.error(`Attempt ${attempt} failed for part upload: ${errorBody}`);
        await delay(1000 * Math.pow(2, attempt - 1)); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded for part upload.');
  };

  const finalizeUpload = async (partETags, uploadId, uniqueFileName) => {
    try {
      const response = await fetch('https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/upload/final-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          bucketName: 'igs-test-ads',
          key: uniqueFileName,
          parts: partETags,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error finalizing upload:', { status: response.status, errorBody });
        throw new Error('Failed to finalize upload');
      }

      const data = await response.json();
      // Create the payload for DynamoDB
      const dynamoDBPayload = {
        id: uuidv4(),
        title: title,           // Include title
        description: description, // Include description
        s3Key: uniqueFileName,   // S3 key of the uploaded file
        uploadTimestamp: new Date().toISOString(), // Timestamp of the upload
      };

      // Upload metadata to DynamoDB
      await uploadToDynamoDB(dynamoDBPayload);

      clearForm(); // Clear the file after successful upload
    } catch (error) {
      console.error('Error during finalize upload:', error);
      setError(error.message);
    }
  };

  const uploadToDynamoDB = async (payload) => {

    console.log(" JSON.stringify(payload)",  JSON.stringify(payload))
    try {
      const response = await fetch('https://347egpwx2j.execute-api.ap-northeast-1.amazonaws.com/test/upload/metadata-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error uploading to DynamoDB:', { status: response.status, errorBody });
        throw new Error('Failed to upload metadata to DynamoDB');
      }
    } catch (error) {
      console.error('Error during DynamoDB upload:', error);
      throw error; // Re-throw the error to be handled in finalizeUpload
    }
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="w-12 h-12 text-gray-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 16h-3v5h-2v-5h-3l4-4 4 4zm3.479-5.908c-.212-3.951-3.473-7.092-7.479-7.092s-7.267 3.141-7.479 7.092c-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h3.5v-2h-3.5c-1.93 0-3.5-1.57-3.5-3.5 0-2.797 2.479-3.833 4.433-3.72-.167-4.218 2.208-6.78 5.567-6.78 3.357 0 5.734 2.56 5.567 6.78 1.954-.113 4.433.923 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5h-3.5v2h3.5c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408z" />
            </svg>
            <p className="text-gray-500">Drag & drop your video here or click to select</p>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-2 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Description</label>
          <textarea
            className="border border-gray-300 rounded-md p-2 w-full"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {preview && (
        <>
          <video className="mt-4 w-full" controls src={preview} />
          <button onClick={clearForm} className="m-2 p-2 rounded bg-red-500 text-white hover:bg-red-600">
            Clear
          </button>
        </>
      )}

      {file && (
        <button
          onClick={initiateUpload}
          disabled={uploading}
          className={`mt-6 p-2 rounded bg-blue-500 text-white font-bold
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
          `}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      )}

      <ToastContainer />
      {showLoadingDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-lg">Uploading video... Please wait.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
