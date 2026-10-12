import React, { useState, useRef } from 'react';
import '../Styles/styles/ImageManager.css';
import { compressImage, validateImageFile } from '../utils/imageOptimization';
import { API_BASE_URL } from '../config/api';

const ImageManager = ({ car, onImagesUpdate }) => {
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

  const deleteImage = async (imageIndex) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/cars/${car._id}/images/${imageIndex}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Image deleted successfully!');
        onImagesUpdate(); // Refresh car data
      } else {
        alert(`Delete failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const setPrimaryImage = async (imageIndex) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cars/${car._id}/images/${imageIndex}/primary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Primary image updated!');
        onImagesUpdate(); // Refresh car data
      } else {
        alert(`Update failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update primary image. Please try again.');
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
    <div className="image-manager">
      <h3>Manage Car Images</h3>
      
      {/* Upload Area */}
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
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
          <div className="upload-icon">📷</div>
          <p>Click to upload or drag and drop images</p>
          <small>Supports: JPG, PNG, GIF, WebP (Images will be optimized)</small>
        </div>
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Uploading images...</p>
        </div>
      )}

      {/* Current Images */}
      <div className="current-images">
        <h4>Current Images ({car.images?.length || 0})</h4>
        {car.images && car.images.length > 0 ? (
          <div className="images-grid">
            {car.images.map((image, index) => (
              <div key={index} className="image-item">
                <img 
                  src={image.url.startsWith('http') ? image.url : `${API_BASE_URL.replace('/api', '')}${image.url}`}
                  alt={image.alt}
                  className="thumbnail"
                />
                <div className="image-overlay">
                  {image.isPrimary && <span className="primary-badge">PRIMARY</span>}
                  <div className="image-actions">
                    {!image.isPrimary && (
                      <button 
                        className="action-btn primary-btn"
                        onClick={() => setPrimaryImage(index)}
                        title="Set as primary image"
                      >
                        ⭐
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => deleteImage(index)}
                      title="Delete image"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-images">
            <p>No images uploaded yet. Add some images to showcase your car!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageManager;
