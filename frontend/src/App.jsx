import React, { useState } from "react";
import CSVUpload from "./CSVUpload";

const App = () => {
  const [uploadedData, setUploadedData] = useState(null);

  const handleUpload = (data) => {
    setUploadedData(data);
    // Process the uploaded data as needed
    console.log("Uploaded CSV data:", data);
  };

  return (
    <div>
      <h1>CSV File Upload</h1>
      <CSVUpload onUpload={handleUpload} />
      {/* Render the uploaded data as needed */}
      {uploadedData && (
        <div>
          <h2>Uploaded Data</h2>
          <pre>{JSON.stringify(uploadedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
