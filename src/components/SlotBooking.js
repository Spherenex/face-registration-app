


// // src/components/SlotBooking.js
// import React, { useState, useEffect } from 'react';
// import { ref, onValue, update, push, set, get } from 'firebase/database';
// import { database } from '../firebase';
// import '../styles/SlotBooking.css';

// const SlotBooking = ({ onBookSlot, onBack, user }) => {
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [message, setMessage] = useState('');
//   const [messageType, setMessageType] = useState('');
//   const [bookingStage, setBookingStage] = useState('selection'); // 'selection', 'confirmation', 'success'
//   const [selectedMatch, setSelectedMatch] = useState(null);
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Price per seat
//   const pricePerSeat = 75;

//   // Check if user is defined before accessing properties
//   const userName = user?.name || 'Guest';
//   const userEmail = user?.email || 'No email provided';
//   const userId = user?.id || 'guest-user';
  
//   // Fetch matches from Firebase
//   useEffect(() => {
//     setLoading(true);
//     const matchesRef = ref(database, 'matches');
    
//     // Set up a real-time listener for matches
//     const unsubscribe = onValue(matchesRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const matchesData = snapshot.val();
//         const matchesArray = Object.keys(matchesData).map(key => ({
//           id: key,
//           ...matchesData[key]
//         }));
//         setMatches(matchesArray);
//       } else {
//         // If no matches exist in the database, create sample matches
//         createSampleMatches();
//       }
//       setLoading(false);
//     });

//     // Clean up the listener
//     return () => unsubscribe();
//   }, []);

//   // Create sample matches if none exist in the database
//   const createSampleMatches = async () => {
//     try {
//       const matchesRef = ref(database, 'matches');
//       const today = new Date();
      
//       for (let i = 0; i < 14; i++) {
//         const date = new Date(today);
//         date.setDate(today.getDate() + i);
//         const dateString = date.toISOString().split('T')[0];
        
//         const newMatchRef = push(matchesRef);
//         await set(newMatchRef, {
//           date: dateString,
//           title: `Match on ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
//           venue: 'Main Stadium',
//           createdAt: new Date().toISOString()
//         });
        
//         // Create seats for this match
//         const seatsRef = ref(database, `matches/${newMatchRef.key}/seats`);
//         for (let j = 1; j <= 20; j++) {
//           const newSeatRef = push(seatsRef);
//           await set(newSeatRef, {
//             seatNumber: `S${j}`,
//             available: Math.random() > 0.3, // Random availability for demo
//             createdAt: new Date().toISOString()
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error creating sample matches:", error);
//       setMessage("Error creating sample matches. Please try again.");
//       setMessageType("error");
//     }
//   };

//   // Handle match selection
//   const handleMatchSelect = async (matchId, date) => {
//     setSelectedDate(date);
//     setSelectedSeats([]); // Reset selected seats
    
//     const match = matches.find(m => m.id === matchId);
//     if (match) {
//       // Ensure seats are loaded
//       if (!match.seats || Object.keys(match.seats).length === 0) {
//         try {
//           const seatsRef = ref(database, `matches/${matchId}/seats`);
//           const snapshot = await get(seatsRef);
          
//           if (snapshot.exists()) {
//             match.seats = snapshot.val();
//           } else {
//             // Create seats if they don't exist
//             const seatsRef = ref(database, `matches/${matchId}/seats`);
//             for (let j = 1; j <= 20; j++) {
//               const newSeatRef = push(seatsRef);
//               await set(newSeatRef, {
//                 seatNumber: `S${j}`,
//                 available: true,
//                 createdAt: new Date().toISOString()
//               });
//             }
            
//             // Fetch the newly created seats
//             const updatedSnapshot = await get(seatsRef);
//             match.seats = updatedSnapshot.val();
//           }
//         } catch (error) {
//           console.error("Error loading seats:", error);
//           setMessage("Error loading seats. Please try again.");
//           setMessageType("error");
//           return;
//         }
//       }
      
//       setSelectedMatch(match);
//     }
//   };

//   // Handle seat toggle
//   const handleSeatToggle = (seatId, seatNumber) => {
//     if (selectedSeats.some(s => s.id === seatId)) {
//       setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
//     } else {
//       setSelectedSeats([...selectedSeats, { id: seatId, seatNumber }]);
//     }
//   };

//   // Proceed to confirmation
//   const handleProceedToConfirmation = () => {
//     if (selectedSeats.length === 0) {
//       setMessage('Please select at least one seat');
//       setMessageType('error');
//       setTimeout(() => {
//         setMessage('');
//         setMessageType('');
//       }, 3000);
//       return;
//     }

//     // Check if user data is available
//     if (!user || !user.id) {
//       setMessage('User information is missing. Please log in again.');
//       setMessageType('error');
//       setTimeout(() => {
//         setMessage('');
//         setMessageType('');
//       }, 3000);
//       return;
//     }
    
//     setBookingStage('confirmation');
//   };

//   // Confirm booking
//   const handleConfirmBooking = async () => {
//     try {
//       // Check if user is defined
//       if (!user || !user.id) {
//         setMessage('User information is missing. Please log in again.');
//         setMessageType('error');
//         return;
//       }

//       // Update seat availability in Firebase
//       const updates = {};
//       selectedSeats.forEach(seat => {
//         updates[`matches/${selectedMatch.id}/seats/${seat.id}/available`] = false;
//       });
      
//       // Create a booking record
//       const bookingRef = ref(database, 'bookings');
//       const newBookingRef = push(bookingRef);
//       const confirmationNumber = generateConfirmationNumber();
      
//       // Add the booking data
//       await set(newBookingRef, {
//         userId: userId,
//         matchId: selectedMatch.id,
//         matchTitle: selectedMatch.title,
//         matchDate: selectedMatch.date,
//         seats: selectedSeats.map(s => s.seatNumber),
//         totalAmount: selectedSeats.length * pricePerSeat,
//         confirmationNumber,
//         timestamp: new Date().toISOString()
//       });
      
//       // Update all seat availability
//       await update(ref(database), updates);
      
//       // Add this booking to the user's record
//       const userBookingsRef = ref(database, `users/${userId}/bookings/${newBookingRef.key}`);
//       await set(userBookingsRef, {
//         bookingId: newBookingRef.key,
//         matchId: selectedMatch.id,
//         matchTitle: selectedMatch.title,
//         matchDate: selectedMatch.date,
//         seats: selectedSeats.map(s => s.seatNumber),
//         confirmationNumber,
//         timestamp: new Date().toISOString()
//       });
      
//       // Show success message
//       setBookingStage('success');
//       setMessage('Booking confirmed for this match!');
//       setMessageType('success');
      
//       // Let the parent component know about the booking
//       if (onBookSlot) {
//         onBookSlot(selectedDate, selectedSeats.map(s => s.seatNumber), selectedMatch);
//       }
//     } catch (error) {
//       console.error("Error confirming booking:", error);
//       setMessage('Failed to confirm booking. Please try again.');
//       setMessageType('error');
//     }
//   };

//   // Handle back to dashboard
//   const handleBackToDashboard = () => {
//     onBack();
//   };

//   // Generate confirmation number
//   const generateConfirmationNumber = () => {
//     return 'BK' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
//   };

//   // Render seat selection
//   const renderSeatSelection = () => {
//     if (!selectedMatch || !selectedMatch.seats) return <div className="loading">Loading seats...</div>;
    
//     const seats = Object.entries(selectedMatch.seats).map(([id, seat]) => ({
//       id,
//       ...seat
//     }));
    
//     // Sort seats by seat number
//     seats.sort((a, b) => {
//       const aNum = parseInt(a.seatNumber.replace('S', ''));
//       const bNum = parseInt(b.seatNumber.replace('S', ''));
//       return aNum - bNum;
//     });
    
//     return (
//       <div className="seat-selection">
//         <h3 className="seat-selection-title">
//           Select Seats for {selectedMatch.title}
//         </h3>
//         <p className="seat-price">Price per seat: ${pricePerSeat}</p>

//         <div className="seats-grid">
//           {seats.map(seat => (
//             <div
//               key={seat.id}
//               className={`seat ${!seat.available ? 'unavailable' : ''} ${
//                 selectedSeats.some(s => s.id === seat.id) ? 'selected' : ''
//               }`}
//               onClick={() => seat.available && handleSeatToggle(seat.id, seat.seatNumber)}
//             >
//               <div className="seat-number">{seat.seatNumber}</div>
//               {!seat.available && <div className="seat-status">Booked</div>}
//             </div>
//           ))}
//         </div>

//         {selectedSeats.length > 0 && (
//           <div className="seat-selection-actions">
//             <p className="selected-seats">Selected Seats: {selectedSeats.map(s => s.seatNumber).sort().join(', ')}</p>
//             <button
//               className="btn btn-primary"
//               onClick={handleProceedToConfirmation}
//             >
//               Confirm {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Render booking confirmation
//   const renderBookingConfirmation = () => {
//     const totalAmount = selectedSeats.length * pricePerSeat;
    
//     return (
//       <div className="booking-confirmation">
//         <h3 className="confirmation-title">Booking Details</h3>
        
//         <div className="confirmation-details">
//           <div className="detail-card">
//             <h4 className="detail-title">Match Information</h4>
//             <p className="detail-item"><strong>Event:</strong> {selectedMatch.title}</p>
//             <p className="detail-item"><strong>Date:</strong> {new Date(selectedMatch.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
//             <p className="detail-item"><strong>Venue:</strong> {selectedMatch.venue || 'Main Stadium'}</p>
//           </div>
          
//           <div className="detail-card">
//             <h4 className="detail-title">Customer Information</h4>
//             <p className="detail-item"><strong>Name:</strong> {userName}</p>
//             <p className="detail-item"><strong>Email:</strong> {userEmail}</p>
//           </div>
          
//           <div className="detail-card">
//             <h4 className="detail-title">Ticket Information</h4>
//             <p className="detail-item"><strong>Seats:</strong> {selectedSeats.map(s => s.seatNumber).sort().join(', ')}</p>
//             <p className="detail-item"><strong>Price per seat:</strong> ₹{pricePerSeat}</p>
//             <p className="detail-item"><strong>Number of seats:</strong> {selectedSeats.length}</p>
//             <div className="total-amount">
//               Total Amount: ₹{totalAmount}
//             </div>
//           </div>
//         </div>
        
//         <div className="confirmation-actions">
//           <button 
//             className="btn btn-secondary"
//             onClick={() => setBookingStage('selection')}
//           >
//             Back to Seat Selection
//           </button>
//           <button 
//             className="btn btn-success"
//             onClick={handleConfirmBooking}
//           >
//             Confirm Booking
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // Render booking success
//   const renderBookingSuccess = () => {
//     const confirmationNumber = selectedSeats[0]?.confirmationNumber || generateConfirmationNumber();
    
//     return (
//       <div className="booking-success">
//         <div className="success-icon">✓</div>
//         <h3 className="success-heading">Booking Confirmed!</h3>
//         <p className="success-message">Your seats have been reserved for {selectedMatch.title}</p>
//         <p className="confirmation-number">Confirmation #: {confirmationNumber}</p>
//         <p className="success-email">A confirmation email has been sent to {userEmail}</p>
//         <button 
//           className="btn btn-primary"
//           onClick={handleBackToDashboard}
//         >
//           Return to Dashboard
//         </button>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="slot-booking-container">
//         <div className="slot-booking-header">
//           <button onClick={handleBackToDashboard} className="btn-back">
//             ← Back to Dashboard
//           </button>
//           <h2 className="slot-booking-title">Stadium Seat Booking</h2>
//         </div>
//         <div className="loading">Loading matches...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="slot-booking-container">
//       <div className="slot-booking-header">
//         <button onClick={handleBackToDashboard} className="btn-back">
//           ← Back to Dashboard
//         </button>
//         <h2 className="slot-booking-title">Stadium Seat Booking</h2>
//       </div>
      
//       {message && (
//         <div className={`message ${messageType}`}>
//           {message}
//         </div>
//       )}
      
//       {bookingStage === 'selection' && (
//         <div className="match-selection">
//           <h3 className="match-selection-title">Select a Match</h3>
//           <div className="matches-grid">
//             {matches.map(match => {
//               const matchDate = new Date(match.date);
//               const dayName = matchDate.toLocaleDateString('en-US', { weekday: 'long' });
//               const dayNumber = matchDate.getDate();
//               const monthName = matchDate.toLocaleDateString('en-US', { month: 'short' });
              
//               return (
//                 <div
//                   key={match.id}
//                   className={`match-card ₹{selectedMatch?.id === match.id ? 'selected' : ''}`}
//                   onClick={() => handleMatchSelect(match.id, match.date)}
//                 >
//                   <div className="match-date">{dayName}, {dayNumber} {monthName}</div>
//                   <div className="match-title">{match.title}</div>
//                 </div>
//               );
//             })}
//           </div>
//           {selectedMatch && renderSeatSelection()}
//         </div>
//       )}
      
//       {bookingStage === 'confirmation' && renderBookingConfirmation()}
//       {bookingStage === 'success' && renderBookingSuccess()}
//     </div>
//   );
// };

// export default SlotBooking;



import React, { useState, useEffect } from 'react';
import { ref, onValue, update, push, set, get } from 'firebase/database';
import { database } from '../firebase';
import '../styles/SlotBooking.css';

const SlotBooking = ({ onBookSlot, onBack, user }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [bookingStage, setBookingStage] = useState('selection'); // 'selection', 'confirmation', 'success'
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Price per seat
  const pricePerSeat = 75;

  // Check if user is defined before accessing properties
  const userName = user?.name || 'Guest';
  const userEmail = user?.email || 'No email provided';
  const userId = user?.id || 'guest-user';
  
  // Fetch matches from Firebase
  useEffect(() => {
    setLoading(true);
    // CHANGED: Updated path to stadium_matches
    const matchesRef = ref(database, 'stadium_matches');
    
    // Set up a real-time listener for matches
    const unsubscribe = onValue(matchesRef, (snapshot) => {
      if (snapshot.exists()) {
        const matchesData = snapshot.val();
        const matchesArray = Object.keys(matchesData).map(key => ({
          id: key,
          ...matchesData[key]
        }));
        setMatches(matchesArray);
      } else {
        // If no matches exist in the database, create sample matches
        createSampleMatches();
      }
      setLoading(false);
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  // Create sample matches if none exist in the database
  const createSampleMatches = async () => {
    try {
      // CHANGED: Updated path to stadium_matches
      const matchesRef = ref(database, 'stadium_matches');
      const today = new Date();
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        const newMatchRef = push(matchesRef);
        await set(newMatchRef, {
          date: dateString,
          title: `Match on ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
          venue: 'Main Stadium',
          createdAt: new Date().toISOString()
        });
        
        // Create seats for this match
        // CHANGED: Updated path to stadium_matches
        const seatsRef = ref(database, `stadium_matches/${newMatchRef.key}/seats`);
        for (let j = 1; j <= 20; j++) {
          const newSeatRef = push(seatsRef);
          await set(newSeatRef, {
            seatNumber: `S${j}`,
            available: Math.random() > 0.3, // Random availability for demo
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Error creating sample matches:", error);
      setMessage("Error creating sample matches. Please try again.");
      setMessageType("error");
    }
  };

  // Handle match selection
  const handleMatchSelect = async (matchId, date) => {
    setSelectedDate(date);
    setSelectedSeats([]); // Reset selected seats
    
    const match = matches.find(m => m.id === matchId);
    if (match) {
      // Ensure seats are loaded
      if (!match.seats || Object.keys(match.seats).length === 0) {
        try {
          // CHANGED: Updated path to stadium_matches
          const seatsRef = ref(database, `stadium_matches/${matchId}/seats`);
          const snapshot = await get(seatsRef);
          
          if (snapshot.exists()) {
            match.seats = snapshot.val();
          } else {
            // Create seats if they don't exist
            // CHANGED: Updated path to stadium_matches
            const seatsRef = ref(database, `stadium_matches/${matchId}/seats`);
            for (let j = 1; j <= 20; j++) {
              const newSeatRef = push(seatsRef);
              await set(newSeatRef, {
                seatNumber: `S${j}`,
                available: true,
                createdAt: new Date().toISOString()
              });
            }
            
            // Fetch the newly created seats
            const updatedSnapshot = await get(seatsRef);
            match.seats = updatedSnapshot.val();
          }
        } catch (error) {
          console.error("Error loading seats:", error);
          setMessage("Error loading seats. Please try again.");
          setMessageType("error");
          return;
        }
      }
      
      setSelectedMatch(match);
    }
  };

  // Handle seat toggle
  const handleSeatToggle = (seatId, seatNumber) => {
    if (selectedSeats.some(s => s.id === seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, { id: seatId, seatNumber }]);
    }
  };

  // Proceed to confirmation
  const handleProceedToConfirmation = () => {
    if (selectedSeats.length === 0) {
      setMessage('Please select at least one seat');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    // Check if user data is available
    if (!user || !user.id) {
      setMessage('User information is missing. Please log in again.');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }
    
    setBookingStage('confirmation');
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    try {
      // Check if user is defined
      if (!user || !user.id) {
        setMessage('User information is missing. Please log in again.');
        setMessageType('error');
        return;
      }

      // Update seat availability in Firebase
      const updates = {};
      selectedSeats.forEach(seat => {
        // CHANGED: Updated path to stadium_matches
        updates[`stadium_matches/${selectedMatch.id}/seats/${seat.id}/available`] = false;
      });
      
      // Create a booking record
      // CHANGED: Updated path to stadium_transactions
      const bookingRef = ref(database, 'stadium_transactions');
      const newBookingRef = push(bookingRef);
      const confirmationNumber = generateConfirmationNumber();
      
      // Add the booking data
      await set(newBookingRef, {
        userId: userId,
        matchId: selectedMatch.id,
        matchTitle: selectedMatch.title,
        matchDate: selectedMatch.date,
        seats: selectedSeats.map(s => s.seatNumber),
        totalAmount: selectedSeats.length * pricePerSeat,
        confirmationNumber,
        timestamp: new Date().toISOString(),
        paymentStatus: 'pending'
      });
      
      // Update all seat availability
      await update(ref(database), updates);
      
      // Add this booking to the user's record
      // CHANGED: Updated path to stadium_bookings
      const userBookingsRef = ref(database, `users/${userId}/stadium_bookings/${newBookingRef.key}`);
      await set(userBookingsRef, {
        bookingId: newBookingRef.key,
        matchId: selectedMatch.id,
        matchTitle: selectedMatch.title,
        matchDate: selectedMatch.date,
        seats: selectedSeats.map(s => s.seatNumber),
        confirmationNumber,
        timestamp: new Date().toISOString(),
        paymentStatus: 'pending'
      });
      
      // Show success message
      setBookingStage('success');
      setMessage('Booking confirmed for this match!');
      setMessageType('success');
      
      // Let the parent component know about the booking
      if (onBookSlot) {
        onBookSlot(selectedDate, selectedSeats.map(s => s.seatNumber), selectedMatch);
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      setMessage('Failed to confirm booking. Please try again.');
      setMessageType('error');
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    onBack();
  };

  // Generate confirmation number
  const generateConfirmationNumber = () => {
    return 'BK' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  };

  // Render seat selection
  const renderSeatSelection = () => {
    if (!selectedMatch || !selectedMatch.seats) return <div className="loading">Loading seats...</div>;
    
    const seats = Object.entries(selectedMatch.seats).map(([id, seat]) => ({
      id,
      ...seat
    }));
    
    // Sort seats by seat number
    seats.sort((a, b) => {
      const aNum = parseInt(a.seatNumber.replace('S', ''));
      const bNum = parseInt(b.seatNumber.replace('S', ''));
      return aNum - bNum;
    });
    
    return (
      <div className="seat-selection">
        <h3 className="seat-selection-title">
          Select Seats for {selectedMatch.title}
        </h3>
        <p className="seat-price">Price per seat: ₹{pricePerSeat}</p>

        <div className="seats-grid">
          {seats.map(seat => (
            <div
              key={seat.id}
              className={`seat ${!seat.available ? 'unavailable' : ''} ${
                selectedSeats.some(s => s.id === seat.id) ? 'selected' : ''
              }`}
              onClick={() => seat.available && handleSeatToggle(seat.id, seat.seatNumber)}
            >
              <div className="seat-number">{seat.seatNumber}</div>
              {!seat.available && <div className="seat-status">Booked</div>}
            </div>
          ))}
        </div>

        {selectedSeats.length > 0 && (
          <div className="seat-selection-actions">
            <p className="selected-seats">Selected Seats: {selectedSeats.map(s => s.seatNumber).sort().join(', ')}</p>
            <button
              className="btn btn-primary"
              onClick={handleProceedToConfirmation}
            >
              Confirm {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render booking confirmation
  const renderBookingConfirmation = () => {
    const totalAmount = selectedSeats.length * pricePerSeat;
    
    return (
      <div className="booking-confirmation">
        <h3 className="confirmation-title">Booking Details</h3>
        
        <div className="confirmation-details">
          <div className="detail-card">
            <h4 className="detail-title">Match Information</h4>
            <p className="detail-item"><strong>Event:</strong> {selectedMatch.title}</p>
            <p className="detail-item"><strong>Date:</strong> {new Date(selectedMatch.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="detail-item"><strong>Venue:</strong> {selectedMatch.venue || 'Main Stadium'}</p>
          </div>
          
          <div className="detail-card">
            <h4 className="detail-title">Customer Information</h4>
            <p className="detail-item"><strong>Name:</strong> {userName}</p>
            <p className="detail-item"><strong>Email:</strong> {userEmail}</p>
          </div>
          
          <div className="detail-card">
            <h4 className="detail-title">Ticket Information</h4>
            <p className="detail-item"><strong>Seats:</strong> {selectedSeats.map(s => s.seatNumber).sort().join(', ')}</p>
            <p className="detail-item"><strong>Price per seat:</strong> ₹{pricePerSeat}</p>
            <p className="detail-item"><strong>Number of seats:</strong> {selectedSeats.length}</p>
            <div className="total-amount">
              Total Amount: ₹{totalAmount}
            </div>
          </div>
        </div>
        
        <div className="confirmation-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setBookingStage('selection')}
          >
            Back to Seat Selection
          </button>
          <button 
            className="btn btn-success"
            onClick={handleConfirmBooking}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    );
  };

  // Render booking success
  const renderBookingSuccess = () => {
    const confirmationNumber = selectedSeats[0]?.confirmationNumber || generateConfirmationNumber();
    
    return (
      <div className="booking-success">
        <div className="success-icon">✓</div>
        <h3 className="success-heading">Booking Confirmed!</h3>
        <p className="success-message">Your seats have been reserved for {selectedMatch.title}</p>
        <p className="confirmation-number">Confirmation #: {confirmationNumber}</p>
        <p className="success-email">A confirmation email has been sent to {userEmail}</p>
        <button 
          className="btn btn-primary"
          onClick={handleBackToDashboard}
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="slot-booking-container">
        <div className="slot-booking-header">
          <button onClick={handleBackToDashboard} className="btn-back">
            ← Back to Dashboard
          </button>
          <h2 className="slot-booking-title">Stadium Seat Booking</h2>
        </div>
        <div className="loading">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="slot-booking-container">
      <div className="slot-booking-header">
        <button onClick={handleBackToDashboard} className="btn-back">
          ← Back to Dashboard
        </button>
        <h2 className="slot-booking-title">Stadium Seat Booking</h2>
      </div>
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      
      {bookingStage === 'selection' && (
        <div className="match-selection">
          <h3 className="match-selection-title">Select a Match</h3>
          <div className="matches-grid">
            {matches.map(match => {
              const matchDate = new Date(match.date);
              const dayName = matchDate.toLocaleDateString('en-US', { weekday: 'long' });
              const dayNumber = matchDate.getDate();
              const monthName = matchDate.toLocaleDateString('en-US', { month: 'short' });
              
              return (
                <div
                  key={match.id}
                  className={`match-card ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                  onClick={() => handleMatchSelect(match.id, match.date)}
                >
                  <div className="match-date">{dayName}, {dayNumber} {monthName}</div>
                  <div className="match-title">{match.title}</div>
                </div>
              );
            })}
          </div>
          {selectedMatch && renderSeatSelection()}
        </div>
      )}
      
      {bookingStage === 'confirmation' && renderBookingConfirmation()}
      {bookingStage === 'success' && renderBookingSuccess()}
    </div>
  );
};

export default SlotBooking;