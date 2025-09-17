import React, { useState, useRef } from 'react';
import { ImageUploader, ProcessedImage, ImageUploaderRef } from '../../../src';
import './App.css';

function App() {
  const [basicFiles, setBasicFiles] = useState<ProcessedImage[]>([]);
  const [multipleFiles, setMultipleFiles] = useState<ProcessedImage[]>([]);
  const [croppedFiles, setCroppedFiles] = useState<ProcessedImage[]>([]);
  const [persistentFiles, setPersistentFiles] = useState<ProcessedImage[]>([]);
  const [customUIFiles, setCustomUIFiles] = useState<ProcessedImage[]>([]);
  
  const uploaderRef = useRef<ImageUploaderRef>(null);

  const handleError = (error: string) => {
    alert(`Error: ${error}`);
  };

  const handleProgress = (progress: number) => {
    console.log(`Upload progress: ${progress}%`);
  };

  const handleCrop = (croppedImage: ProcessedImage) => {
    console.log('Image cropped:', croppedImage);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Smart Image Uploader Examples</h1>
        <p>Demonstrating various features of the image uploader component</p>
      </header>

      <main className="examples-container">
        {/* Basic Upload Example */}
        <section className="example-section">
          <h2>1. Basic Image Upload</h2>
          <p>Simple image upload with default settings</p>
          
          <ImageUploader
            accept="image/*"
            onFilesChange={setBasicFiles}
            onError={handleError}
            uploadText="Click to upload an image"
          />
          
          {basicFiles.length > 0 && (
            <div className="results">
              <h3>Uploaded Files:</h3>
              {basicFiles.map((file, index) => (
                <div key={index} className="file-result">
                  <img src={file.url} alt={file.file.name} className="preview-image" />
                  <div className="file-info">
                    <p><strong>Name:</strong> {file.file.name}</p>
                    <p><strong>Size:</strong> {(file.file.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Type:</strong> {file.file.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Multiple Upload with Compression */}
        <section className="example-section">
          <h2>2. Multiple Upload with Compression</h2>
          <p>Upload multiple images with automatic compression</p>
          
          <ImageUploader
            multiple
            maxFiles={5}
            maxSize={10 * 1024 * 1024} // 10MB
            compression={{
              quality: 0.8,
              maxWidth: 1920,
              maxHeight: 1080,
            }}
            showProgress
            onFilesChange={setMultipleFiles}
            onError={handleError}
            onProgress={handleProgress}
            uploadText="Upload multiple images (max 5)"
          />
          
          {multipleFiles.length > 0 && (
            <div className="results">
              <h3>Uploaded Files ({multipleFiles.length}):</h3>
              <div className="file-grid">
                {multipleFiles.map((file, index) => (
                  <div key={index} className="file-card">
                    <img src={file.url} alt={file.file.name} className="card-image" />
                    <p className="card-title">{file.file.name}</p>
                    <p className="card-size">{(file.file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Image Cropping */}
        <section className="example-section">
          <h2>3. Image Cropping</h2>
          <p>Upload and crop images in circle or square shapes</p>
          
          <div className="crop-examples">
            <div className="crop-option">
              <h4>Circle Crop</h4>
              <ImageUploader
                accept="image/*"
                crop={{
                  enabled: true,
                  shape: 'circle',
                  width: 200,
                  height: 200,
                }}
                onFilesChange={(files) => setCroppedFiles(prev => [...prev, ...files])}
                onCrop={handleCrop}
                onError={handleError}
                uploadText="Upload for circle crop"
              />
            </div>
            
            <div className="crop-option">
              <h4>Square Crop</h4>
              <ImageUploader
                accept="image/*"
                crop={{
                  enabled: true,
                  shape: 'square',
                  aspect: 1,
                }}
                onFilesChange={(files) => setCroppedFiles(prev => [...prev, ...files])}
                onCrop={handleCrop}
                onError={handleError}
                uploadText="Upload for square crop"
              />
            </div>
          </div>
          
          {croppedFiles.length > 0 && (
            <div className="results">
              <h3>Cropped Images:</h3>
              <div className="file-grid">
                {croppedFiles.map((file, index) => (
                  <div key={index} className="file-card">
                    <img src={file.url} alt={file.file.name} className="card-image" />
                    <p className="card-title">{file.file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Session Persistence */}
        <section className="example-section">
          <h2>4. Session Persistence</h2>
          <p>Files persist across page refreshes</p>
          
          <ImageUploader
            multiple
            session={{
              enabled: true,
              key: 'persistent-upload-demo',
              clearOnUnmount: false,
            }}
            onFilesChange={setPersistentFiles}
            onError={handleError}
            uploadText="Upload with session persistence"
          />
          
          <div className="session-controls">
            <button 
              onClick={() => window.location.reload()}
              className="control-button"
            >
              Refresh Page (files should persist)
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('persistent-upload-demo');
                setPersistentFiles([]);
              }}
              className="control-button danger"
            >
              Clear Session
            </button>
          </div>
          
          {persistentFiles.length > 0 && (
            <div className="results">
              <h3>Persistent Files ({persistentFiles.length}):</h3>
              <div className="file-grid">
                {persistentFiles.map((file, index) => (
                  <div key={index} className="file-card">
                    <img src={file.url} alt={file.file.name} className="card-image" />
                    <p className="card-title">{file.file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Custom UI */}
        <section className="example-section">
          <h2>5. Custom UI</h2>
          <p>Completely custom upload interface</p>
          
          <ImageUploader
            multiple
            onFilesChange={setCustomUIFiles}
            onError={handleError}
            customUI={({ isDragActive, openFileDialog, files, removeFile, isLoading }) => (
              <div className="custom-uploader">
                <div 
                  className={`custom-drop-zone ${
                    isDragActive ? 'drag-active' : ''
                  } ${isLoading ? 'loading' : ''}`}
                  onClick={openFileDialog}
                >
                  {isLoading ? (
                    <div className="custom-loading">
                      <div className="spinner"></div>
                      <p>Processing files...</p>
                    </div>
                  ) : (
                    <div className="custom-content">
                      <div className="upload-icon">📁</div>
                      <h3>{isDragActive ? 'Drop files here!' : 'Custom Upload Zone'}</h3>
                      <p>Click or drag files to this area</p>
                    </div>
                  )}
                </div>
                
                {files.length > 0 && (
                  <div className="custom-file-list">
                    <h4>Uploaded Files:</h4>
                    {files.map((file, index) => (
                      <div key={index} className="custom-file-item">
                        <img src={file.url} alt={file.file.name} className="custom-thumbnail" />
                        <div className="custom-file-details">
                          <p className="custom-file-name">{file.file.name}</p>
                          <p className="custom-file-size">{(file.file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button 
                          onClick={() => removeFile(index)}
                          className="custom-remove-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
        </section>

        {/* Programmatic Control */}
        <section className="example-section">
          <h2>6. Programmatic Control</h2>
          <p>Control the uploader using ref methods</p>
          
          <ImageUploader
            ref={uploaderRef}
            multiple
            onFilesChange={(files) => console.log('Ref controlled files:', files)}
            onError={handleError}
          />
          
          <div className="ref-controls">
            <button 
              onClick={() => uploaderRef.current?.openFileDialog()}
              className="control-button"
            >
              Open File Dialog
            </button>
            <button 
              onClick={() => uploaderRef.current?.clearFiles()}
              className="control-button"
            >
              Clear All Files
            </button>
            <button 
              onClick={() => {
                const files = uploaderRef.current?.getFiles();
                alert(`Current files: ${files?.length || 0}`);
              }}
              className="control-button"
            >
              Get Files Count
            </button>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>React Smart Image Uploader - Example Application</p>
      </footer>
    </div>
  );
}

export default App;