




// import React, { useState, useRef, useCallback } from 'react';
// import Webcam from 'react-webcam';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { ref, set } from 'firebase/database';
// import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
// import { auth, database, storage } from '../firebase';
// import '../styles/shared.css';
// import '../styles/Register.css';
// import '../styles/camera-styles.css';

// const Register = ({ onRegister, onLoginClick }) => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [faceImage, setFaceImage] = useState('');
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [cameraError, setCameraError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const webcamRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Start camera 
//   const startCamera = () => {
//     setCameraError('');
//     setIsCapturing(true);
//   };

//   // Stop camera
//   const stopCamera = () => {
//     setIsCapturing(false);
//   };

//   // Capture face
//   const captureFace = useCallback(() => {
//     if (webcamRef.current) {
//       const imageSrc = webcamRef.current.getScreenshot();
//       setFaceImage(imageSrc);
//       setIsCapturing(false);
//     }
//   }, [webcamRef]);

//   // Handle camera errors
//   const handleCameraError = useCallback((error) => {
//     console.error("Camera error:", error);
//     setCameraError('Could not access camera. Please ensure camera permissions are enabled or try image upload instead.');
//     setIsCapturing(false);
//   }, []);

//   // Handle file upload with validation
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file is an image
//       if (!file.type.match('image.*')) {
//         setError('Please select an image file');
//         return;
//       }
      
//       // Validate file size (5MB max)
//       if (file.size > 5 * 1024 * 1024) {
//         setError('Image size should be less than 5MB');
//         return;
//       }
      
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setFaceImage(event.target.result);
//       };
//       reader.onerror = () => {
//         setError('Error reading file. Please try again.');
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle form submission with validation
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Reset previous errors
//     setError('');
    
//     // Validate all fields
//     if (!name.trim()) {
//       setError('Please enter your name');
//       return;
//     }
    
//     if (!email.trim()) {
//       setError('Please enter your email');
//       return;
//     }
    
//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address');
//       return;
//     }
    
//     if (!password) {
//       setError('Please create a password');
//       return;
//     }
    
//     // Password strength validation
//     if (password.length < 8) {
//       setError('Password should be at least 8 characters long');
//       return;
//     }
    
//     if (!faceImage) {
//       setError('Please capture or upload your face image');
//       return;
//     }
    
//     // All validations passed, proceed with registration
//     setLoading(true);
    
//     try {
//       // 1. Create user with email and password in Firebase
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
      
//       // 2. Upload face image to Firebase Storage
//       const imageRef = storageRef(storage, `faces/${user.uid}`);
//       await uploadString(imageRef, faceImage, 'data_url');
//       const faceImageUrl = await getDownloadURL(imageRef);
      
//       // 3. Store user data in Firebase Realtime Database
//       await set(ref(database, `users/${user.uid}`), {
//         name,
//         email,
//         faceImageUrl,
//         createdAt: new Date().toISOString()
//       });
      
//       // 4. Call onRegister with user data for your app's state
//       onRegister({
//         name,
//         email,
//         password,
//         faceImage: faceImageUrl,
//         id: user.uid,
//         createdAt: new Date().toISOString()
//       });
      
//     } catch (error) {
//       console.error("Registration error:", error);
//       let errorMessage = 'Failed to create account';
      
//       if (error.code === 'auth/email-already-in-use') {
//         errorMessage = 'Email is already in use. Please use a different email or try logging in.';
//       } else if (error.code === 'auth/weak-password') {
//         errorMessage = 'Password is too weak. Please choose a stronger password.';
//       } else if (error.code === 'auth/invalid-email') {
//         errorMessage = 'Invalid email address format.';
//       }
      
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset face image
//   const resetFaceImage = () => {
//     setFaceImage('');
//   };

//   // Trigger file input click
//   const triggerFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   // Webcam configuration
//   const videoConstraints = {
//     width: 1280,
//     height: 720,
//     facingMode: "user"
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card register-card">
//         <h2>Create Account</h2>
//         <p className="auth-subtitle">Register to access secure areas</p>
        
//         {error && <div className="error-message">{error}</div>}
        
//         <div className="auth-form">
//           <div className="form-group">
//             <label htmlFor="name">Full Name</label>
//             <input
//               type="text"
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               placeholder="Enter your full name"
//               disabled={loading}
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder="Enter your email"
//               disabled={loading}
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               placeholder="Create a password"
//               minLength="8"
//               disabled={loading}
//             />
//             <div className="password-requirements">
//               Password must be at least 8 characters long
//             </div>
//           </div>
          
//           <div className="form-group face-registration">
//             <label>Face Registration</label>
            
//             <div className="face-capture-container">
//               {isCapturing ? (
//                 <div className="camera-container">
//                   <Webcam
//                     audio={false}
//                     ref={webcamRef}
//                     screenshotFormat="image/png"
//                     videoConstraints={videoConstraints}
//                     className="camera-preview"
//                     onUserMediaError={handleCameraError}
//                     mirrored={true}
//                   />
//                   <div className="camera-active-indicator"></div>
                  
//                   <div className="camera-controls">
//                     <button 
//                       type="button" 
//                       onClick={captureFace} 
//                       className="btn-capture"
//                       disabled={loading}
//                     >
//                       Capture
//                     </button>
//                     <button 
//                       type="button" 
//                       onClick={stopCamera} 
//                       className="btn-cancel"
//                       disabled={loading}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : faceImage ? (
//                 <div className="face-preview-container">
//                   <img 
//                     src={faceImage} 
//                     alt="Captured face" 
//                     className="face-preview" 
//                   />
//                   <button 
//                     type="button" 
//                     onClick={resetFaceImage} 
//                     className="btn-secondary"
//                     disabled={loading}
//                   >
//                     Retake
//                   </button>
//                 </div>
//               ) : (
//                 <div className="capture-options">
//                   {cameraError && <div className="camera-error">{cameraError}</div>}
//                   <button 
//                     type="button" 
//                     onClick={startCamera} 
//                     className="btn-secondary"
//                     disabled={loading}
//                   >
//                     Use Camera
//                   </button>
//                   <span className="or-divider">OR</span>
//                   <button 
//                     type="button"
//                     onClick={triggerFileInput}
//                     className="file-upload-label"
//                     disabled={loading}
//                   >
//                     Upload Image
//                   </button>
//                   <input 
//                     ref={fileInputRef}
//                     type="file" 
//                     accept="image/*" 
//                     onChange={handleFileUpload} 
//                     className="file-input"
//                     style={{ display: 'none' }}
//                     disabled={loading}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
          
//           <button 
//             onClick={handleSubmit} 
//             className="btn-primary"
//             disabled={loading}
//           >
//             {loading ? 'Registering...' : 'Register'}
//           </button>
//         </div>
        
//         <div className="auth-footer">
//           <p>Already have an account? <button onClick={onLoginClick} className="link-button" disabled={loading}>Login</button></p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;




import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, database, storage } from '../firebase';
import '../styles/shared.css';
import '../styles/Register.css';
import '../styles/camera-styles.css';

// Import face detection model - this would be implemented with face-api.js in a real app
// We're simulating the face detection functionality here
const simulateFaceDetection = (imageData) => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Simulate 90% success rate for face detection
      const faceDetected = Math.random() > 0.1;
      resolve({
        faceDetected,
        facePosition: faceDetected ? {
          x: Math.random() * 0.2 + 0.4, // Position between 40-60% of width
          y: Math.random() * 0.2 + 0.4, // Position between 40-60% of height
          width: Math.random() * 0.2 + 0.3, // Width between 30-50% of image
          height: Math.random() * 0.2 + 0.3 // Height between 30-50% of image
        } : null
      });
    }, 500);
  });
};

const Register = ({ onRegister, onLoginClick }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceImage, setFaceImage] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const faceDetectionInterval = useRef(null);

  // Start camera 
  const startCamera = () => {
    setCameraError('');
    setIsCapturing(true);
  };

  // Stop camera and clear face detection interval
  const stopCamera = () => {
    setIsCapturing(false);
    if (faceDetectionInterval.current) {
      clearInterval(faceDetectionInterval.current);
      faceDetectionInterval.current = null;
    }
    setFaceDetected(false);
    setFacePosition(null);
  };

  // Set up face detection when camera is active
  useEffect(() => {
    if (isCapturing && webcamRef.current) {
      // Start face detection at regular intervals
      faceDetectionInterval.current = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            // Detect face in the current webcam frame
            const result = await simulateFaceDetection(imageSrc);
            setFaceDetected(result.faceDetected);
            setFacePosition(result.facePosition);
          }
        }
      }, 1000); // Check for face every second
    }

    return () => {
      // Clean up interval on unmount or when camera is stopped
      if (faceDetectionInterval.current) {
        clearInterval(faceDetectionInterval.current);
        faceDetectionInterval.current = null;
      }
    };
  }, [isCapturing]);

  // Capture face with optimal positioning
  const captureFace = useCallback(async () => {
    if (webcamRef.current) {
      setImageProcessing(true);
      
      // Capture image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Process and validate the captured image
      const result = await simulateFaceDetection(imageSrc);
      
      if (result.faceDetected) {
        // In a real implementation, you would crop around the detected face
        // For now, we're just using the full image
        setFaceImage(imageSrc);
        setFaceDetected(true);
        setFacePosition(result.facePosition);
      } else {
        setError('No face detected in the image. Please try again with your face clearly visible.');
      }
      
      setImageProcessing(false);
      setIsCapturing(false);
      
      if (faceDetectionInterval.current) {
        clearInterval(faceDetectionInterval.current);
        faceDetectionInterval.current = null;
      }
    }
  }, [webcamRef]);

  // Handle camera errors
  const handleCameraError = useCallback((error) => {
    console.error("Camera error:", error);
    setCameraError('Could not access camera. Please ensure camera permissions are enabled or try image upload instead.');
    setIsCapturing(false);
  }, []);

  // Process and validate uploaded image
  const processUploadedImage = async (imageDataUrl) => {
    setImageProcessing(true);
    
    try {
      // Check image dimensions and resize if needed
      const img = new Image();
      
      img.onload = async () => {
        // Simulate face detection on the uploaded image
        const result = await simulateFaceDetection(imageDataUrl);
        
        if (result.faceDetected) {
          // In a real implementation, you would crop around the detected face
          setFaceImage(imageDataUrl);
          setFaceDetected(true);
          setFacePosition(result.facePosition);
        } else {
          setError('No face detected in the uploaded image. Please upload a clear photo of your face.');
          setFaceImage('');
        }
        
        setImageProcessing(false);
      };
      
      img.onerror = () => {
        setError('Failed to process image. Please try again with a different image.');
        setImageProcessing(false);
      };
      
      img.src = imageDataUrl;
    } catch (error) {
      console.error('Image processing error:', error);
      setError('Failed to process image. Please try again.');
      setImageProcessing(false);
    }
  };

  // Handle file upload with validation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file is an image
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        processUploadedImage(event.target.result);
      };
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated upload progress
  const simulateUploadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(Math.floor(progress));
    }, 300);
    
    return () => clearInterval(interval);
  };

  // Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setError('');
    
    // Validate all fields
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password) {
      setError('Please create a password');
      return;
    }
    
    // Password strength validation
    if (password.length < 8) {
      setError('Password should be at least 8 characters long');
      return;
    }
    
    if (!faceImage) {
      setError('Please capture or upload your face image');
      return;
    }
    
    // All validations passed, proceed with registration
    setLoading(true);
    setUploadProgress(0);
    
    // Start upload progress simulation
    const stopProgressSimulation = simulateUploadProgress();
    
    try {
      // 1. Create user with email and password in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Upload face image to Firebase Storage
      const imageRef = storageRef(storage, `faces/${user.uid}`);
      await uploadString(imageRef, faceImage, 'data_url');
      const faceImageUrl = await getDownloadURL(imageRef);
      
      // Complete progress
      setUploadProgress(100);
      
      // 3. Store user data in Firebase Realtime Database with quality metrics
      await set(ref(database, `users/${user.uid}`), {
        name,
        email,
        faceImageUrl,
        facialRecognitionEnabled: true,
        faceImageQuality: 'high', // In a real app, you'd analyze the image and rate quality
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      // 4. Call onRegister with user data for your app's state
      onRegister({
        name,
        email,
        password,
        faceImage: faceImageUrl,
        id: user.uid,
        createdAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use. Please use a different email or try logging in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      
      setError(errorMessage);
    } finally {
      stopProgressSimulation();
      setLoading(false);
    }
  };

  // Reset face image
  const resetFaceImage = () => {
    setFaceImage('');
    setFaceDetected(false);
    setFacePosition(null);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Webcam configuration
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Register to access secure areas</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              minLength="8"
              disabled={loading}
            />
            <div className="password-requirements">
              Password must be at least 8 characters long
            </div>
          </div>
          
          <div className="form-group face-registration">
            <label>Face Registration</label>
            <p className="face-instruction">
              Your face image will be used for identity verification
            </p>
            
            <div className="face-capture-container">
              {isCapturing ? (
                <div className="camera-container">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    videoConstraints={videoConstraints}
                    className="camera-preview"
                    onUserMediaError={handleCameraError}
                    mirrored={true}
                  />
                  
                  {/* Face detection guide overlay */}
                  <div className={`face-detection-guide ${faceDetected ? 'face-detected' : ''}`}>
                    <div className="face-oval"></div>
                    <p className="detection-status">
                      {faceDetected 
                        ? 'Face detected! Position your face in the oval and click Capture.' 
                        : 'No face detected. Please position your face in the frame.'}
                    </p>
                  </div>
                  
                  <div className="camera-active-indicator"></div>
                  
                  <div className="camera-controls">
                    <button 
                      type="button" 
                      onClick={captureFace} 
                      className={`btn-capture ${!faceDetected ? 'btn-disabled' : ''}`}
                      disabled={loading || imageProcessing || !faceDetected}
                    >
                      {imageProcessing ? 'Processing...' : 'Capture'}
                    </button>
                    <button 
                      type="button" 
                      onClick={stopCamera} 
                      className="btn-cancel"
                      disabled={loading || imageProcessing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : faceImage ? (
                <div className="face-preview-container">
                  <div className="face-preview-wrapper">
                    <img 
                      src={faceImage} 
                      alt="Captured face" 
                      className="face-preview" 
                    />
                    <div className="face-quality-indicator">
                      <span className="quality-badge quality-high">High Quality</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={resetFaceImage} 
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <div className="capture-options">
                  {cameraError && <div className="camera-error">{cameraError}</div>}
                  <div className="face-placeholder">
                    <div className="face-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="5"></circle>
                        <path d="M20 21a8 8 0 0 0-16 0"></path>
                      </svg>
                    </div>
                    <p>No face image captured</p>
                  </div>
                  
                  <div className="capture-buttons">
                    <button 
                      type="button" 
                      onClick={startCamera} 
                      className="btn-secondary"
                      disabled={loading || imageProcessing}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      Use Camera
                    </button>
                    <span className="or-divider">OR</span>
                    <button 
                      type="button"
                      onClick={triggerFileInput}
                      className="file-upload-label"
                      disabled={loading || imageProcessing}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Upload Image
                    </button>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="file-input"
                    style={{ display: 'none' }}
                    disabled={loading || imageProcessing}
                  />
                  
                  {imageProcessing && (
                    <div className="processing-indicator">
                      <p>Processing image...</p>
                      <div className="processing-spinner"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleSubmit} 
            className="btn-primary"
            disabled={loading || imageProcessing || !faceImage}
          >
            {loading ? (
              <div className="loading-state">
                <span>Registering...</span>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : 'Register'}
          </button>
        </div>
        
        <div className="auth-footer">
          <p>Already have an account? <button onClick={onLoginClick} className="link-button" disabled={loading}>Login</button></p>
        </div>
      </div>
    </div>
  );
};

export default Register;