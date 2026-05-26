import React from 'react';
import { Camera } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import UploadForm from './components/UploadForm';
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <Toaster position="top-center" />
      
      <header className="header container">
        <Camera size={48} className="header-icon" />
        <h1 className="headline-lg text-primary">Seniors 2027 Gallery</h1>
        <p className="body-lg subtitle">Upload your memory</p>
      </header>

      <main className="container">
        <UploadForm />
      </main>
    </div>
  );
}

export default App;
