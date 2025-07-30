import React, { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';

const ImagePicker = ({ label, imageUrl, onChange }) => {
  const [preview, setPreview] = useState(imageUrl);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--color-secondary-text)] mb-1">
        {label}
      </label>
      <div className="w-full h-32 bg-[color:var(--color-background)] border-2 border-dashed border-[color:var(--color-border)] rounded-md flex items-center justify-center">
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-md" />
        ) : (
          <div className="text-center text-[color:var(--color-secondary-text)]">
            <FiUpload className="mx-auto h-8 w-8" />
            <p className="mt-1 text-sm">Upload an image</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <button
        onClick={handleButtonClick}
        className="mt-2 w-full px-3 py-2 bg-[color:var(--color-primary)] text-white rounded-md text-sm font-semibold hover:bg-[color:var(--color-accent)]"
      >
        Choose Image
      </button>
    </div>
  );
};

export default ImagePicker;
