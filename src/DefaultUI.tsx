import React from 'react';
import { CustomUIProps, ProcessedImage } from './types';
import { formatFileSize } from './utils';

interface DefaultUIProps extends CustomUIProps {
  uploadText?: string;
  dragText?: string;
  showPreview?: boolean;
  multiple?: boolean;
}

const DefaultUI: React.FC<DefaultUIProps> = ({
  isDragActive,
  isDragReject,
  files,
  isLoading,
  openFileDialog,
  removeFile,
  uploadText = 'Click to upload or drag and drop',
  dragText = 'Drop files here',
  showPreview = true,
  multiple = false,
}) => {
  const getDropzoneStyles = () => {
    let baseStyles = 'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ';
    
    if (isDragReject) {
      baseStyles += 'border-red-400 bg-red-50 text-red-600';
    } else if (isDragActive) {
      baseStyles += 'border-blue-400 bg-blue-50 text-blue-600';
    } else {
      baseStyles += 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 hover:bg-gray-100';
    }
    
    return baseStyles;
  };

  const getFileIcon = (fileCategory: string) => {
    switch (fileCategory) {
      case 'image':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'word':
        return '📝';
      default:
        return '📎';
    }
  };

  const renderPreview = (image: ProcessedImage, index: number) => {
    const isImage = image.file.fileCategory === 'image';
    
    return (
      <div key={index} className="relative group">
        {isImage ? (
          <div className="relative">
            <img
              src={image.url}
              alt={image.file.name}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            <button
              onClick={() => removeFile(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-lg border flex flex-col items-center justify-center relative">
            <div className="text-2xl mb-1">{getFileIcon(image.file.fileCategory)}</div>
            <div className="text-xs text-gray-600 text-center px-1 truncate w-full">
              {image.file.name.split('.').pop()?.toUpperCase()}
            </div>
            <button
              onClick={() => removeFile(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500 text-center">
          <div className="truncate" title={image.file.name}>
            {image.file.name}
          </div>
          <div>{formatFileSize(image.file.size)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={getDropzoneStyles()}
        onClick={openFileDialog}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileDialog();
          }
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p>Processing files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? dragText : uploadText}
            </p>
            <p className="text-sm text-gray-500">
              {multiple ? 'Select multiple files' : 'Select a file'}
            </p>
          </div>
        )}
      </div>

      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Files ({files.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file, index) => renderPreview(file, index))}
          </div>
        </div>
      )}

      {/* File List (Alternative view for non-image files) */}
      {showPreview && files.length > 0 && files.some(f => f.file.fileCategory !== 'image') && (
        <div className="mt-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">File Details</h5>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{file.file.name}</span>
                    <span className="text-gray-400">({formatFileSize(file.file.size)})</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultUI;