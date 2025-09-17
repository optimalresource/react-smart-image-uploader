import Compressor from 'compressorjs';
import { ProcessedImage, CompressionConfig } from './types';

// File validation utilities
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

export const validateFileType = (file: File, acceptedTypes: string[]): boolean => {
  if (acceptedTypes.length === 0) return true;
  return acceptedTypes.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type.match(type.replace('*', '.*'));
  });
};

// File processing utilities
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressImage = (
  file: File,
  config: CompressionConfig
): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: config.quality,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      convertSize: config.convertSize,
      success: (result) => resolve(result as File),
      error: reject,
    });
  });
};

export const processFile = async (
  file: File,
  compression?: CompressionConfig
): Promise<ProcessedImage> => {
  let processedFile = file;
  
  // Compress if it's an image and compression is enabled
  if (file.type.startsWith('image/') && compression) {
    try {
      processedFile = await compressImage(file, compression);
    } catch (error) {
      console.warn('Image compression failed, using original file:', error);
    }
  }

  const base64 = await fileToBase64(processedFile);
  const url = URL.createObjectURL(processedFile);

  return {
    file: {
      name: processedFile.name,
      size: processedFile.size,
      type: processedFile.type,
      lastModified: processedFile.lastModified,
    },
    base64,
    blob: processedFile,
    url,
  };
};

// Session storage utilities
export const saveToSession = (key: string, data: ProcessedImage[]): void => {
  try {
    const serializedData = data.map(item => ({
      file: item.file,
      base64: item.base64,
      // Don't store blob and url as they can't be serialized
    }));
    localStorage.setItem(key, JSON.stringify(serializedData));
  } catch (error) {
    console.warn('Failed to save to session storage:', error);
  }
};

interface StoredImageData {
  file: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
  base64: string;
  url: string;
}

export const loadFromSession = async (key: string): Promise<ProcessedImage[]> => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const data: StoredImageData[] = JSON.parse(stored);
    return Promise.all(
      data.map(async (item: StoredImageData) => {
        // Recreate blob from base64
        const response = await fetch(item.base64);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        return {
          file: item.file,
          base64: item.base64,
          blob,
          url,
        };
      })
    );
  } catch (error) {
    console.warn('Failed to load from session storage:', error);
    return [];
  }
};

export const clearSession = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear session storage:', error);
  }
};

// Utility to parse accept prop
export const parseAcceptProp = (accept?: string): string[] => {
  if (!accept) return [];
  return accept.split(',').map(type => type.trim());
};

// Utility to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Cleanup URLs to prevent memory leaks
export const cleanupUrls = (images: ProcessedImage[]): void => {
  images.forEach(image => {
    if (image.url) {
      URL.revokeObjectURL(image.url);
    }
  });
};