import React, { useRef, useEffect } from 'react';
import UserAvatar from './UserAvatar';

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender.id === currentUser.id;
        
        if (isOwnMessage) {
          // Current user's message - right side
          return (
            <div key={message.id} className="flex justify-end mb-4">
              <div className="max-w-xs md:max-w-md">
                <div className="bg-blue-500 text-white p-3 rounded-lg rounded-br-none">
                  {message.text}
                </div>
                <div className="text-xs text-gray-500 text-right mt-1 mr-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>
              <div className="ml-2 flex-shrink-0">
                <UserAvatar user={currentUser} />
              </div>
            </div>
          );
        } else {
          // Other user's message - left side
          return (
            <div key={message.id} className="flex justify-start mb-4">
              <div className="mr-2 flex-shrink-0">
                <UserAvatar user={message.sender} />
              </div>
              <div className="max-w-xs md:max-w-md">
                <div className="text-sm font-medium">
                  {message.sender.name}
                </div>
                <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none">
                  {message.text}
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          );
        }
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
