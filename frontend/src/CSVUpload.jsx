import React, { useState } from "react";
import { CSVReader } from "react-csv-reader";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const CSVUpload = ({ onUpload }) => {
  const [csvData, setCSVData] = useState(null);

  const handleDrop = async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileId = uuidv4(); // Generate a unique identifier for this file
      const chunkSize = 10 * 1024 * 1024; // 10MB chunk size
      const totalChunks = Math.ceil(file.size / chunkSize);
      let start = 0;
      let chunkIndex = 0; // Chunk index starts from 0

      if (file.size > 10 * 1024 * 1024) {
        while (start < file.size) {
          const chunk = file.slice(start, start + chunkSize);
          await uploadChunk(chunk, fileId, chunkIndex, totalChunks, file.name);
          start += chunkSize;
          chunkIndex++; // Increment the chunkIndex for each chunk
        }
      } else {
        // If the file is smaller than 10MB, handle it normally without chunking
        uploadFile(file);
      }
    }
  };

  const uploadChunk = async (
    chunk,
    fileId,
    chunkIndex,
    totalChunks,
    originalFileName
  ) => {
    const formData = new FormData();
    formData.append("file", chunk);
    formData.append("fileId", fileId); // Unique file ID
    formData.append("chunkIndex", chunkIndex); // Index of this chunk
    formData.append("totalChunks", totalChunks); // Total number of chunks
    formData.append("originalFileName", originalFileName); // Original file name

    try {
      const response = await axios.post(
        "http://localhost:3001/uploadChunk",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Chunk uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading chunk:", error);
    }
  };

  // Existing logic extracted to a new function for uploading a single file or chunk
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("File uploaded successfully:", response.data);

      if (onUpload) {
        onUpload(response.data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleParse = (data) => {
    // Pass the parsed CSV data to the parent component
    if (onUpload) {
      onUpload(data);
    }
  };

  return (
    <div>
      <Dropzone handleDrop={handleDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} style={dropzoneStyles}>
            <input {...getInputProps()} />
            <p>Drag and drop CSV files here, or click to select files</p>
          </div>
        )}
      </Dropzone>
      {csvData && (
        <CSVReader
          data={csvData}
          parserOptions={{ header: true }}
          onFileLoaded={handleParse}
        />
      )}
    </div>
  );
};

const Dropzone = ({ handleDrop, children }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: ".csv",
  });

  return (
    <div {...getRootProps()}>{children({ getRootProps, getInputProps })}</div>
  );
};

const dropzoneStyles = {
  border: "2px dashed #cccccc",
  borderRadius: "4px",
  padding: "20px",
  textAlign: "center",
  cursor: "pointer",
};

export default CSVUpload;
