# React Smart Image Uploader - Examples

This directory contains example applications demonstrating how to use the React Smart Image Uploader package in different environments.

## 📁 Examples Overview

### 1. React Example (`react-example/`)
A comprehensive React application showcasing all features of the image uploader:
- Basic image upload
- Multiple file upload with compression
- Image cropping (circle and square)
- Session persistence
- Custom UI implementation
- Programmatic control using refs

### 2. Vanilla JavaScript Example (`vanilla-js/`)
A simple HTML page demonstrating basic file handling concepts that the package implements:
- File selection and processing
- Base64 conversion
- Session storage
- Multiple file handling

## 🚀 Running the Examples

### React Example

1. **Navigate to the React example directory:**
   ```bash
   cd examples/react-example
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install the image uploader package:**
   ```bash
   # If the package is published to npm
   npm install react-smart-image-uploader
   
   # Or if testing locally, from the root directory:
   npm run build
   npm pack
   # Then install the generated .tgz file
   npm install ../../../react-smart-image-uploader-1.0.0.tgz
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to see the example application.

### Vanilla JavaScript Example

1. **Navigate to the vanilla JS example directory:**
   ```bash
   cd examples/vanilla-js
   ```

2. **Open the HTML file:**
   - Simply open `index.html` in your web browser
   - Or serve it using a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Access the example:**
   Open `http://localhost:8000` in your browser.

## 📋 What Each Example Demonstrates

### React Example Features

#### 1. Basic Upload
- Single image selection
- File validation
- Preview display

#### 2. Multiple Upload with Compression
- Multiple file selection (up to 5 files)
- File size limits (10MB max)
- Automatic image compression
- Progress indication
- Grid layout for previews

#### 3. Image Cropping
- Circle crop with fixed dimensions
- Square crop with aspect ratio
- Real-time crop preview
- Crop completion callbacks

#### 4. Session Persistence
- Files persist across page refreshes
- localStorage integration
- Session management controls
- Clear session functionality

#### 5. Custom UI
- Completely custom upload interface
- Drag and drop styling
- Custom file list display
- Loading states
- Remove file functionality

#### 6. Programmatic Control
- Ref-based component control
- Open file dialog programmatically
- Clear files programmatically
- Get current files count

### Vanilla JavaScript Features

#### 1. Basic File Handling
- File input integration
- FileReader API usage
- Base64 conversion
- Image preview generation

#### 2. Multiple File Processing
- Handling multiple files
- Asynchronous file processing
- File type validation
- Size formatting

#### 3. Session Storage
- localStorage integration
- Data persistence
- Session management
- Error handling

## 🛠 Customization

### Modifying the React Example

1. **Add new features:**
   - Edit `src/App.tsx` to add new sections
   - Update `src/App.css` for styling

2. **Test different configurations:**
   - Modify props in the ImageUploader components
   - Experiment with different crop settings
   - Try various compression options

3. **Add new UI themes:**
   - Create new CSS classes
   - Implement different custom UI components

### Extending the Vanilla JS Example

1. **Add more processing features:**
   - Implement image compression
   - Add file type validation
   - Create drag and drop functionality

2. **Enhance the UI:**
   - Add CSS animations
   - Implement responsive design
   - Create better loading states

## 📝 Notes

- The React example is the primary demonstration of the package capabilities
- The vanilla JS example shows the underlying concepts without React
- Both examples include error handling and user feedback
- The examples are designed to be educational and easily modifiable

## 🐛 Troubleshooting

### Common Issues

1. **Package not found:**
   - Ensure the package is built: `npm run build`
   - Check if the package is properly installed
   - Verify the import paths

2. **React example not starting:**
   - Check Node.js version (requires 14+)
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for port conflicts (default: 3000)

3. **Images not displaying:**
   - Check browser console for errors
   - Verify file types are supported
   - Check file size limits

4. **Cropping not working:**
   - Ensure react-image-crop is installed
   - Check browser compatibility
   - Verify image dimensions

### Getting Help

If you encounter issues:
1. Check the main package documentation
2. Review the browser console for errors
3. Ensure all dependencies are installed
4. Try the examples with different image files

## 📚 Learning Resources

- [React Documentation](https://reactjs.org/docs)
- [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
- [HTML5 File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Canvas API for Image Processing](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)