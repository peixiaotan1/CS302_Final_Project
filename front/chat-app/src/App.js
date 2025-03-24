import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ChatRoom from './components/ChatRoom';

function App() {
  const [currentUser, setCurrentUser] = useState({
    id: '1',
    name: 'John Doe',
    avatar: '/api/placeholder/40/40'
  });
  
  // Mock data for chat messages
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello everyone! Welcome to our group chat.',
      sender: { id: '2', name: 'Jane Smith', avatar: '/api/placeholder/40/40' },
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      text: 'Hi Jane! Thanks for setting this up.',
      sender: { id: '3', name: 'Mike Johnson', avatar: '/api/placeholder/40/40' },
      timestamp: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: '3',
      text: 'Glad to be here! What are we discussing today?',
      sender: { id: '1', name: 'John Doe', avatar: '/api/placeholder/40/40' },
      timestamp: new Date(Date.now() - 2400000).toISOString()
    },
    {
      id: '4',
      text: 'I thought we could talk about the new project requirements.',
      sender: { id: '2', name: 'Jane Smith', avatar: '/api/placeholder/40/40' },
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ]);
  
  const handleSendMessage = (text) => {
    if (text.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text,
        sender: currentUser,
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, newMessage]);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar currentUser={currentUser} />
      <div className="flex-1 pt-16">
        <ChatRoom 
          messages={messages} 
          currentUser={currentUser} 
          onSendMessage={handleSendMessage} 
        />
      </div>
    </div>
  );
}

export default App;