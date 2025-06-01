




// import React, { useState, useEffect } from 'react';
// import { ref, onValue, update, push } from 'firebase/database';
// import { database } from '../firebase';
// import { Camera, CreditCard, CheckCircle, User, Send } from 'lucide-react';
// import '../styles/Dashboard.css';

// const Dashboard = ({ user, onLogout, onBookSlotClick, onNotificationsClick, onPaymentClick, unreadNotifications }) => {
//   const [userBookings, setUserBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [processingPayment, setProcessingPayment] = useState(null);
//   const [transferringTicket, setTransferringTicket] = useState(null);
//   const [paymentSuccess, setPaymentSuccess] = useState({});
//   const [transferSuccess, setTransferSuccess] = useState({});

//   // Fetch user's bookings from Firebase
//   useEffect(() => {
//     if (user && user.id) {
//       setLoading(true);
//       const userBookingsRef = ref(database, `users/${user.id}/stadium_bookings`);
      
//       const unsubscribe = onValue(userBookingsRef, (snapshot) => {
//         if (snapshot.exists()) {
//           const bookingsData = snapshot.val();
//           const bookingsArray = Object.keys(bookingsData).map(key => ({
//             id: key,
//             ...bookingsData[key],
//             paymentStatus: bookingsData[key].paymentStatus || 'pending', // Default to pending if not set
//             transferStatus: bookingsData[key].transferStatus || 'not_transferred' // Default to not transferred
//           }));
          
//           // Sort bookings by date (most recent first)
//           bookingsArray.sort((a, b) => {
//             const dateA = new Date(a.matchDate);
//             const dateB = new Date(b.matchDate);
//             return dateB - dateA;
//           });
          
//           setUserBookings(bookingsArray);
//         } else {
//           setUserBookings([]);
//         }
//         setLoading(false);
//       });
      
//       return () => unsubscribe();
//     }
//   }, [user]);

//   // Create a payment successful notification
//   const createPaymentNotification = async (booking) => {
//     if (user && user.id) {
//       const notificationsRef = ref(database, `users/${user.id}/notifications`);
      
//       await push(notificationsRef, {
//         type: 'payment',
//         message: `Payment successful for ${booking.matchTitle} on ${new Date(booking.matchDate).toLocaleDateString()}. Seats: ${booking.seats.join(', ')}`,
//         createdAt: new Date().toISOString(),
//         isRead: false,
//         relatedTo: 'payment',
//         bookingId: booking.id
//       });
//     }
//   };

//   // Create a ticket transfer notification
//   const createTransferNotification = async (booking) => {
//     if (user && user.id) {
//       const notificationsRef = ref(database, `users/${user.id}/notifications`);
      
//       await push(notificationsRef, {
//         type: 'transfer',
//         message: `Ticket successfully transferred for ${booking.matchTitle} on ${new Date(booking.matchDate).toLocaleDateString()}. Seats: ${booking.seats.join(', ')}`,
//         createdAt: new Date().toISOString(),
//         isRead: false,
//         relatedTo: 'transfer',
//         bookingId: booking.id
//       });
//     }
//   };

//   // Handle Pay Now button click
//   const handlePayNow = async (booking) => {
//     // Set processing state
//     setProcessingPayment(booking.id);
    
//     try {
//       // Generate payment ID and timestamp
//       const paymentId = 'direct-' + Date.now();
//       const paymentTimestamp = new Date().toISOString();
      
//       // 1. Update booking payment status in user's record
//       const userBookingRef = ref(database, `users/${user.id}/stadium_bookings/${booking.id}`);
//       await update(userBookingRef, {
//         paymentStatus: 'completed',
//         paymentId: paymentId,
//         paymentTimestamp: paymentTimestamp
//       });
      
//       // 2. Update main transaction record in stadium_transactions
//       // First, determine the transaction ID - it could be stored in different fields
//       const transactionId = booking.transactionId || booking.bookingId || booking.id;
      
//       if (transactionId) {
//         // Update in stadium_transactions (the main transactions collection)
//         const transactionRef = ref(database, `stadium_transactions/${transactionId}`);
//         await update(transactionRef, {
//           paymentStatus: 'completed',
//           paymentId: paymentId,
//           paymentTimestamp: paymentTimestamp
//         });
        
//         console.log(`Updated payment status for transaction ${transactionId} to completed`);
//       } else {
//         console.error("Could not find transaction ID for booking:", booking);
//       }
      
//       // 3. Create a payment successful notification
//       await createPaymentNotification(booking);
      
//       // 4. Update local state to show success
//       setPaymentSuccess(prev => ({
//         ...prev,
//         [booking.id]: true
//       }));
      
//       // 5. Update the booking in local state
//       setUserBookings(prevBookings => 
//         prevBookings.map(b => 
//           b.id === booking.id 
//             ? { ...b, paymentStatus: 'completed' } 
//             : b
//         )
//       );
      
//     } catch (error) {
//       console.error("Error updating payment status:", error);
//       alert("There was an error processing your payment. Please try again.");
//     } finally {
//       // Clear processing state
//       setProcessingPayment(null);
//     }
//   };

//   // Handle Transfer Ticket button click
//   const handleTransferTicket = async (booking) => {
//     // Confirm transfer
//     if (!window.confirm(`Are you sure you want to transfer your ticket for ${booking.matchTitle} on ${new Date(booking.matchDate).toLocaleDateString()}?`)) {
//       return;
//     }
    
//     // Set transferring state
//     setTransferringTicket(booking.id);
    
//     try {
//       // 1. Update booking transfer status in user's record
//       const userBookingRef = ref(database, `users/${user.id}/stadium_bookings/${booking.id}`);
//       await update(userBookingRef, {
//         transferStatus: 'transferred',
//         transferTimestamp: new Date().toISOString()
//       });
      
//       // 2. Update main transaction record
//       const transactionId = booking.transactionId || booking.bookingId || booking.id;
      
//       if (transactionId) {
//         const transactionRef = ref(database, `stadium_transactions/${transactionId}`);
//         await update(transactionRef, {
//           transferStatus: 'transferred',
//           transferTimestamp: new Date().toISOString()
//         });
        
//         console.log(`Updated transfer status for transaction ${transactionId} to transferred`);
//       } else {
//         console.error("Could not find transaction ID for booking:", booking);
//       }
      
//       // 3. Create a ticket transfer notification
//       await createTransferNotification(booking);
      
//       // 4. Update local state to show success
//       setTransferSuccess(prev => ({
//         ...prev,
//         [booking.id]: true
//       }));
      
//       // 5. Update the booking in local state
//       setUserBookings(prevBookings => 
//         prevBookings.map(b => 
//           b.id === booking.id 
//             ? { ...b, transferStatus: 'transferred' } 
//             : b
//         )
//       );
      
//     } catch (error) {
//       console.error("Error transferring ticket:", error);
//       alert("There was an error transferring your ticket. Please try again.");
//     } finally {
//       // Clear transferring state
//       setTransferringTicket(null);
//     }
//   };

//   // Check if a match date is in the future
//   const isMatchInFuture = (matchDate) => {
//     const today = new Date();
//     const match = new Date(matchDate);
//     return match > today;
//   };

//   // Debug user object
//   console.log("User object:", user);
  
//   // User name with fallback
//   const userName = user?.name || user?.displayName || "User";

//   return (
//     <div className="dashboard-container">
//       <div className="welcome-header">
//         <h2>Welcome, {userName}</h2>
//         <p>Manage your secure access and bookings</p>
//       </div>
      
//       <div className="dashboard-cards">
//         <div className="dashboard-card user-profile">
//           <h3>Your Profile</h3>
//           <div className="profile-content">
//             <div className="profile-image">
//               {user?.faceImageUrl ? (
//                 <img src={user.faceImageUrl} alt="Profile" />
//               ) : (
//                 <div className="no-image">
//                   <User size={48} />
//                 </div>
//               )}
//             </div>
//             <div className="profile-details">
//               <p><strong>Name:</strong> {userName}</p>
//               <p><strong>Email:</strong> {user?.email || "No email provided"}</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="dashboard-card booked-slots">
//           <h3>Your Booked Seats</h3>
//           <div className="slots-list">
//             {loading ? (
//               <div className="loading-bookings">Loading your bookings...</div>
//             ) : userBookings && userBookings.length > 0 ? (
//               userBookings.map(booking => (
//                 <div key={booking.id} className="booked-slot-item">
//                   <div className="booking-details">
//                     <div className="booking-title">{booking.matchTitle}</div>
//                     <div className="booking-date">{new Date(booking.matchDate).toLocaleDateString()}</div>
//                     <div className="booking-seats">Seats: {booking.seats.join(', ')}</div>
//                     <div className="booking-confirmation">Confirmation: {booking.confirmationNumber}</div>
                    
//                     {paymentSuccess[booking.id] ? (
//                       <div className="payment-success-message">
//                         Your payment was successful using Razorpay!
//                       </div>
//                     ) : null}

//                     {transferSuccess[booking.id] ? (
//                       <div className="transfer-success-message">
//                         Your ticket has been successfully transferred!
//                       </div>
//                     ) : null}
                    
//                     <div className="booking-status">
//                       {/* Payment Status */}
//                       {booking.paymentStatus === 'completed' || paymentSuccess[booking.id] ? (
//                         <div className="payment-completed">
//                           <CheckCircle size={16} />
//                           <span>Payment Completed</span>
//                         </div>
//                       ) : (
//                         <div className="payment-pending">
//                           <span>Payment Pending</span>
//                           <button 
//                             className="btn-pay-now"
//                             onClick={() => handlePayNow(booking)}
//                             disabled={processingPayment === booking.id}
//                           >
//                             <CreditCard size={16} />
//                             {processingPayment === booking.id ? 'Processing...' : 'Pay Now'}
//                           </button>
//                         </div>
//                       )}
                      
//                       {/* Transfer Status - FIXED LOGIC HERE */}
//                       {(booking.paymentStatus === 'completed' || paymentSuccess[booking.id]) && 
//                        (booking.transferStatus === 'not_transferred') && 
//                        isMatchInFuture(booking.matchDate) ? (
//                         <div className="transfer-ticket">
//                           <button 
//                             className="btn-transfer"
//                             onClick={() => handleTransferTicket(booking)}
//                             disabled={transferringTicket === booking.id}
//                           >
//                             <Send size={16} />
//                             {transferringTicket === booking.id ? 'Transferring...' : 'Transfer Ticket'}
//                           </button>
//                         </div>
//                       ) : booking.transferStatus === 'transferred' || transferSuccess[booking.id] ? (
//                         <div className="transfer-completed">
//                           <CheckCircle size={16} />
//                           <span>Ticket Transferred</span>
//                         </div>
//                       ) : null}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="no-slots-message">
//                 <p>You haven't booked any seats yet.</p>
//               </div>
//             )}
//           </div>
//           <button
//             onClick={onBookSlotClick}
//             className="btn-primary btn-book"
//           >
//             Book a New Seat
//           </button>
//         </div>
        
//         <div className="dashboard-card notifications-preview">
//           <h3>Notifications</h3>
//           {unreadNotifications > 0 ? (
//             <div className="notification-badge">
//               <span>{unreadNotifications} unread</span>
//             </div>
//           ) : (
//             <p>No new notifications</p>
//           )}
//           <button
//             onClick={onNotificationsClick}
//             className="btn-secondary btn-view-all"
//           >
//             View All Notifications
//           </button>
//         </div>
//       </div>
      
//       <button onClick={onLogout} className="btn-logout">Logout</button>
//     </div>
//   );
// };

// export default Dashboard;



import React, { useState, useEffect } from 'react';
import { ref, onValue, update, push } from 'firebase/database';
import { database } from '../firebase';
import { Camera, CreditCard, CheckCircle, User, Send } from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = ({ user, onLogout, onBookSlotClick, onNotificationsClick, onPaymentClick, unreadNotifications }) => {
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [transferringTicket, setTransferringTicket] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState({});
  const [transferSuccess, setTransferSuccess] = useState({});

  // Fetch user's bookings from Firebase
  useEffect(() => {
    if (user && user.id) {
      setLoading(true);
      const userBookingsRef = ref(database, `users/${user.id}/stadium_bookings`);
      
      const unsubscribe = onValue(userBookingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const bookingsData = snapshot.val();
          const bookingsArray = Object.keys(bookingsData).map(key => ({
            id: key,
            ...bookingsData[key],
            paymentStatus: bookingsData[key].paymentStatus || 'pending', // Default to pending if not set
            transferStatus: bookingsData[key].transferStatus || 'not_transferred' // Default to not transferred
          }));
          
          // Sort bookings by date (most recent first)
          bookingsArray.sort((a, b) => {
            const dateA = new Date(a.matchDate);
            const dateB = new Date(b.matchDate);
            return dateB - dateA;
          });
          
          setUserBookings(bookingsArray);
        } else {
          setUserBookings([]);
        }
        setLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  // Create a payment successful notification
  const createPaymentNotification = async (booking) => {
    if (user && user.id) {
      const notificationsRef = ref(database, `users/${user.id}/notifications`);
      
      await push(notificationsRef, {
        type: 'payment',
        message: `Payment successful for ${booking.matchTitle} on ${new Date(booking.matchDate).toLocaleDateString()}. Seats: ${booking.seats.join(', ')}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        relatedTo: 'payment',
        bookingId: booking.id
      });
    }
  };

  // Create a ticket transfer notification
  const createTransferNotification = async (booking) => {
    if (user && user.id) {
      const notificationsRef = ref(database, `users/${user.id}/notifications`);
      
      await push(notificationsRef, {
        type: 'transfer',
        message: `Ticket successfully transferred for ${booking.matchTitle} on ${new Date(booking.matchDate).toLocaleDateString()}. Seats: ${booking.seats.join(', ')}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        relatedTo: 'transfer',
        bookingId: booking.id
      });
    }
  };

  // Handle Pay Now button click
  const handlePayNow = async (booking) => {
    // Set processing state
    setProcessingPayment(booking.id);
    
    try {
      // Generate payment ID and timestamp
      const paymentId = 'direct-' + Date.now();
      const paymentTimestamp = new Date().toISOString();
      
      // 1. Update booking payment status in user's record
      const userBookingRef = ref(database, `users/${user.id}/stadium_bookings/${booking.id}`);
      await update(userBookingRef, {
        paymentStatus: 'completed',
        paymentId: paymentId,
        paymentTimestamp: paymentTimestamp
      });
      
      // 2. Update main transaction record in stadium_transactions
      // First, determine the transaction ID - it could be stored in different fields
      const transactionId = booking.transactionId || booking.bookingId || booking.id;
      
      if (transactionId) {
        // Update in stadium_transactions (the main transactions collection)
        const transactionRef = ref(database, `stadium_transactions/${transactionId}`);
        await update(transactionRef, {
          paymentStatus: 'completed',
          paymentId: paymentId,
          paymentTimestamp: paymentTimestamp
        });
        
        console.log(`Updated payment status for transaction ${transactionId} to completed`);
      } else {
        console.error("Could not find transaction ID for booking:", booking);
      }
      
      // 3. Create a payment successful notification
      await createPaymentNotification(booking);
      
      // 4. Update local state to show success
      setPaymentSuccess(prev => ({
        ...prev,
        [booking.id]: true
      }));
      
      // 5. Update the booking in local state
      setUserBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === booking.id 
            ? { ...b, paymentStatus: 'completed' } 
            : b
        )
      );
      
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("There was an error processing your payment. Please try again.");
    } finally {
      // Clear processing state
      setProcessingPayment(null);
    }
  };

  // Handle Transfer Ticket button click
  const handleTransferTicket = async (booking) => {
    // Confirm transfer
    if (!window.confirm(`Are you sure you want to transfer your ticket for ${booking.matchTitle} on ${new Date(booking.matchDate).toLocaleDateString()}?`)) {
      return;
    }
    
    // Set transferring state
    setTransferringTicket(booking.id);
    
    try {
      // 1. Update booking transfer status in user's record
      const userBookingRef = ref(database, `users/${user.id}/stadium_bookings/${booking.id}`);
      await update(userBookingRef, {
        transferStatus: 'transferred',
        transferTimestamp: new Date().toISOString()
      });
      
      // 2. Update main transaction record
      const transactionId = booking.transactionId || booking.bookingId || booking.id;
      
      if (transactionId) {
        const transactionRef = ref(database, `stadium_transactions/${transactionId}`);
        await update(transactionRef, {
          transferStatus: 'transferred',
          transferTimestamp: new Date().toISOString()
        });
        
        console.log(`Updated transfer status for transaction ${transactionId} to transferred`);
      } else {
        console.error("Could not find transaction ID for booking:", booking);
      }
      
      // 3. Create a ticket transfer notification
      await createTransferNotification(booking);
      
      // 4. Update local state to show success
      setTransferSuccess(prev => ({
        ...prev,
        [booking.id]: true
      }));
      
      // 5. Update the booking in local state
      setUserBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === booking.id 
            ? { ...b, transferStatus: 'transferred' } 
            : b
        )
      );
      
    } catch (error) {
      console.error("Error transferring ticket:", error);
      alert("There was an error transferring your ticket. Please try again.");
    } finally {
      // Clear transferring state
      setTransferringTicket(null);
    }
  };

  // Check if a match date is in the future
  const isMatchInFuture = (matchDate) => {
    const today = new Date();
    const match = new Date(matchDate);
    return match > today;
  };

  // Debug user object
  console.log("User object:", user);
  
  // User name with fallback
  const userName = user?.name || user?.displayName || "User";

  return (
    <div className="dashboard-container">
      <div className="welcome-header">
        <h2>Welcome, {userName}</h2>
        <p>Manage your secure access and bookings</p>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card user-profile">
          <h3>Your Profile</h3>
          <div className="profile-content">
            <div className="profile-image">
              {user?.faceImageUrl ? (
                <img src={user.faceImageUrl} alt="Profile" />
              ) : (
                <div className="no-image">
                  <User size={48} />
                </div>
              )}
            </div>
            <div className="profile-details">
              <p><strong>Name:</strong> {userName}</p>
              <p><strong>Email:</strong> {user?.email || "No email provided"}</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card booked-slots">
          <h3>Your Booked Seats</h3>
          <div className="slots-list">
            {loading ? (
              <div className="loading-bookings">Loading your bookings...</div>
            ) : userBookings && userBookings.length > 0 ? (
              userBookings.map(booking => (
                <div key={booking.id} className="booked-slot-item">
                  <div className="booking-details">
                    <div className="booking-title">{booking.matchTitle}</div>
                    <div className="booking-date">{new Date(booking.matchDate).toLocaleDateString()}</div>
                    <div className="booking-seats">Seats: {booking.seats.join(', ')}</div>
                    <div className="booking-confirmation">Confirmation: {booking.confirmationNumber}</div>
                    
                    {paymentSuccess[booking.id] && (
                      <div className="payment-success-message">
                        Your payment was successful using Razorpay!
                      </div>
                    )}

                    {transferSuccess[booking.id] && (
                      <div className="transfer-success-message">
                        Your ticket has been successfully transferred!
                      </div>
                    )}
                    
                    <div className="booking-status">
                      {/* Payment Status */}
                      {booking.paymentStatus === 'completed' || paymentSuccess[booking.id] ? (
                        <div className="payment-completed">
                          <CheckCircle size={16} />
                          <span>Payment Completed</span>
                        </div>
                      ) : (
                        <div className="payment-pending">
                          <span>Payment Pending</span>
                          <button 
                            className="btn-pay-now"
                            onClick={() => handlePayNow(booking)}
                            disabled={processingPayment === booking.id}
                          >
                            <CreditCard size={16} />
                            {processingPayment === booking.id ? 'Processing...' : 'Pay Now'}
                          </button>
                        </div>
                      )}
                      
                      {/* Transfer Status - Always show Transfer button after payment completion */}
                      {booking.paymentStatus === 'completed' || paymentSuccess[booking.id] ? (
                        booking.transferStatus === 'transferred' || transferSuccess[booking.id] ? (
                          <div className="transfer-completed">
                            <CheckCircle size={16} />
                            <span>Ticket Transferred</span>
                          </div>
                        ) : (
                          <div className="transfer-ticket">
                            <button 
                              className="btn-transfer"
                              onClick={() => handleTransferTicket(booking)}
                              disabled={transferringTicket === booking.id}
                            >
                              <Send size={16} />
                              {transferringTicket === booking.id ? 'Transferring...' : 'Transfer Ticket'}
                            </button>
                          </div>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-slots-message">
                <p>You haven't booked any seats yet.</p>
              </div>
            )}
          </div>
          <button
            onClick={onBookSlotClick}
            className="btn-primary btn-book"
          >
            Book a New Seat
          </button>
        </div>
        
        <div className="dashboard-card notifications-preview">
          <h3>Notifications</h3>
          {unreadNotifications > 0 ? (
            <div className="notification-badge">
              <span>{unreadNotifications} unread</span>
            </div>
          ) : (
            <p>No new notifications</p>
          )}
          <button
            onClick={onNotificationsClick}
            className="btn-secondary btn-view-all"
          >
            View All Notifications
          </button>
        </div>
      </div>
      
      <button onClick={onLogout} className="btn-logout">Logout</button>
    </div>
  );
};

export default Dashboard;