import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const socket = new WebSocket('wss://df6a-174-177-46-187.ngrok-free.app');

let pingInterval

function startPing(){
  pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN){
          socket.send('ping');
      }
  }, 30000);
}

function stopPing(){
  clearInterval(pingInterval);
}

socket.onopen = function(){
  console.log('Connected to the server');
  startPing();
};

socket.onclose = function(){
  console.log('Disconnected from the server');
  stopPing();
};

root.render(
  <React.StrictMode>
    <App socket={socket}/>
  </React.StrictMode>
);