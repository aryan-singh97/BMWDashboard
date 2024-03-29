import React, { useState } from "react";
import { CSVReader } from "react-csv-reader";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const CSVUpload = ({ onUpload }) => {
  const [csvData, setCSVData] = useState(null);

  const handleDrop = async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Make HTTP request to upload file
        const response = await axios.post(
          "http://localhost:3001/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Handle successful upload
        console.log("File uploaded successfully:", response.data);

        // Pass the parsed CSV data to the parent component
        if (onUpload) {
          onUpload(response.data);
        }
      } catch (error) {
        // Handle upload error
        console.error("Error uploading file:", error);
      }
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
