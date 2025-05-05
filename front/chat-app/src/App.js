import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatRoom from './components/ChatRoom';
import Login from './components/Login';
import Rooms from './components/Rooms';

function App({socket}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('rooms'); // 'rooms' or 'chat'
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomsInfo, setRoomsInfo] = useState([]); // Store room info (id and name)
  const [currentRoomName, setCurrentRoomName] = useState('');
  
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);
  
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
    setCurrentRoomName('');
  };
  
  const handleSendMessage = (text) => {
    if (text.trim() && currentUser && currentRoomId) {
      socket.send(`6\n${currentUser.name}\n${text}\n${currentRoomId}`);
    }
  };
  
  const handleEnterRoom = (roomId, roomName) => {
    setCurrentRoomId(roomId);
    setCurrentRoomName(roomName);
    setCurrentView('chat');
  };
  
  const handleBackToRooms = () => {
    setCurrentView('rooms');
  };
  
  const handleRoomsUpdate = (rooms) => {
    setRoomsInfo(rooms);
  };
  
  // If not logged in, show login screen
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} socket={socket}/>;
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
        currentRoomName={currentRoomName}
      />
      <div className="flex-1">
        {currentView === 'rooms' ? (
          <Rooms 
            currentUser={currentUser.name} 
            onEnterRoom={handleEnterRoom}
            socket={socket}
            onRoomsUpdate={handleRoomsUpdate}
          />
        ) : (
          <ChatRoom 
            roomId={currentRoomId}
            currentUser={currentUser.name} 
            onSendMessage={handleSendMessage}
            socket={socket} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
