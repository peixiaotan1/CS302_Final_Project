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
        
        return (
          <div 
            key={message.id} 
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            {!isOwnMessage && (
              <div className="mr-2 flex-shrink-0">
                <UserAvatar user={message.sender} />
              </div>
            )}
            <div className="max-w-xs md:max-w-md space-y-1">
              {!isOwnMessage && (
                <div className="text-sm font-medium">{message.sender.name}</div>
              )}
              <div 
                className={`px-4 py-2 rounded-lg ${
                  isOwnMessage 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <div>{message.text}</div>
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;