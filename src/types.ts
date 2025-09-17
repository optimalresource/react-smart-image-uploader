export interface ImageFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface ProcessedImage {
  file: ImageFile;
  base64: string;
  blob: Blob;
  url: string;
}

export interface CropConfig {
  enabled: boolean;
  shape: 'circle' | 'square';
  width?: number;
  height?: number;
  aspect?: number;
}

export interface CompressionConfig {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  convertSize?: number;
}

export interface SessionConfig {
  enabled: boolean;
  key?: string;
  clearOnUnmount?: boolean;
}

export interface CustomUIProps {
  isDragActive: boolean;
  isDragReject: boolean;
  files: ProcessedImage[];
  isLoading: boolean;
  openFileDialog: () => void;
  removeFile: (index: number) => void;
}

export interface ImageUploaderProps {
  // Core functionality
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;

  // Compression settings
  compression?: CompressionConfig;

  // Cropping settings
  crop?: CropConfig;

  // Session persistence
  session?: SessionConfig;

  // UI customization
  customUI?: (props: CustomUIProps) => React.ReactNode;
  showPreview?: boolean;
  showProgress?: boolean;
  className?: string;
  style?: React.CSSProperties;

  // Labels and text
  uploadText?: string;
  dragText?: string;
  errorText?: {
    fileSize?: string;
    fileType?: string;
    maxFiles?: string;
  };

  // Callbacks
  onFilesChange?: (files: ProcessedImage[]) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  onCrop?: (croppedImage: ProcessedImage) => void;
}

export interface ImageUploaderRef {
  openFileDialog: () => void;
  clearFiles: () => void;
  getFiles: () => ProcessedImage[];
  addFiles: (files: File[]) => void;
}