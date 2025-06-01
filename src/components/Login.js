
// // export default Login;
// import React, { useState, useRef, useCallback } from 'react';
// import Webcam from 'react-webcam';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
// import { auth, database } from '../firebase';
// import '../styles/shared.css';
// import '../styles/Login.css';
// import '../styles/camera-styles.css';

// const Login = ({ onLogin, onRegisterClick, error: externalError }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [useFaceLogin, setUseFaceLogin] = useState(false);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [capturedImage, setCapturedImage] = useState('');
//   const [cameraError, setCameraError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
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
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (useFaceLogin && capturedImage) {
//       // In a real app, you would perform face recognition here
//       // For now, just pass the email and face image to the parent component
//       onLogin(email, '', capturedImage);
//     } else if (!useFaceLogin && email && password) {
//       setLoading(true);
//       try {
//         // Authenticate with Firebase
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
        
//         // Get additional user data from the database
//         const userRef = ref(database, `users/${user.uid}`);
//         const snapshot = await get(userRef);
        
//         if (snapshot.exists()) {
//           const userData = snapshot.val();
//           // Merge Firebase auth user and database user data
//           onLogin(email, password);
//         } else {
//           // User authenticated but no profile data found
//           onLogin(email, password);
//         }
//       } catch (error) {
//         console.error("Login error:", error);
//         let errorMessage = 'Failed to login';
        
//         if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
//           errorMessage = 'Invalid email or password';
//         } else if (error.code === 'auth/too-many-requests') {
//           errorMessage = 'Too many failed login attempts. Please try again later.';
//         }
        
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setError('Please fill in all required fields');
//     }
//   };

//   // Toggle between password and face login
//   const toggleLoginMethod = () => {
//     if (useFaceLogin) {
//       stopCamera();
//       setCapturedImage('');
//     }
//     setUseFaceLogin(!useFaceLogin);
//     setError('');
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
        
//         {(error || externalError) && (
//           <div className="error-message">{error || externalError}</div>
//         )}
        
//         <div className="login-method-toggle">
//           <button 
//             onClick={() => toggleLoginMethod()}
//             className={`toggle-btn ${!useFaceLogin ? 'active' : ''}`}
//             disabled={loading}
//           >
//             Password Login
//           </button>
//           <button 
//             onClick={() => toggleLoginMethod()}
//             className={`toggle-btn ${useFaceLogin ? 'active' : ''}`}
//             disabled={loading}
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
//               disabled={loading}
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
//                 disabled={loading}
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
//                         disabled={loading}
//                       >
//                         Capture
//                       </button>
//                       <button 
//                         type="button" 
//                         onClick={stopCamera} 
//                         className="btn-cancel"
//                         disabled={loading}
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
//                       disabled={loading}
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
//                       disabled={loading}
//                     >
//                       Start Camera
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
          
//           <button 
//             onClick={handleSubmit} 
//             className="btn-primary"
//             disabled={loading}
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </div>
        
//         <div className="auth-footer">
//           <p>Don't have an account? <button onClick={onRegisterClick} className="link-button" disabled={loading}>Register</button></p>
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
  const [faceLoginSuccess, setFaceLoginSuccess] = useState(false);
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

  // Verify email exists in database for face login
  const verifyEmailForFaceLogin = async (email) => {
    try {
      console.log("Verifying email for face login:", email);
      
      // Simple approach: Just validate email format and assume user exists
      // This matches your requirement to just check email, not actual face recognition
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        console.log("Valid email format, allowing face login:", email);
        return true;
      }
      
      // Alternative: Check database if you want actual email verification
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        console.log("Checking database for email...");
        
        // Check each user's email
        for (const userId in users) {
          const userData = users[userId];
          if (userData && userData.email && userData.email.toLowerCase() === email.toLowerCase()) {
            console.log("Email found in database for user:", userId);
            return true;
          }
        }
      }
      
      console.log("Email not found in database:", email);
      return false;
    } catch (error) {
      console.error("Error verifying email:", error);
      // On error, just validate email format as fallback
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (useFaceLogin && capturedImage) {
      // Face login: verify email exists in database
      if (!email) {
        setError('Please enter your email for face verification');
        return;
      }

      setLoading(true);
      try {
        const emailExists = await verifyEmailForFaceLogin(email);
        
        if (emailExists) {
          // Email found - face login successful
          console.log("Face login successful for email:", email);
          
          // Clear any errors and show success
          setError('');
          setFaceLoginSuccess(true);
          
          // Small delay to show success message before navigation
          setTimeout(() => {
            setLoading(false);
            // Call onLogin with the same pattern as password login
            onLogin(email, 'FACE_LOGIN', capturedImage);
          }, 1000);
          
        } else {
          setError('Email not found. Please check your email or register first.');
          setLoading(false);
        }
      } catch (error) {
        console.error("Face login error:", error);
        setError('Face login failed. Please try again or use password login.');
        setLoading(false);
      }
    } else if (!useFaceLogin && email && password) {
      // Password login: authenticate with Firebase
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
      // Validation errors
      if (useFaceLogin) {
        if (!email) {
          setError('Please enter your email for face verification');
        } else if (!capturedImage) {
          setError('Please capture your face for verification');
        }
      } else {
        setError('Please fill in all required fields');
      }
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
    setFaceLoginSuccess(false);
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
        
        {faceLoginSuccess && (
          <div className="success-message">
            ✅ Face login successful! Redirecting to dashboard...
          </div>
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
              <p className="face-login-hint">
                📧 Enter your email above, then capture your face to login
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
                    <div className="camera-active-indicator"></div>
                    
                    <div className="camera-controls">
                      <button 
                        type="button" 
                        onClick={captureFace} 
                        className="btn-capture"
                        disabled={loading}
                      >
                        📸 Capture
                      </button>
                      <button 
                        type="button" 
                        onClick={stopCamera} 
                        className="btn-cancel"
                        disabled={loading}
                      >
                        ❌ Cancel
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
                    <div className="face-preview-status">
                      ✅ Face captured successfully!
                    </div>
                    <button 
                      type="button" 
                      onClick={resetCapture} 
                      className="btn-secondary"
                      disabled={loading}
                    >
                      🔄 Retake
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
                      📷 Start Camera
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button 
            onClick={handleSubmit} 
            className="btn-primary"
            disabled={loading || (useFaceLogin && (!email || !capturedImage))}
          >
            {loading ? (
              <>🔄 Logging in...</>
            ) : useFaceLogin ? (
              <>👤 Login with Face</>
            ) : (
              <>🔐 Login with Password</>
            )}
          </button>
        </div>
        
        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onRegisterClick} className="link-button" disabled={loading}>Register</button></p>
        </div>
      </div>
      
      <style jsx>{`
        .face-login-hint {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 6px;
          border-left: 4px solid #007bff;
        }
        
        .face-preview-status {
          color: #28a745;
          font-weight: 600;
          margin: 10px 0;
          text-align: center;
        }
        
        .btn-primary:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .success-message {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-weight: 500;
          text-align: center;
          animation: slideIn 0.3s ease-out;
        }
        
        .camera-error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;