import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatRoom from './components/ChatRoom';
import Login from './components/Login';
import Rooms from './components/Rooms';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('rooms'); // 'rooms' or 'chat'
  const [currentRoomId, setCurrentRoomId] = useState(null);
  
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);
  
  // Mock data for chat messages by room
  const [roomMessages, setRoomMessages] = useState({
    room1: [
      {
        id: '1',
        text: 'Hello everyone! Welcome to our group chat.',
        sender: { id: '2', name: 'Jane Smith', avatar: '/api/placeholder/40/40?text=J' },
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        text: 'Hi Jane! Thanks for setting this up.',
        sender: { id: '3', name: 'Mike Johnson', avatar: '/api/placeholder/40/40?text=M' },
        timestamp: new Date(Date.now() - 3000000).toISOString()
      }
    ],
    room2: [
      {
        id: '3',
        text: 'Glad to be here! What are we discussing today?',
        sender: { id: '4', name: 'Alex Brown', avatar: '/api/placeholder/40/40?text=A' },
        timestamp: new Date(Date.now() - 2400000).toISOString()
      },
      {
        id: '4',
        text: 'I thought we could talk about the new project requirements.',
        sender: { id: '2', name: 'Jane Smith', avatar: '/api/placeholder/40/40?text=J' },
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    room3: []
  });
  
  const handleLogin = (user) => {
    // Save user to localStorage for persistence
    localStorage.setItem('chatUser', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('chatUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('rooms');
    setCurrentRoomId(null);
  };
  
  const handleSendMessage = (text) => {
    if (text.trim() && currentUser && currentRoomId) {
      const newMessage = {
        id: Date.now().toString(),
        text,
        sender: currentUser,
        timestamp: new Date().toISOString()
      };
      
      setRoomMessages(prevMessages => ({
        ...prevMessages,
        [currentRoomId]: [...(prevMessages[currentRoomId] || []), newMessage]
      }));
    }
  };
  
  const handleEnterRoom = (roomId) => {
    setCurrentRoomId(roomId);
    setCurrentView('chat');
  };
  
  const handleBackToRooms = () => {
    setCurrentView('rooms');
  };
  
  // If not logged in, show login screen
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  
  // If logged in, show appropriate view
  return (
    <div className="flex flex-col h-screen">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        showBackButton={currentView === 'chat'}
        onBackClick={handleBackToRooms}
        currentRoomId={currentRoomId}
      />
      <div className="flex-1">
        {currentView === 'rooms' ? (
          <Rooms 
            currentUser={currentUser} 
            onEnterRoom={handleEnterRoom} 
          />
        ) : (
          <ChatRoom 
            messages={roomMessages[currentRoomId] || []} 
            currentUser={currentUser} 
            onSendMessage={handleSendMessage} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
