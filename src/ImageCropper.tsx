import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ProcessedImage, CropConfig } from './types';

interface ImageCropperProps {
  image: ProcessedImage;
  cropConfig: CropConfig;
  onCropComplete: (croppedImage: ProcessedImage) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  cropConfig,
  onCropComplete,
  onCancel,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isLoading, setIsLoading] = useState(false);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      
      let aspect = 1; // Default for square
      if (cropConfig.aspect) {
        aspect = cropConfig.aspect;
      } else if (cropConfig.width && cropConfig.height) {
        aspect = cropConfig.width / cropConfig.height;
      }

      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 50,
          },
          aspect,
          width,
          height
        ),
        width,
        height
      );
      setCrop(crop);
    },
    [cropConfig]
  );

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          }
        }, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsLoading(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const croppedFile = new File([croppedBlob], image.file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const url = URL.createObjectURL(croppedBlob);

        const croppedImage: ProcessedImage = {
          file: {
            name: croppedFile.name,
            size: croppedFile.size,
            type: croppedFile.type,
            lastModified: croppedFile.lastModified,
            fileCategory: 'image',
          },
          base64,
          blob: croppedBlob,
          url,
        };

        onCropComplete(croppedImage);
        setIsLoading(false);
      };
      reader.readAsDataURL(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
      setIsLoading(false);
    }
  }, [completedCrop, getCroppedImg, image.file.name, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">
          Crop Image ({cropConfig.shape})
        </h3>
        
        <div className="mb-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={cropConfig.aspect || (cropConfig.width && cropConfig.height ? cropConfig.width / cropConfig.height : 1)}
            circularCrop={cropConfig.shape === 'circle'}
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={image.base64}
              style={{ maxHeight: '400px', maxWidth: '100%' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropComplete}
            disabled={!completedCrop || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;