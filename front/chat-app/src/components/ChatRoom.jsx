import React, { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatRoom = ({ roomId, currentUser, onSendMessage, socket }) => {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(true);

  const sentRef = useRef(false);

  useEffect(() => {
    const trySend = () => {
      if (sentRef.current) return;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(`5\n${roomId}`);
        socket.send(`4\n${roomId}`);
        setPending(true);
        sentRef.current = true;
      } else {
        setTimeout(trySend, 100);
      }
    };
    trySend();
  }, [socket, currentUser]);



  React.useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data.trim());
        let incomingMessages = [];
  
        if (data.type === "new_message") {
          const chat = data;
          if (chat.user && chat.message && chat.timestamp) {
            incomingMessages.push({
              id: `${Date.now()}`,
              text: chat.message,
              sender: {
                id: chat.user,
                name: chat.user,
                avatar: `/api/placeholder/40/40?text=${chat.user.charAt(0).toUpperCase()}`,
              },
              timestamp: new Date(chat.timestamp).toISOString(),
            });
          }
        } else if (Array.isArray(data.chats)) {
          incomingMessages = data.chats
            .filter(chat => chat.user && chat.message && chat.timestamp)
            .map((chat, index) => ({
              id: `${Date.now()}-${index}`,
              text: chat.message,
              sender: {
                id: chat.user,
                name: chat.user,
                avatar: `/api/placeholder/40/40?text=${chat.user.charAt(0).toUpperCase()}`,
              },
              timestamp: new Date(chat.timestamp).toISOString(),
            }));
        }
  
        if (incomingMessages.length > 0) {
          setMessages((prev) => [...prev, ...incomingMessages]);
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };
  
    socket.addEventListener("message", handleMessage);
  
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);
  

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
