


// import React, { useState, useRef, useCallback } from 'react';
// import Webcam from 'react-webcam';
// import '../styles/shared.css';
// import '../styles/Login.css';
// import '../styles/camera-styles.css';

// const Login = ({ onLogin, onRegisterClick, error }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [useFaceLogin, setUseFaceLogin] = useState(false);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [capturedImage, setCapturedImage] = useState('');
//   const [cameraError, setCameraError] = useState('');
//   const webcamRef = useRef(null);

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
//       setCapturedImage(imageSrc);
//       setIsCapturing(false);
//     }
//   }, [webcamRef]);

//   // Handle camera errors
//   const handleCameraError = useCallback((error) => {
//     console.error("Camera error:", error);
//     setCameraError('Could not access camera. Please ensure camera permissions are enabled or try password login instead.');
//     setIsCapturing(false);
//   }, []);

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (useFaceLogin && capturedImage) {
//       onLogin(email, '', capturedImage);
//     } else if (!useFaceLogin && email && password) {
//       onLogin(email, password);
//     } else {
//       alert('Please fill in all required fields');
//     }
//   };

//   // Toggle between password and face login
//   const toggleLoginMethod = () => {
//     if (useFaceLogin) {
//       stopCamera();
//       setCapturedImage('');
//     }
//     setUseFaceLogin(!useFaceLogin);
//   };

//   // Reset captured image
//   const resetCapture = () => {
//     setCapturedImage('');
//   };

//   // Webcam configuration
//   const videoConstraints = {
//     width: 1280,
//     height: 720,
//     facingMode: "user"
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <h2>Welcome Back</h2>
//         <p className="auth-subtitle">Login to access your account</p>
        
//         {error && <div className="error-message">{error}</div>}
        
//         <div className="login-method-toggle">
//           <button 
//             onClick={() => toggleLoginMethod()}
//             className={`toggle-btn ${!useFaceLogin ? 'active' : ''}`}
//           >
//             Password Login
//           </button>
//           <button 
//             onClick={() => toggleLoginMethod()}
//             className={`toggle-btn ${useFaceLogin ? 'active' : ''}`}
//           >
//             Face Login
//           </button>
//         </div>
        
//         <div className="auth-form">
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder="Enter your email"
//             />
//           </div>
          
//           {!useFaceLogin ? (
//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="Enter your password"
//               />
//             </div>
//           ) : (
//             <div className="form-group face-login">
//               <label>Face Verification</label>
              
//               <div className="face-capture-container">
//                 {isCapturing ? (
//                   <div className="camera-container">
//                     <Webcam
//                       audio={false}
//                       ref={webcamRef}
//                       screenshotFormat="image/png"
//                       videoConstraints={videoConstraints}
//                       className="camera-preview"
//                       onUserMediaError={handleCameraError}
//                       mirrored={true}
//                     />
//                     <div className="camera-active-indicator"></div>
                    
//                     <div className="camera-controls">
//                       <button 
//                         type="button" 
//                         onClick={captureFace} 
//                         className="btn-capture"
//                       >
//                         Capture
//                       </button>
//                       <button 
//                         type="button" 
//                         onClick={stopCamera} 
//                         className="btn-cancel"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : capturedImage ? (
//                   <div className="face-preview-container">
//                     <img 
//                       src={capturedImage} 
//                       alt="Captured face" 
//                       className="face-preview" 
//                     />
//                     <button 
//                       type="button" 
//                       onClick={resetCapture} 
//                       className="btn-secondary"
//                     >
//                       Retake
//                     </button>
//                   </div>
//                 ) : (
//                   <div>
//                     {cameraError && <div className="camera-error">{cameraError}</div>}
//                     <button 
//                       type="button" 
//                       onClick={startCamera} 
//                       className="btn-secondary"
//                     >
//                       Start Camera
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
          
//           <button onClick={handleSubmit} className="btn-primary">Login</button>
//         </div>
        
//         <div className="auth-footer">
//           <p>Don't have an account? <button onClick={onRegisterClick} className="link-button">Register</button></p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '../firebase';
import '../styles/shared.css';
import '../styles/Login.css';
import '../styles/camera-styles.css';

const Login = ({ onLogin, onRegisterClick, error: externalError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useFaceLogin, setUseFaceLogin] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const webcamRef = useRef(null);

  // Start camera
  const startCamera = () => {
    setCameraError('');
    setIsCapturing(true);
  };

  // Stop camera
  const stopCamera = () => {
    setIsCapturing(false);
  };

  // Capture face
  const captureFace = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setIsCapturing(false);
    }
  }, [webcamRef]);

  // Handle camera errors
  const handleCameraError = useCallback((error) => {
    console.error("Camera error:", error);
    setCameraError('Could not access camera. Please ensure camera permissions are enabled or try password login instead.');
    setIsCapturing(false);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (useFaceLogin && capturedImage) {
      // In a real app, you would perform face recognition here
      // For now, just pass the email and face image to the parent component
      onLogin(email, '', capturedImage);
    } else if (!useFaceLogin && email && password) {
      setLoading(true);
      try {
        // Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get additional user data from the database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          // Merge Firebase auth user and database user data
          onLogin(email, password);
        } else {
          // User authenticated but no profile data found
          onLogin(email, password);
        }
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = 'Failed to login';
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = 'Invalid email or password';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed login attempts. Please try again later.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please fill in all required fields');
    }
  };

  // Toggle between password and face login
  const toggleLoginMethod = () => {
    if (useFaceLogin) {
      stopCamera();
      setCapturedImage('');
    }
    setUseFaceLogin(!useFaceLogin);
    setError('');
  };

  // Reset captured image
  const resetCapture = () => {
    setCapturedImage('');
  };

  // Webcam configuration
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to access your account</p>
        
        {(error || externalError) && (
          <div className="error-message">{error || externalError}</div>
        )}
        
        <div className="login-method-toggle">
          <button 
            onClick={() => toggleLoginMethod()}
            className={`toggle-btn ${!useFaceLogin ? 'active' : ''}`}
            disabled={loading}
          >
            Password Login
          </button>
          <button 
            onClick={() => toggleLoginMethod()}
            className={`toggle-btn ${useFaceLogin ? 'active' : ''}`}
            disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
              />
            </div>
          ) : (
            <div className="form-group face-login">
              <label>Face Verification</label>
              
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
                    <div className="camera-active-indicator"></div>
                    
                    <div className="camera-controls">
                      <button 
                        type="button" 
                        onClick={captureFace} 
                        className="btn-capture"
                        disabled={loading}
                      >
                        Capture
                      </button>
                      <button 
                        type="button" 
                        onClick={stopCamera} 
                        className="btn-cancel"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
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
                      disabled={loading}
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <div>
                    {cameraError && <div className="camera-error">{cameraError}</div>}
                    <button 
                      type="button" 
                      onClick={startCamera} 
                      className="btn-secondary"
                      disabled={loading}
                    >
                      Start Camera
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button 
            onClick={handleSubmit} 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        
        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onRegisterClick} className="link-button" disabled={loading}>Register</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;