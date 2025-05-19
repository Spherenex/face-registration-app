


// import React, { useState, useEffect } from 'react';
// import { onAuthStateChanged, signOut } from 'firebase/auth';
// import { ref, get, push, set, onValue } from 'firebase/database';
// import { auth, database } from './firebase';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import Login from './components/Login';
// import Register from './components/Register';
// import Dashboard from './components/Dashboard';
// import SlotBooking from './components/SlotBooking';
// import Payment from './components/Payment';
// import Notifications from './components/Notifications';
// import CheckIn from './components/CheckIn';
// import './styles.css';

// const App = () => {
//   // State variables
//   const [currentPage, setCurrentPage] = useState('login');
//   const [loggedInUser, setLoggedInUser] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [loginError, setLoginError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [selectedBooking, setSelectedBooking] = useState(null);
  
//   // Check if the user is already logged in when the app loads
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         try {
//           // Fetch user data from the database
//           const userRef = ref(database, `users/${user.uid}`);
//           const snapshot = await get(userRef);
          
//           if (snapshot.exists()) {
//             const userData = snapshot.val();
//             // Set the logged in user with data from both auth and database
//             setLoggedInUser({
//               ...userData,
//               id: user.uid,
//               email: user.email
//             });
//             setCurrentPage('dashboard');
//           } else {
//             // User exists in auth but not in database
//             setLoggedInUser({
//               id: user.uid,
//               email: user.email,
//               name: user.displayName || user.email.split('@')[0]
//             });
//             setCurrentPage('dashboard');
//           }
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//           setLoginError('Error loading user profile. Please try logging in again.');
//           setCurrentPage('login');
//         }
//       } else {
//         // No user is logged in
//         setLoggedInUser(null);
//         setCurrentPage('login');
//       }
//       setLoading(false);
//     });

//     // Cleanup the subscription on unmount
//     return () => unsubscribe();
//   }, []);

//   // Fetch notifications when user logs in
//   useEffect(() => {
//     if (loggedInUser && loggedInUser.id) {
//       const notificationsRef = ref(database, `users/${loggedInUser.id}/notifications`);
      
//       const unsubscribe = onValue(notificationsRef, (snapshot) => {
//         if (snapshot.exists()) {
//           const notificationsData = snapshot.val();
//           const notificationsArray = Object.keys(notificationsData).map(key => ({
//             id: key,
//             ...notificationsData[key]
//           }));
          
//           // Sort notifications by date (newest first)
//           notificationsArray.sort((a, b) => {
//             return new Date(b.createdAt) - new Date(a.createdAt);
//           });
          
//           setNotifications(notificationsArray);
//         } else {
//           setNotifications([]);
//         }
//       });
      
//       return () => unsubscribe();
//     }
//   }, [loggedInUser]);
  
//   // Handle Login
//   const handleLogin = async (email, password, faceImage = null) => {
//     // The actual Firebase authentication is handled in the Login component
//     // Here we just need to set the app state
//     try {
//       // Get the current user from Firebase (should be set after successful login)
//       const user = auth.currentUser;
      
//       if (user) {
//         // Fetch user data from the database
//         const userRef = ref(database, `users/${user.uid}`);
//         const snapshot = await get(userRef);
        
//         if (snapshot.exists()) {
//           const userData = snapshot.val();
//           setLoggedInUser({
//             ...userData,
//             id: user.uid,
//             email: user.email
//           });
//         } else {
//           setLoggedInUser({
//             id: user.uid,
//             email: user.email,
//             name: user.displayName || email.split('@')[0]
//           });
//         }
        
//         setLoginError('');
//         setCurrentPage('dashboard');
        
//         // Add a notification
//         addNotification(user.uid, 'You have logged in successfully.', 'info');
//       } else {
//         // This should not happen if the Login component works correctly
//         setLoginError('Login failed. Please try again.');
//       }
//     } catch (error) {
//       console.error("Login error in App:", error);
//       setLoginError('Login failed: ' + (error.message || 'Unknown error'));
//     }
//   };
  
//   // Handle Registration
//   const handleRegister = (userData) => {
//     // The actual Firebase registration is handled in the Register component
//     // Here we just need to set the app state
//     setLoggedInUser(userData);
//     setCurrentPage('dashboard');
    
//     // Add a notification
//     addNotification(userData.id, 'Welcome! Your account has been created successfully.', 'success');
//   };
  
//   // Handle Logout
//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       setLoggedInUser(null);
//       setCurrentPage('login');
//       setLoginError('');
//     } catch (error) {
//       console.error("Logout error:", error);
//       if (loggedInUser && loggedInUser.id) {
//         addNotification(loggedInUser.id, 'Error logging out. Please try again.', 'error');
//       }
//     }
//   };
  
//   // Book a slot
//   const handleBookSlot = (date, seats, match) => {
//     // The actual booking is handled in the SlotBooking component with Firebase
    
//     // Add a notification about the booking
//     if (loggedInUser && loggedInUser.id) {
//       const matchDate = new Date(date).toLocaleDateString();
      
//       // Create a notification message without referencing match.time
//       const notificationMessage = `Your booking for ${match.title} on ${matchDate} has been confirmed.`;
      
//       addNotification(
//         loggedInUser.id, 
//         notificationMessage, 
//         'success'
//       );
//     }
    
//     // Go back to dashboard
//     setCurrentPage('dashboard');
//   };
  
//   // Handle payment initiation
//   const handlePaymentClick = (booking) => {
//     setSelectedBooking(booking);
//     setCurrentPage('payment');
//   };
  
//   // Handle payment completion
//   const handlePaymentComplete = async (bookingId, paymentId) => {
//     if (loggedInUser && loggedInUser.id) {
//       // Add a notification about the payment
//       addNotification(
//         loggedInUser.id,
//         `Payment completed successfully for booking ${bookingId.slice(0, 8)}...`,
//         'success'
//       );
//     }
//   };
  
//   // Mark notification as read
//   const handleMarkAsRead = async (notificationId) => {
//     if (loggedInUser && loggedInUser.id) {
//       try {
//         const notificationRef = ref(database, `users/${loggedInUser.id}/notifications/${notificationId}`);
//         await set(notificationRef, {
//           ...notifications.find(n => n.id === notificationId),
//           isRead: true
//         });
//       } catch (error) {
//         console.error("Error marking notification as read:", error);
//       }
//     }
//   };
  
//   // Add a new notification
//   const addNotification = async (userId, message, type) => {
//     try {
//       const notificationsRef = ref(database, `users/${userId}/notifications`);
//       const newNotificationRef = push(notificationsRef);
      
//       await set(newNotificationRef, {
//         message,
//         type,
//         isRead: false,
//         createdAt: new Date().toISOString()
//       });
//     } catch (error) {
//       console.error("Error adding notification:", error);
//     }
//   };
  
//   // Handle Check-in Completion
//   const handleCheckInComplete = (success) => {
//     if (success && loggedInUser && loggedInUser.id) {
//       addNotification(loggedInUser.id, 'Check-in successful! Welcome to the stadium.', 'success');
//     }
//     setCurrentPage('dashboard');
//   };
  
//   // Get unread notifications count
//   const getUnreadNotificationsCount = () => {
//     return notifications.filter(n => !n.isRead).length;
//   };

//   // Show loading state while checking auth
//   if (loading) {
//     return (
//       <div className="app-container">
//         <div className="loading-spinner">Loading...</div>
//       </div>
//     );
//   }

//   // Render different pages based on currentPage state
//   const renderPage = () => {
//     switch(currentPage) {
//       case 'login':
//         return (
//           <Login 
//             onLogin={handleLogin} 
//             onRegisterClick={() => setCurrentPage('register')} 
//             error={loginError}
//           />
//         );
//       case 'register':
//         return (
//           <Register 
//             onRegister={handleRegister} 
//             onLoginClick={() => setCurrentPage('login')}
//           />
//         );
//       case 'dashboard':
//         return (
//           <Dashboard 
//             user={loggedInUser}
//             onLogout={handleLogout}
//             onBookSlotClick={() => setCurrentPage('bookSlot')}
//             onNotificationsClick={() => setCurrentPage('notifications')}
//             onCheckInClick={() => setCurrentPage('checkIn')}
//             onPaymentClick={handlePaymentClick}
//             unreadNotifications={getUnreadNotificationsCount()}
//           />
//         );
//       case 'bookSlot':
//         return (
//           <SlotBooking 
//             onBookSlot={handleBookSlot}
//             onBack={() => setCurrentPage('dashboard')}
//             user={loggedInUser}
//           />
//         );
//       case 'payment':
//         return (
//           <Payment 
//             booking={selectedBooking}
//             user={loggedInUser}
//             onBack={() => setCurrentPage('dashboard')}
//             onPaymentComplete={handlePaymentComplete}
//           />
//         );
//       case 'notifications':
//         return (
//           <Notifications 
//             notifications={notifications}
//             onMarkAsRead={handleMarkAsRead}
//             onBack={() => setCurrentPage('dashboard')}
//           />
//         );
//       case 'checkIn':
//         return (
//           <CheckIn 
//             user={loggedInUser}
//             onBack={() => setCurrentPage('dashboard')}
//             onCheckInComplete={handleCheckInComplete}
//           />
//         );
//       default:
//         return (
//           <Login 
//             onLogin={handleLogin} 
//             onRegisterClick={() => setCurrentPage('register')} 
//             error={loginError}
//           />
//         );
//     }
//   };

//   return (
//     <div className="app-container">
//       <Header currentPage={currentPage} />
//       <main className="main-content">
//         {renderPage()}
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default App;






import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get, push, set, onValue } from 'firebase/database';
import { auth, database } from './firebase';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SlotBooking from './components/SlotBooking';
import Payment from './components/Payment';
import Notifications from './components/Notifications';
import CheckIn from './components/CheckIn';
import './styles.css';

const App = () => {
  // State variables
  const [currentPage, setCurrentPage] = useState('login');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Check if the user is already logged in when the app loads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from the database
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            // Set the logged in user with data from both auth and database
            setLoggedInUser({
              ...userData,
              id: user.uid,
              email: user.email
            });
            setCurrentPage('dashboard');
          } else {
            // User exists in auth but not in database
            setLoggedInUser({
              id: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0]
            });
            setCurrentPage('dashboard');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoginError('Error loading user profile. Please try logging in again.');
          setCurrentPage('login');
        }
      } else {
        // No user is logged in
        setLoggedInUser(null);
        setCurrentPage('login');
      }
      setLoading(false);
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch notifications when user logs in
  useEffect(() => {
    if (loggedInUser && loggedInUser.id) {
      // CHANGED: Updated path to stadium_notifications
      const notificationsRef = ref(database, `users/${loggedInUser.id}/stadium_notifications`);
      
      const unsubscribe = onValue(notificationsRef, (snapshot) => {
        if (snapshot.exists()) {
          const notificationsData = snapshot.val();
          const notificationsArray = Object.keys(notificationsData).map(key => ({
            id: key,
            ...notificationsData[key]
          }));
          
          // Sort notifications by date (newest first)
          notificationsArray.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          setNotifications(notificationsArray);
        } else {
          setNotifications([]);
        }
      });
      
      return () => unsubscribe();
    }
  }, [loggedInUser]);
  
  // Handle Login
  const handleLogin = async (email, password, faceImage = null) => {
    // The actual Firebase authentication is handled in the Login component
    // Here we just need to set the app state
    try {
      // Get the current user from Firebase (should be set after successful login)
      const user = auth.currentUser;
      
      if (user) {
        // Fetch user data from the database
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setLoggedInUser({
            ...userData,
            id: user.uid,
            email: user.email
          });
        } else {
          setLoggedInUser({
            id: user.uid,
            email: user.email,
            name: user.displayName || email.split('@')[0]
          });
        }
        
        setLoginError('');
        setCurrentPage('dashboard');
        
        // Add a notification
        addNotification(user.uid, 'You have logged in successfully.', 'info');
      } else {
        // This should not happen if the Login component works correctly
        setLoginError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Login error in App:", error);
      setLoginError('Login failed: ' + (error.message || 'Unknown error'));
    }
  };
  
  // Handle Registration
  const handleRegister = (userData) => {
    // The actual Firebase registration is handled in the Register component
    // Here we just need to set the app state
    setLoggedInUser(userData);
    setCurrentPage('dashboard');
    
    // Add a notification
    addNotification(userData.id, 'Welcome! Your account has been created successfully.', 'success');
  };
  
  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedInUser(null);
      setCurrentPage('login');
      setLoginError('');
    } catch (error) {
      console.error("Logout error:", error);
      if (loggedInUser && loggedInUser.id) {
        addNotification(loggedInUser.id, 'Error logging out. Please try again.', 'error');
      }
    }
  };
  
  // Book a slot
  const handleBookSlot = (date, seats, match) => {
    // The actual booking is handled in the SlotBooking component with Firebase
    
    // Add a notification about the booking
    if (loggedInUser && loggedInUser.id) {
      const matchDate = new Date(date).toLocaleDateString();
      
      // Create a notification message without referencing match.time
      const notificationMessage = `Your booking for ${match.title} on ${matchDate} has been confirmed.`;
      
      addNotification(
        loggedInUser.id, 
        notificationMessage, 
        'success'
      );
    }
    
    // Go back to dashboard
    setCurrentPage('dashboard');
  };
  
  // Handle payment initiation
  const handlePaymentClick = (booking) => {
    setSelectedBooking(booking);
    setCurrentPage('payment');
  };
  
  // Handle payment completion
  const handlePaymentComplete = async (bookingId, paymentId) => {
    if (loggedInUser && loggedInUser.id) {
      // Add a notification about the payment
      addNotification(
        loggedInUser.id,
        `Payment completed successfully for booking ${bookingId.slice(0, 8)}...`,
        'success'
      );
    }
  };
  
  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    if (loggedInUser && loggedInUser.id) {
      try {
        // CHANGED: Updated path to stadium_notifications
        const notificationRef = ref(database, `users/${loggedInUser.id}/stadium_notifications/${notificationId}`);
        await set(notificationRef, {
          ...notifications.find(n => n.id === notificationId),
          isRead: true
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };
  
  // Add a new notification
  const addNotification = async (userId, message, type) => {
    try {
      // CHANGED: Updated path to stadium_notifications
      const notificationsRef = ref(database, `users/${userId}/stadium_notifications`);
      const newNotificationRef = push(notificationsRef);
      
      await set(newNotificationRef, {
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };
  
  // Handle Check-in Completion
  const handleCheckInComplete = (success) => {
    if (success && loggedInUser && loggedInUser.id) {
      addNotification(loggedInUser.id, 'Check-in successful! Welcome to the stadium.', 'success');
    }
    setCurrentPage('dashboard');
  };
  
  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Render different pages based on currentPage state
  const renderPage = () => {
    switch(currentPage) {
      case 'login':
        return (
          <Login 
            onLogin={handleLogin} 
            onRegisterClick={() => setCurrentPage('register')} 
            error={loginError}
          />
        );
      case 'register':
        return (
          <Register 
            onRegister={handleRegister} 
            onLoginClick={() => setCurrentPage('login')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            user={loggedInUser}
            onLogout={handleLogout}
            onBookSlotClick={() => setCurrentPage('bookSlot')}
            onNotificationsClick={() => setCurrentPage('notifications')}
            onCheckInClick={() => setCurrentPage('checkIn')}
            onPaymentClick={handlePaymentClick}
            unreadNotifications={getUnreadNotificationsCount()}
          />
        );
      case 'bookSlot':
        return (
          <SlotBooking 
            onBookSlot={handleBookSlot}
            onBack={() => setCurrentPage('dashboard')}
            user={loggedInUser}
          />
        );
      case 'payment':
        return (
          <Payment 
            booking={selectedBooking}
            user={loggedInUser}
            onBack={() => setCurrentPage('dashboard')}
            onPaymentComplete={handlePaymentComplete}
          />
        );
      case 'notifications':
        return (
          <Notifications 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      case 'checkIn':
        return (
          <CheckIn 
            user={loggedInUser}
            onBack={() => setCurrentPage('dashboard')}
            onCheckInComplete={handleCheckInComplete}
          />
        );
      default:
        return (
          <Login 
            onLogin={handleLogin} 
            onRegisterClick={() => setCurrentPage('register')} 
            error={loginError}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Header currentPage={currentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;