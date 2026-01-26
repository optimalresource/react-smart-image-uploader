import Compressor from 'compressorjs';
import { PDFDocument } from 'pdf-lib';
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

// Determine file category based on MIME type or extension
export const getFileCategory = (file: File): 'image' | 'pdf' | 'excel' | 'word' | 'other' => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  // Check for images
  if (fileType.startsWith('image/')) {
    return 'image';
  }

  // Check for PDFs
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'pdf';
  }

  // Check for Excel files
  if (
    fileType === 'application/vnd.ms-excel' ||
    fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx')
  ) {
    return 'excel';
  }

  // Check for Word files
  if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return 'word';
  }

  return 'other';
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

// PDF compression utility
export const compressPDF = async (
  file: File,
  config: CompressionConfig
): Promise<File> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Save with compression options
    // Note: pdf-lib doesn't have direct quality control like images,
    // but we can optimize by removing unnecessary data
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });

    // Create a new File from the compressed bytes
    // Use slice to create a proper ArrayBuffer from Uint8Array
    const buffer = compressedPdfBytes.slice().buffer;
    const compressedBlob = new Blob([buffer], { type: 'application/pdf' });
    const compressedFile = new File([compressedBlob], file.name, {
      type: 'application/pdf',
      lastModified: file.lastModified,
    });

    return compressedFile;
  } catch (error) {
    console.warn('PDF compression failed, using original file:', error);
    return file;
  }
};

export const processFile = async (
  file: File,
  compression?: CompressionConfig | null
): Promise<ProcessedImage> => {
  let processedFile = file;
  const fileCategory = getFileCategory(file);
  
  // Apply default compression if not explicitly disabled (null)
  const defaultCompression: CompressionConfig = {
    quality: 0.2,
    maxWidth: 1920,
    maxHeight: 1080,
  };
  
  // Compress based on file type if compression is not explicitly disabled
  if (compression !== null) {
    const compressionConfig = compression || defaultCompression;
    
    try {
      if (fileCategory === 'image') {
        // Compress images
        processedFile = await compressImage(file, compressionConfig);
      } else if (fileCategory === 'pdf') {
        // Compress PDFs
        processedFile = await compressPDF(file, compressionConfig);
      }
      // Excel and Word files are not compressed
    } catch (error) {
      console.warn(`${fileCategory} compression failed, using original file:`, error);
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
      fileCategory,
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
        
        // Determine file category from stored file type
        const fileCategory = getFileCategoryFromType(item.file.type, item.file.name);
        
        return {
          file: {
            ...item.file,
            fileCategory,
          },
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

// Helper to determine file category from MIME type or filename
const getFileCategoryFromType = (type: string, name: string): 'image' | 'pdf' | 'excel' | 'word' | 'other' => {
  const lowerType = type.toLowerCase();
  const lowerName = name.toLowerCase();

  if (lowerType.startsWith('image/')) return 'image';
  if (lowerType === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf';
  if (lowerType.includes('spreadsheet') || lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')) return 'excel';
  if (lowerType.includes('wordprocessingml') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) return 'word';
  return 'other';
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