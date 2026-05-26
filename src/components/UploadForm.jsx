import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import './UploadForm.css';

const BRANCHES = [
  'Assiut', 'Ain Shams', 'Alex', 'Sohag', 'Menoufia', 'Tanta', 
  'Ismailia', 'Fayoum', 'Beni Suef', 'Minya', 'Qena', 'Hurghada', 'Sadat'
];

const UploadForm = () => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setUploadedUrl('');
    } else {
      toast.error('Please select a valid image file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setUploadedUrl('');
    } else {
      toast.error('Please drop a valid image file.');
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setUploadedUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) return toast.error('Please enter your name');
    if (!branch) return toast.error('Please select your branch');
    if (!file) return toast.error('Please select an image to upload');

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading your memory...');

    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error('ImgBB API key is missing. Please configure your .env file.');
      }

      const formData = new FormData();
      formData.append('key', apiKey);
      formData.append('image', file);
      // We cleverly store the name and branch as the image name in ImgBB!
      formData.append('name', `${name} - ${branch} (Seniors 2027)`);

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const url = data.data.url;
        
        // Save to Firebase
        await addDoc(collection(db, 'uploads'), {
          name,
          branch,
          imageUrl: url,
          createdAt: Date.now()
        });

        setUploadedUrl(url);
        toast.success('Upload complete! You are part of the gallery now.', { id: loadingToast });
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error.message || 'Something went wrong during upload.', { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-form-wrapper">
      <form className="card upload-form" onSubmit={handleSubmit}>
        
        {uploadedUrl ? (
          <div className="success-state">
            <CheckCircle2 size={64} className="text-primary bounce-in" />
            <h2 className="headline-md">Awesome, {name}!</h2>
            <p className="body-md">Your photo is successfully uploaded.</p>
            
            <div className="image-result">
              <img src={uploadedUrl} alt="Uploaded" className="result-img" />
            </div>
            
            <div className="link-box">
              <input type="text" readOnly value={uploadedUrl} className="link-input" />
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(uploadedUrl);
                  toast.success('Link copied!');
                }}
              >
                Copy Link
              </button>
            </div>

            <button 
              type="button" 
              className="btn btn-primary mt-4"
              onClick={() => {
                clearSelection();
                setName('');
                setBranch('');
              }}
            >
              Upload Another
            </button>
          </div>
        ) : (
          <>
            <div className="input-group">
              <label htmlFor="name" className="label-caps">Your Name</label>
              <input 
                id="name"
                type="text" 
                className="input-field" 
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="branch" className="label-caps">Your Branch</label>
              <select 
                id="branch"
                className="input-field" 
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={isUploading}
              >
                <option value="">Select a branch...</option>
                {BRANCHES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div 
              className={`dropzone ${preview ? 'has-preview' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden-input" 
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
              />
              
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-img" />
                  {!isUploading && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSelection();
                      }}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="dropzone-content">
                  <div className="dropzone-icon">
                    <ImageIcon size={40} className="text-primary" />
                  </div>
                  <p className="body-md">Click to browse or drag image here</p>
                  <p className="label-caps text-on-surface-variant mt-2">JPEG, PNG, WEBP (Max 32MB)</p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary submit-btn"
              disabled={isUploading || !file || !name || !branch}
            >
              {isUploading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Image
                </>
              )}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default UploadForm;
