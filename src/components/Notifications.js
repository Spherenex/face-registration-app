import React from 'react';

const Notifications = ({ notifications, onMarkAsRead, onBack }) => {
  return (
    <div className="notifications-container">
      <button onClick={onBack} className="btn-back">
        &larr; Back to Dashboard
      </button>
      
      <h2>Your Notifications</h2>
      
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(notification => (
            <div 
              key={notification.id}
              className={`notification-item ${notification.type} ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="btn-mark-read"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-notifications">You have no notifications.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;