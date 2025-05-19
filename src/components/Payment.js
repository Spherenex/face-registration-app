



// import React, { useState, useEffect } from 'react';
// import { ref, update } from 'firebase/database';
// import { database } from '../firebase';
// import '../styles/Payment.css';

// const Payment = ({ booking, user, onBack, onPaymentComplete }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
//   // Calculate price per seat and total amount
//   const pricePerSeat = 75; // Same as in SlotBooking component
//   const totalAmount = booking.seats.length * pricePerSeat;
  
//   // Load Razorpay script
//   useEffect(() => {
//     const loadRazorpay = async () => {
//       // Only load if it's not already loaded
//       if (!window.Razorpay) {
//         try {
//           // Create a new script element
//           const script = document.createElement('script');
//           script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//           script.async = true;
          
//           // Create a promise to track when script loads
//           const scriptLoadPromise = new Promise((resolve, reject) => {
//             script.onload = resolve;
//             script.onerror = reject;
//           });
          
//           // Add the script to the document body
//           document.body.appendChild(script);
          
//           // Wait for script to load
//           await scriptLoadPromise;
//           setRazorpayLoaded(true);
//           console.log("Razorpay script loaded successfully");
//         } catch (error) {
//           console.error("Error loading Razorpay script:", error);
//           setError("Failed to load payment gateway. Please try again later.");
//         }
//       } else {
//         setRazorpayLoaded(true);
//         console.log("Razorpay already loaded");
//       }
//     };
    
//     loadRazorpay();
//   }, []);
  
//   const handlePayment = () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       if (!window.Razorpay) {
//         throw new Error("Payment gateway not loaded. Please refresh the page.");
//       }
      
//       if (!booking || !user) {
//         throw new Error("Booking or user information is missing.");
//       }
      
//       // Safely generate an order ID (in production, this should come from your backend)
//       const orderId = 'order_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 15);
      
//       // Configure Razorpay options
//       const options = {
//         key: "rzp_test_YourRazorpayTestKey", // Replace with your actual test key
//         amount: totalAmount * 100, // Amount in paise
//         currency: "INR",
//         name: "Stadium Booking",
//         description: `Payment for ${booking.matchTitle}`,
//         order_id: orderId,
//         handler: function (response) {
//           // This function is called when payment is successful
//           handlePaymentSuccess(response);
//         },
//         prefill: {
//           name: user?.name || "",
//           email: user?.email || "",
//           contact: user?.phone || ""
//         },
//         notes: {
//           bookingId: booking.id,
//           seats: booking.seats.join(', '),
//           matchTitle: booking.matchTitle
//         },
//         theme: {
//           color: "#3498db"
//         },
//         modal: {
//           ondismiss: function() {
//             setLoading(false);
//             console.log("Payment modal dismissed");
//           }
//         }
//       };
      
//       // Initialize Razorpay
//       const paymentObject = new window.Razorpay(options);
      
//       // Open Razorpay checkout
//       paymentObject.open();
      
//     } catch (error) {
//       console.error("Payment initialization error:", error);
//       setError(error.message || "Failed to initialize payment. Please try again.");
//       setLoading(false);
//     }
//   };
  
//   const handlePaymentSuccess = async (response) => {
//     try {
//       console.log("Payment successful", response);
      
//       // Update payment status in Firebase
//       if (booking && booking.id && user && user.id) {
//         // Update the booking in user's bookings
//         const userBookingRef = ref(database, `users/${user.id}/bookings/${booking.id}`);
//         await update(userBookingRef, {
//           paymentStatus: 'completed',
//           paymentId: response.razorpay_payment_id,
//           paymentTimestamp: new Date().toISOString()
//         });
        
//         // Update the main booking record if bookingId exists
//         if (booking.bookingId) {
//           const mainBookingRef = ref(database, `bookings/${booking.bookingId}`);
//           await update(mainBookingRef, {
//             paymentStatus: 'completed',
//             paymentId: response.razorpay_payment_id,
//             paymentTimestamp: new Date().toISOString()
//           });
//         }
        
//         // Show success message
//         setPaymentSuccess(true);
//         setLoading(false);
        
//         // Notify parent component
//         if (onPaymentComplete) {
//           onPaymentComplete(booking.id, response.razorpay_payment_id);
//         }
//       }
//     } catch (error) {
//       console.error("Error updating payment status:", error);
//       setError("Payment was successful but failed to update status. Please contact support.");
//       setLoading(false);
//     }
//   };
  
//   // Render payment success screen
//   if (paymentSuccess) {
//     return (
//       <div className="payment-container">
//         <div className="payment-success">
//           <div className="success-icon">✓</div>
//           <h2>Payment Successful!</h2>
//           <p>Thank you for your payment. Your booking is now confirmed.</p>
//           <p className="booking-details">Booking ID: {booking.confirmationNumber}</p>
//           <p className="booking-details">Event: {booking.matchTitle}</p>
//           <p className="booking-details">Date: {new Date(booking.matchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//           <p className="booking-details">Seats: {booking.seats.join(', ')}</p>
//           <p className="booking-amount">Amount Paid: ₹{totalAmount}</p>
          
//           <button 
//             className="btn-primary"
//             onClick={onBack}
//           >
//             Return to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="payment-container">
//       <button onClick={onBack} className="btn-back">
//         ← Back to Dashboard
//       </button>
      
//       <h2 className="payment-title">Complete Your Payment</h2>
      
//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}
      
//       <div className="booking-summary">
//         <h3>Booking Details</h3>
        
//         <div className="summary-details">
//           <div className="summary-card">
//             <h4>Match Information</h4>
//             <p><strong>Event:</strong> {booking.matchTitle}</p>
//             <p><strong>Date:</strong> {new Date(booking.matchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//             <p><strong>Venue:</strong> {booking.venue || 'Main Stadium'}</p>
//           </div>
          
//           <div className="summary-card">
//             <h4>Customer Information</h4>
//             <p><strong>Name:</strong> {user?.name}</p>
//             <p><strong>Email:</strong> {user?.email}</p>
//           </div>
          
//           <div className="summary-card">
//             <h4>Ticket Information</h4>
//             <p><strong>Booking ID:</strong> {booking.confirmationNumber}</p>
//             <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
//             <p><strong>Price per seat:</strong> ₹{pricePerSeat}</p>
//             <p><strong>Number of seats:</strong> {booking.seats.length}</p>
//             <div className="total-amount">
//               <strong>Total Amount: ₹{totalAmount}</strong>
//             </div>
//           </div>
//         </div>
        
//         <div className="payment-actions">
//           <button 
//             className="btn-pay"
//             onClick={handlePayment}
//             disabled={loading || !razorpayLoaded}
//           >
//             {!razorpayLoaded 
//               ? 'Loading Payment Gateway...' 
//               : loading 
//                 ? 'Processing...' 
//                 : 'Pay Now ₹' + totalAmount}
//           </button>
//         </div>
        
//         <div className="payment-security">
//           <p>🔒 Secure payment powered by Razorpay</p>
//           <p className="payment-note">For testing, use card number: 4111 1111 1111 1111, Expiry: Any future date, CVV: Any 3 digits</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Payment;



import React, { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import '../styles/Payment.css';

const Payment = ({ booking, user, onBack, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Calculate price per seat and total amount
  const pricePerSeat = 75; // Same as in SlotBooking component
  const totalAmount = booking.seats.length * pricePerSeat;
  
  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = async () => {
      // Only load if it's not already loaded
      if (!window.Razorpay) {
        try {
          // Create a new script element
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          
          // Create a promise to track when script loads
          const scriptLoadPromise = new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
          
          // Add the script to the document body
          document.body.appendChild(script);
          
          // Wait for script to load
          await scriptLoadPromise;
          setRazorpayLoaded(true);
          console.log("Razorpay script loaded successfully");
        } catch (error) {
          console.error("Error loading Razorpay script:", error);
          setError("Failed to load payment gateway. Please try again later.");
        }
      } else {
        setRazorpayLoaded(true);
        console.log("Razorpay already loaded");
      }
    };
    
    loadRazorpay();
  }, []);
  
  const handlePayment = () => {
    setLoading(true);
    setError('');
    
    try {
      if (!window.Razorpay) {
        throw new Error("Payment gateway not loaded. Please refresh the page.");
      }
      
      if (!booking || !user) {
        throw new Error("Booking or user information is missing.");
      }
      
      // Safely generate an order ID (in production, this should come from your backend)
      const orderId = 'order_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 15);
      
      // Configure Razorpay options
      const options = {
        key: "rzp_test_YourRazorpayTestKey", // Replace with your actual test key
        amount: totalAmount * 100, // Amount in paise
        currency: "INR",
        name: "Stadium Booking",
        description: `Payment for ${booking.matchTitle}`,
        order_id: orderId,
        handler: function (response) {
          // This function is called when payment is successful
          handlePaymentSuccess(response);
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        notes: {
          bookingId: booking.id,
          seats: booking.seats.join(', '),
          matchTitle: booking.matchTitle
        },
        theme: {
          color: "#3498db"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            console.log("Payment modal dismissed");
          }
        }
      };
      
      // Initialize Razorpay
      const paymentObject = new window.Razorpay(options);
      
      // Open Razorpay checkout
      paymentObject.open();
      
    } catch (error) {
      console.error("Payment initialization error:", error);
      setError(error.message || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };
  
  const handlePaymentSuccess = async (response) => {
    try {
      console.log("Payment successful", response);
      
      // Update payment status in Firebase
      if (booking && booking.id && user && user.id) {
        // Update the booking in user's bookings
        // CHANGED: Updated path to stadium_bookings
        const userBookingRef = ref(database, `users/${user.id}/stadium_bookings/${booking.id}`);
        await update(userBookingRef, {
          paymentStatus: 'completed',
          paymentId: response.razorpay_payment_id,
          paymentTimestamp: new Date().toISOString()
        });
        
        // Update the main booking record if bookingId exists
        if (booking.bookingId) {
          // CHANGED: Updated path to stadium_transactions
          const mainBookingRef = ref(database, `stadium_transactions/${booking.bookingId}`);
          await update(mainBookingRef, {
            paymentStatus: 'completed',
            paymentId: response.razorpay_payment_id,
            paymentTimestamp: new Date().toISOString()
          });
        }
        
        // Show success message
        setPaymentSuccess(true);
        setLoading(false);
        
        // Notify parent component
        if (onPaymentComplete) {
          onPaymentComplete(booking.id, response.razorpay_payment_id);
        }
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      setError("Payment was successful but failed to update status. Please contact support.");
      setLoading(false);
    }
  };
  
  // Render payment success screen
  if (paymentSuccess) {
    return (
      <div className="payment-container">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your payment. Your booking is now confirmed.</p>
          <p className="booking-details">Booking ID: {booking.confirmationNumber}</p>
          <p className="booking-details">Event: {booking.matchTitle}</p>
          <p className="booking-details">Date: {new Date(booking.matchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="booking-details">Seats: {booking.seats.join(', ')}</p>
          <p className="booking-amount">Amount Paid: ₹{totalAmount}</p>
          
          <button 
            className="btn-primary"
            onClick={onBack}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payment-container">
      <button onClick={onBack} className="btn-back">
        ← Back to Dashboard
      </button>
      
      <h2 className="payment-title">Complete Your Payment</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="booking-summary">
        <h3>Booking Details</h3>
        
        <div className="summary-details">
          <div className="summary-card">
            <h4>Match Information</h4>
            <p><strong>Event:</strong> {booking.matchTitle}</p>
            <p><strong>Date:</strong> {new Date(booking.matchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Venue:</strong> {booking.venue || 'Main Stadium'}</p>
          </div>
          
          <div className="summary-card">
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
          
          <div className="summary-card">
            <h4>Ticket Information</h4>
            <p><strong>Booking ID:</strong> {booking.confirmationNumber}</p>
            <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
            <p><strong>Price per seat:</strong> ₹{pricePerSeat}</p>
            <p><strong>Number of seats:</strong> {booking.seats.length}</p>
            <div className="total-amount">
              <strong>Total Amount: ₹{totalAmount}</strong>
            </div>
          </div>
        </div>
        
        <div className="payment-actions">
          <button 
            className="btn-pay"
            onClick={handlePayment}
            disabled={loading || !razorpayLoaded}
          >
            {!razorpayLoaded 
              ? 'Loading Payment Gateway...' 
              : loading 
                ? 'Processing...' 
                : 'Pay Now ₹' + totalAmount}
          </button>
        </div>
        
        <div className="payment-security">
          <p>🔒 Secure payment powered by Razorpay</p>
          <p className="payment-note">For testing, use card number: 4111 1111 1111 1111, Expiry: Any future date, CVV: Any 3 digits</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;