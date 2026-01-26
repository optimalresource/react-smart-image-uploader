# React Smart File Uploader

🚀 A powerful and customizable file uploader component for React supporting images, PDFs, Excel, and Word documents with intelligent compression, cropping, and session persistence.

## Features

- ✨ **Easy to use**: Simple API with sensible defaults
- 📄 **Multiple file types**: Images, PDFs, Excel (.xlsx, .xls), Word (.docx, .doc)
- 🗜️ **Smart compression**: Automatic compression for images and PDFs
- 🖼️ **Image cropping**: Circle and square cropping with customizable dimensions
- 💾 **Session persistence**: Keep uploaded files across page refreshes
- 🎨 **Fully customizable**: Replace the default UI with your own components
- 📱 **Responsive**: Works great on desktop and mobile
- 🔧 **TypeScript**: Full TypeScript support with comprehensive types
- 🌐 **Universal**: Works with any React application
- 📦 **Lightweight**: Minimal dependencies

## Installation

```bash
npm install react-smart-file-uploader
```

or

```bash
yarn add react-smart-file-uploader
```

## Quick Start

```tsx
import React, { useState } from 'react';
import { ImageUploader, ProcessedImage } from 'react-smart-file-uploader';

function App() {
  const [files, setFiles] = useState<ProcessedImage[]>([]);

  return (
    <div>
      <ImageUploader
        multiple
        onFilesChange={setFiles}
        accept="image/*"
        maxFiles={5}
        maxSize={5 * 1024 * 1024} // 5MB
      />
      
      <div>
        <h3>Uploaded Files:</h3>
        {files.map((file, index) => (
          <div key={index}>
            <img src={file.url} alt={file.file.name} width={100} />
            <p>{file.file.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Supported File Types

The uploader intelligently handles different file types:

### Images
- **Formats**: JPG, PNG, GIF, WebP, SVG, etc.
- **Compression**: ✅ Automatic (configurable quality)
- **Cropping**: ✅ Supported (circle/square)
- **Preview**: ✅ Thumbnail display

### PDFs
- **Formats**: PDF
- **Compression**: ✅ Automatic optimization
- **Cropping**: ❌ Not applicable
- **Preview**: ✅ File icon display

### Excel Spreadsheets
- **Formats**: .xlsx, .xls
- **Compression**: ❌ Disabled (preserves data integrity)
- **Cropping**: ❌ Not applicable
- **Preview**: ✅ File icon display

### Word Documents
- **Formats**: .docx, .doc
- **Compression**: ❌ Disabled (preserves formatting)
- **Cropping**: ❌ Not applicable
- **Preview**: ✅ File icon display

## API Reference

### ImageUploader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `accept` | `string` | `undefined` | File types to accept (e.g., "image/*", "application/pdf", ".xlsx,.xls,.docx,.doc") |
| `maxFiles` | `number` | `10` | Maximum number of files |
| `maxSize` | `number` | `5242880` | Maximum file size in bytes (5MB) |
| `disabled` | `boolean` | `false` | Disable the uploader |
| `compression` | `CompressionConfig \| null` | `{ quality: 0.2, maxWidth: 1920, maxHeight: 1080 }` | Compression settings for images and PDFs (pass `null` to disable) |
| `crop` | `CropConfig` | `undefined` | Image cropping settings |
| `session` | `SessionConfig` | `undefined` | Session persistence settings |
| `customUI` | `(props: CustomUIProps) => ReactNode` | `undefined` | Custom UI renderer |
| `showPreview` | `boolean` | `true` | Show file previews |
| `showProgress` | `boolean` | `false` | Show upload progress |
| `className` | `string` | `undefined` | CSS class name |
| `style` | `CSSProperties` | `undefined` | Inline styles |
| `uploadText` | `string` | `"Click to upload or drag and drop"` | Upload area text |
| `dragText` | `string` | `"Drop files here"` | Drag active text |
| `errorText` | `object` | See below | Error messages |
| `onFilesChange` | `(files: ProcessedImage[]) => void` | `undefined` | Files change callback |
| `onError` | `(error: string) => void` | `undefined` | Error callback |
| `onProgress` | `(progress: number) => void` | `undefined` | Progress callback |
| `onCrop` | `(croppedImage: ProcessedImage) => void` | `undefined` | Crop complete callback |

### CompressionConfig

```tsx
interface CompressionConfig {
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
  convertSize?: number; // Convert to JPEG if larger than this size
}
```

### CropConfig

```tsx
interface CropConfig {
  enabled: boolean;
  shape: 'circle' | 'square';
  width?: number;
  height?: number;
  aspect?: number; // width/height ratio
}
```

### SessionConfig

```tsx
interface SessionConfig {
  enabled: boolean;
  key?: string; // localStorage key
  clearOnUnmount?: boolean;
}
```

## Usage Examples

### Basic Image Upload

```tsx
import { ImageUploader } from 'react-smart-file-uploader';

function BasicUpload() {
  return (
    <ImageUploader
      accept="image/*"
      onFilesChange={(files) => console.log('Files:', files)}
    />
  );
}
```

### Multi-Format File Upload

```tsx
function MultiFormatUpload() {
  const [files, setFiles] = useState<ProcessedImage[]>([]);

  return (
    <ImageUploader
      multiple
      accept="image/*,.pdf,.xlsx,.xls,.docx,.doc"
      maxFiles={10}
      maxSize={10 * 1024 * 1024} // 10MB
      onFilesChange={(files) => {
        setFiles(files);
        files.forEach(file => {
          console.log('File type:', file.file.fileCategory);
          console.log('Original size:', file.file.size);
        });
      }}
    />
  );
}
```

### PDF Upload with Compression

```tsx
function PDFUpload() {
  return (
    <ImageUploader
      multiple
      accept=".pdf"
      compression={{
        quality: 0.7, // PDF compression quality
        maxWidth: 1920,
        maxHeight: 1080,
      }}
      onFilesChange={(files) => {
        files.forEach(file => {
          console.log('PDF compressed:', file.base64);
        });
      }}
    />
  );
}
```

### Excel/Word Upload (No Compression)

```tsx
function DocumentUpload() {
  return (
    <ImageUploader
      multiple
      accept=".xlsx,.xls,.docx,.doc"
      // Compression is automatically disabled for Excel and Word files
      onFilesChange={(files) => {
        files.forEach(file => {
          console.log('Document uploaded:', file.file.name);
          console.log('File category:', file.file.fileCategory);
        });
      }}
    />
  );
}
```
```

### Multi-Format File Upload

```tsx
function MultiFormatUpload() {
  const [files, setFiles] = useState<ProcessedImage[]>([]);

  return (
    <ImageUploader
      multiple
      accept="image/*,.pdf,.xlsx,.xls,.docx,.doc"
      maxFiles={10}
      maxSize={10 * 1024 * 1024} // 10MB
      onFilesChange={(files) => {
        setFiles(files);
        files.forEach(file => {
          console.log('File type:', file.file.fileCategory);
          console.log('Original size:', file.file.size);
        });
      }}
    />
  );
}
```

### PDF Upload with Compression

```tsx
function PDFUpload() {
  return (
    <ImageUploader
      multiple
      accept=".pdf"
      compression={{
        quality: 0.7, // PDF compression quality
        maxWidth: 1920,
        maxHeight: 1080,
      }}
      onFilesChange={(files) => {
        files.forEach(file => {
          console.log('PDF compressed:', file.base64);
        });
      }}
    />
  );
}
```

### Excel/Word Upload (No Compression)

```tsx
function DocumentUpload() {
  return (
    <ImageUploader
      multiple
      accept=".xlsx,.xls,.docx,.doc"
      // Compression is automatically disabled for Excel and Word files
      onFilesChange={(files) => {
        files.forEach(file => {
          console.log('Document uploaded:', file.file.name);
          console.log('File category:', file.file.fileCategory);
        });
      }}
    />
  );
}
```

### Multiple Files with Compression

```tsx
function MultipleUpload() {
  return (
    <ImageUploader
      multiple
      maxFiles={10}
      compression={{
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      }}
      onFilesChange={(files) => {
        files.forEach(file => {
          console.log('Base64:', file.base64);
          console.log('Blob:', file.blob);
        });
      }}
    />
  );
}
```

### Disable Compression

```tsx
function NoCompressionUpload() {
  return (
    <ImageUploader
      multiple
      compression={null} // Disable compression entirely
      onFilesChange={(files) => {
        // Files will be uploaded without compression
        console.log('Original files:', files);
      }}
    />
  );
}
```

### Image Cropping

```tsx
function CroppingUpload() {
  return (
    <ImageUploader
      crop={{
        enabled: true,
        shape: 'circle',
        width: 200,
        height: 200,
      }}
      onCrop={(croppedImage) => {
        console.log('Cropped image:', croppedImage);
      }}
    />
  );
}
```

### Session Persistence

```tsx
function PersistentUpload() {
  return (
    <ImageUploader
      multiple
      session={{
        enabled: true,
        key: 'my-upload-session',
        clearOnUnmount: false,
      }}
      onFilesChange={(files) => {
        // Files will persist across page refreshes
        console.log('Persistent files:', files);
      }}
    />
  );
}
```

### Custom UI

```tsx
function CustomUIUpload() {
  return (
    <ImageUploader
      customUI={({ isDragActive, openFileDialog, files, removeFile }) => (
        <div className="my-custom-uploader">
          <button 
            onClick={openFileDialog}
            className={isDragActive ? 'drag-active' : ''}
          >
            {isDragActive ? 'Drop it!' : 'Click to Upload'}
          </button>
          
          <div className="file-list">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <img src={file.url} alt={file.file.name} />
                <button onClick={() => removeFile(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    />
  );
}
```

### Using Ref for Programmatic Control

```tsx
import { useRef } from 'react';
import { ImageUploader, ImageUploaderRef } from 'react-smart-file-uploader';

function RefExample() {
  const uploaderRef = useRef<ImageUploaderRef>(null);

  const handleClearAll = () => {
    uploaderRef.current?.clearFiles();
  };

  const handleOpenDialog = () => {
    uploaderRef.current?.openFileDialog();
  };

  const handleGetFiles = () => {
    const files = uploaderRef.current?.getFiles();
    console.log('Current files:', files);
  };

  return (
    <div>
      <ImageUploader ref={uploaderRef} multiple />
      
      <div>
        <button onClick={handleOpenDialog}>Open File Dialog</button>
        <button onClick={handleClearAll}>Clear All</button>
        <button onClick={handleGetFiles}>Get Files</button>
      </div>
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS classes by default, but you can easily customize the styling:

### Using CSS Classes

```tsx
<ImageUploader
  className="my-uploader"
  // ... other props
/>
```

```css
.my-uploader {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
}

.my-uploader:hover {
  border-color: #007bff;
}
```

### Using Inline Styles

```tsx
<ImageUploader
  style={{
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '20px',
  }}
/>
```

## TypeScript Support

The package is written in TypeScript and provides comprehensive type definitions:

```tsx
import {
  ImageUploader,
  ProcessedImage,
  ImageUploaderProps,
  ImageUploaderRef,
  CropConfig,
  CompressionConfig,
  SessionConfig,
} from 'react-smart-file-uploader';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]

## Changelog

### v2.0.0 (Latest)
- 🎉 **Major Update**: Multi-format file support
- ✨ Added support for PDF files with automatic compression
- ✨ Added support for Excel files (.xlsx, .xls) - compression disabled
- ✨ Added support for Word documents (.docx, .doc) - compression disabled
- 🔧 Added `fileCategory` property to track file types
- 🔧 Enhanced file type detection with `getFileCategory` utility
- 🎨 Improved file preview with type-specific icons
- 📝 Renamed package from `react-smart-image-uploader` to `react-smart-file-uploader`
- 📚 Updated documentation with multi-format examples

### v1.0.0
- Initial release
- Image upload with drag & drop
- Image compression
- Image cropping (circle/square)
- Session persistence
- Custom UI support
- TypeScript support