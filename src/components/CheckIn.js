import React, { useState, useEffect, useRef } from 'react';

const Login = ({ onLogin, onRegisterClick, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useFaceLogin, setUseFaceLogin] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions or try using password login instead.');
      setUseFaceLogin(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  // Capture face
  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      
      // Stop camera
      stopCamera();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (useFaceLogin && capturedImage) {
      // In a real application, you would send the captured image to the server
      // for facial recognition, but for now we'll just pass it to the onLogin function
      onLogin(email, '', capturedImage);
    } else if (!useFaceLogin && email && password) {
      onLogin(email, password);
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Toggle between password and face login
  const toggleLoginMethod = () => {
    if (useFaceLogin) {
      stopCamera();
      setCapturedImage('');
    }
    setUseFaceLogin(!useFaceLogin);
  };

  // Reset captured image
  const resetCapture = () => {
    setCapturedImage('');
  };

  // Start camera when face login is selected
  useEffect(() => {
    if (useFaceLogin && !isCapturing && !capturedImage) {
      startCamera();
    }
  }, [useFaceLogin]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to access your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="login-method-toggle">
          <button 
            onClick={() => toggleLoginMethod()}
            className={`toggle-btn ${!useFaceLogin ? 'active' : ''}`}
          >
            Password Login
          </button>
          <button 
            onClick={() => toggleLoginMethod()}
            className={`toggle-btn ${useFaceLogin ? 'active' : ''}`}
          >
            Face Login
          </button>
        </div>
        
        <div className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          {!useFaceLogin ? (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
          ) : (
            <div className="form-group face-login">
              <label>Face Verification</label>
              
              <div className="face-capture-container">
                {isCapturing ? (
                  <div className="camera-container">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="camera-preview"
                      onLoadedMetadata={() => {
                        // This event ensures the video is ready
                        console.log("Video is ready");
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={captureFace} 
                      className="btn-capture"
                    >
                      Capture
                    </button>
                  </div>
                ) : capturedImage ? (
                  <div className="face-preview-container">
                    <img 
                      src={capturedImage} 
                      alt="Captured face" 
                      className="face-preview" 
                    />
                    <button 
                      type="button" 
                      onClick={resetCapture} 
                      className="btn-secondary"
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={startCamera} 
                    className="btn-secondary"
                  >
                    Start Camera
                  </button>
                )}
                
                {/* Hidden canvas for capturing */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </div>
          )}
          
          <button onClick={handleSubmit} className="btn-primary">Login</button>
        </div>
        
        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onRegisterClick} className="link-button">Register</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;