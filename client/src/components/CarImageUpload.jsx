import React, { useState, useRef } from 'react';
import '../Styles/styles/CarImageUpload.css';
import { compressImage, validateImageFile } from '../utils/imageOptimization';
import { API_BASE_URL } from '../config/api';

const CarImageUpload = ({ car, onImagesUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem('userId');

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      uploadImages(Array.from(files));
    }
  };

  const uploadImages = async (files) => {
    if (!userId) {
      alert('Please log in to upload images');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    try {
      // Validate and compress images
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          validateImageFile(file);
          const compressedFile = await compressImage(file);
          return new File([compressedFile], file.name, { type: file.type });
        })
      );
      
      processedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      formData.append('userId', userId);

      const response = await fetch(`${API_BASE_URL}/api/cars/${car._id}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload images');
      }

      const result = await response.json();
      alert(`Successfully uploaded ${result.images?.length || 0} image(s)`);
      
      // Refresh car data
      if (onImagesUpdate) {
        onImagesUpdate();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  return (
    <div className="car-image-upload">
      <div 
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
        <div className="upload-content">
          {uploading ? (
            <>
              <div className="upload-spinner">⏳</div>
              <small>Supports: JPG, PNG, GIF, WebP (Optimized)</small>
            </>
          ) : (
            <>
              <div className="upload-icon">📷</div>
              <span>Add Images</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarImageUpload;
