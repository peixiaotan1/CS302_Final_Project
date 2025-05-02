import React, { useState } from 'react';
import UserAvatar from './UserAvatar';

const Navbar = ({ currentUser, onLogout, showBackButton, onBackClick, currentRoomId }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };
  
  // Room names based on room ID - in a real app, this would come from the backend
  const roomNames = {
    room1: 'General Discussion',
    room2: 'Tech Talk',
    room3: 'Random Chat'
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex flex-col">
      {/* Main navbar */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={onBackClick}
              className="mr-3 hover:bg-blue-700 p-1 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
          )}
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
          </svg>
          <h1 className="text-xl font-semibold">Group Chat</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <div className="bg-blue-700 hover:bg-blue-800 py-1 px-3 rounded-full text-sm cursor-pointer">
              Team Alpha
            </div>
          </div>
          <div className="relative">
            <div 
              className="flex items-center cursor-pointer group"
              onClick={toggleDropdown}
            >
              <UserAvatar user={currentUser} size="sm" />
              <span className="ml-2 hidden md:inline">{currentUser.name}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  Signed in as <span className="font-medium">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Channel info bar - only show when in a chat room */}
      {showBackButton && currentRoomId && (
        <div className="p-3 border-b bg-white shadow-sm">
          <h2 className="text-lg font-medium">{roomNames[currentRoomId] || 'Chat Room'}</h2>
          <p className="text-sm text-gray-600">4 members, 2 online</p>
        </div>
      )}
    </div>
  );
};

export default Navbar;
