import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatRoom = ({ messages, currentUser, onSendMessage }) => {
  return (
    <div className="flex-1 flex flex-col w-full h-full relative bg-gray-100">
      {/* Increased top padding to account for the taller navbar with channel info */}
      <div className="flex-1 overflow-y-auto pb-16 pt-32">
        <div className="p-4 max-w-screen-xl mx-auto">
          <MessageList messages={messages} currentUser={currentUser} />
        </div>
      </div>
      
      {/* Fixed message input at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t shadow-md z-10">
        <div className="max-w-screen-xl mx-auto">
          <MessageInput onSendMessage={onSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
