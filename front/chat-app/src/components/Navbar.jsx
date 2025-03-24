import React from 'react';
import UserAvatar from './UserAvatar';

const Navbar = ({ currentUser }) => {
  return (
    <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center">
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
        <div className="flex items-center cursor-pointer group">
          <UserAvatar user={currentUser} size="sm" />
          <span className="ml-2 hidden md:inline">{currentUser.name}</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Navbar;