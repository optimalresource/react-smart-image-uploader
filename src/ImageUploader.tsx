import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  ImageUploaderProps,
  ImageUploaderRef,
  ProcessedImage,
} from './types';
import {
  validateFileSize,
  validateFileType,
  processFile,
  parseAcceptProp,
  saveToSession,
  loadFromSession,
  clearSession,
  cleanupUrls,
} from './utils';
import DefaultUI from './DefaultUI';
import ImageCropper from './ImageCropper';

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  (
    {
      multiple = false,
      accept,
      maxFiles = 10,
      maxSize = 5 * 1024 * 1024, // 5MB default
      disabled = false,
      compression = {
        quality: 0.2,
        maxWidth: 1920,
        maxHeight: 1080,
      },
      crop,
      session,
      customUI,
      showPreview = true,
      showProgress = false,
      className,
      style,
      uploadText,
      dragText,
      errorText = {
        fileSize: 'File size exceeds the maximum limit',
        fileType: 'File type not supported',
        maxFiles: 'Maximum number of files exceeded',
      },
      onFilesChange,
      onError,
      onProgress,
      onCrop,
    },
    ref
  ) => {
    const [files, setFiles] = useState<ProcessedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isDragReject, setIsDragReject] = useState(false);
    const [cropImage, setCropImage] = useState<ProcessedImage | null>(null);
    const [progress, setProgress] = useState(0);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);
    const sessionKey = session?.key || 'image-uploader-files';

    // Load files from session on mount
    useEffect(() => {
      if (session?.enabled) {
        loadFromSession(sessionKey).then((sessionFiles) => {
          if (sessionFiles.length > 0) {
            setFiles(sessionFiles);
            onFilesChange?.(sessionFiles);
          }
        });
      }
    }, [session?.enabled, sessionKey, onFilesChange]);

    // Save files to session when files change
    useEffect(() => {
      if (session?.enabled && files.length > 0) {
        saveToSession(sessionKey, files);
      }
    }, [files, session?.enabled, sessionKey]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        cleanupUrls(files);
        if (session?.enabled && session?.clearOnUnmount) {
          clearSession(sessionKey);
        }
      };
    }, [files, session?.enabled, session?.clearOnUnmount, sessionKey]);

    const openFileDialog = useCallback(() => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, [disabled]);

    const validateFiles = useCallback(
      (fileList: File[]): { valid: File[]; errors: string[] } => {
        const valid: File[] = [];
        const errors: string[] = [];
        const acceptedTypes = parseAcceptProp(accept);

        for (const file of fileList) {
          // Check file type
          if (acceptedTypes.length > 0 && !validateFileType(file, acceptedTypes)) {
            errors.push(`${file.name}: ${errorText.fileType}`);
            continue;
          }

          // Check file size
          if (!validateFileSize(file, maxSize)) {
            errors.push(`${file.name}: ${errorText.fileSize}`);
            continue;
          }

          valid.push(file);
        }

        // Check max files limit
        if (files.length + valid.length > maxFiles) {
          const allowedCount = maxFiles - files.length;
          valid.splice(allowedCount);
          if (allowedCount <= 0) {
            errors.push(errorText.maxFiles || 'Maximum number of files exceeded');
          }
        }

        return { valid, errors };
      },
      [accept, maxSize, maxFiles, files.length, errorText]
    );

    const processFiles = useCallback(
      async (fileList: File[]) => {
        const { valid, errors } = validateFiles(fileList);

        if (errors.length > 0) {
          errors.forEach((error) => onError?.(error));
        }

        if (valid.length === 0) {
          return;
        }

        setIsLoading(true);
        setProgress(0);

        try {
          const processedFiles: ProcessedImage[] = [];
          
          for (let i = 0; i < valid.length; i++) {
            const file = valid[i];
            const processed = await processFile(file, compression);
            processedFiles.push(processed);
            
            // Update progress
            const currentProgress = ((i + 1) / valid.length) * 100;
            setProgress(currentProgress);
            onProgress?.(currentProgress);
          }

          // Handle cropping for images
          if (crop?.enabled && processedFiles.length === 1 && processedFiles[0].file.type.startsWith('image/')) {
            setCropImage(processedFiles[0]);
          } else {
            const newFiles = multiple ? [...files, ...processedFiles] : processedFiles;
            setFiles(newFiles);
            onFilesChange?.(newFiles);
          }
        } catch (error) {
          onError?.(`Error processing files: ${error}`);
        } finally {
          setIsLoading(false);
          setProgress(0);
        }
      },
      [validateFiles, compression, crop, multiple, files, onError, onProgress, onFilesChange]
    );

    const handleFileInput = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = Array.from(event.target.files || []);
        processFiles(fileList);
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      [processFiles]
    );

    const removeFile = useCallback(
      (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        // Cleanup URL for removed file
        if (files[index]?.url) {
          URL.revokeObjectURL(files[index].url);
        }
        setFiles(newFiles);
        onFilesChange?.(newFiles);
        
        // Update session storage
        if (session?.enabled) {
          if (newFiles.length === 0) {
            clearSession(sessionKey);
          } else {
            saveToSession(sessionKey, newFiles);
          }
        }
      },
      [files, onFilesChange, session?.enabled, sessionKey]
    );

    const clearFiles = useCallback(() => {
      cleanupUrls(files);
      setFiles([]);
      onFilesChange?.([]);
      if (session?.enabled) {
        clearSession(sessionKey);
      }
    }, [files, onFilesChange, session?.enabled, sessionKey]);

    const handleCropComplete = useCallback(
      (croppedImage: ProcessedImage) => {
        const newFiles = multiple ? [...files, croppedImage] : [croppedImage];
        setFiles(newFiles);
        onFilesChange?.(newFiles);
        onCrop?.(croppedImage);
        setCropImage(null);
      },
      [multiple, files, onFilesChange, onCrop]
    );

    const handleCropCancel = useCallback(() => {
      setCropImage(null);
    }, []);

    // Drag and drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragActive(true);
      }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragActive(false);
        setIsDragReject(false);
      }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (disabled) {
        setIsDragReject(true);
        return;
      }
      
      const hasFiles = e.dataTransfer.types.includes('Files');
      setIsDragReject(!hasFiles);
    }, [disabled]);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        setIsDragReject(false);
        dragCounter.current = 0;

        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
      },
      [disabled, processFiles]
    );

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        openFileDialog,
        clearFiles,
        getFiles: () => files,
        addFiles: (newFiles: File[]) => processFiles(newFiles),
      }),
      [openFileDialog, clearFiles, files, processFiles]
    );

    const uiProps = {
      isDragActive,
      isDragReject,
      files,
      isLoading,
      openFileDialog,
      removeFile,
    };

    return (
      <div
        className={className}
        style={style}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {customUI ? (
          customUI(uiProps)
        ) : (
          <DefaultUI
            {...uiProps}
            uploadText={uploadText}
            dragText={dragText}
            showPreview={showPreview}
            multiple={multiple}
          />
        )}

        {showProgress && isLoading && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{Math.round(progress)}% complete</p>
          </div>
        )}

        {cropImage && crop && (
          <ImageCropper
            image={cropImage}
            cropConfig={crop}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </div>
    );
  }
);

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;