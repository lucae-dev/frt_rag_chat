// src/components/FileUpload/FileUpload.jsx

import React, { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onFileSend }) {
  const [file, setFile] = useState(null);

  const handleFileSelect = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleConfirm = () => {
    if (file) {
      onFileSend(file);
      setFile(null); // Reset after sending
    }
  };

  return (
    <div className="file-upload">
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {file ? (
          <p>Selected File: {file.name}</p>
        ) : (
          <p>Drag and drop a file here, or click to select a file</p>
        )}
        <input type="file" onChange={handleFileSelect} />
      </div>
      {file && (
        <button onClick={handleConfirm} className="confirm-button">
          Confirm and Send
        </button>
      )}
    </div>
  );
}

export default FileUpload;