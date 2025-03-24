import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatRoom = ({ messages, currentUser, onSendMessage }) => {
  return (
    <div className="flex-1 flex flex-col max-w-screen-xl mx-auto w-full h-full">
      <div className="p-4 border-b bg-white shadow-sm">
        <h2 className="text-lg font-medium">General Discussion</h2>
        <p className="text-sm text-gray-600">4 members, 2 online</p>
      </div>
      
      {/* Message list with flex-1 to take available space */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <MessageList messages={messages} currentUser={currentUser} />
        </div>
      </div>
      
      {/* Fixed message input at the bottom */}
      <div className="px-4 py-3 bg-white border-t shadow-md">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export default ChatRoom;