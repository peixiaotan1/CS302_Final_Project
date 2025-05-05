import React, { useState, useEffect, useRef } from "react";

const Rooms = ({ currentUser, onEnterRoom, socket, onRoomsUpdate }) => {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(true);
  const [makingNewRoom, setMakingNewRoom] = useState(false);
  const [joining, setJoining] = useState(false);

  const sentRef = useRef(false);

  useEffect(() => {
    const trySend = () => {
      if (sentRef.current) return;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(`7\n${currentUser}`);
        setPending(true);
        sentRef.current = true;
      } else {
        setTimeout(trySend, 100);
      }
    };
    trySend();
  }, [socket, currentUser]);

  // Update parent component when rooms change
  useEffect(() => {
    if (onRoomsUpdate) {
      onRoomsUpdate(rooms);
    }
  }, [rooms, onRoomsUpdate]);

  useEffect(() => {
    const handleMessage = (event) => {
        const data = event.data.trim();
      if(makingNewRoom){
        const newRoom = {
          id: data,
          name: newRoomName,
          members: 1,
        };

        setRooms([...rooms, newRoom]);
        setNewRoomName("");
        setShowCreateModal(false);
        setError("");
        setMakingNewRoom(false);
      } else if (joining){
        if (data === "0"){
          const newRoom = {
            id: data,
            name: data,
            members: 1,
          };
  
          setRooms([...rooms, newRoom]);

          setRoomIdToJoin("");
          setShowJoinModal(false);
          setError("");
        } else {
          setError("Room not found");
        }
      } else {
        const response = JSON.parse(data);
        const rooms = response.rooms;

        setRooms(rooms);
        setShowCreateModal(false);
        setNewRoomName("");
        setError("");
      }
      
      setPending(false);
    };
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, makingNewRoom, rooms, newRoomName]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      setError("Room name cannot be empty");
      return;
    }

    setPending(true);
    setMakingNewRoom(true);
    socket.send(`2\n${newRoomName}\n${currentUser}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomIdToJoin.trim()) {
      setError("Room ID cannot be empty");
      return;
    }

    socket.send(`3\n${roomIdToJoin}\n${currentUser}`);
    setJoining(true)
  };

  const handleExitRoom = (roomId) => {
    // In a real app, this would send a request to the backend to exit the room
    // For now, we'll just remove it from our list (simulating leaving the room)
    setRooms(rooms.filter((room) => room.id !== roomId));
  };

  const enterRoom = (roomId, roomName) => {
    // Navigate to the selected room with its name
    onEnterRoom(roomId, roomName);
  };

  return (
    <div className="flex-1 pt-32 px-4 bg-gray-100">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Rooms</h2>
            <div className="space-x-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Create Room
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Join Room
              </button>
            </div>
          </div>

          {rooms.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              You haven't joined any rooms yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {room.name}
                    </h3>
                    <button
                      onClick={() => handleExitRoom(room.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Exit
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {room.members} members
                  </p>
                  <button
                    onClick={() => enterRoom(room.id, room.name)}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded-md text-sm"
                  >
                    Enter Room
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Room</h3>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleCreateRoom}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="roomName"
                >
                  Room Name
                </label>
                <input
                  id="roomName"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Join a Room</h3>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleJoinRoom}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="roomId"
                >
                  Room ID
                </label>
                <input
                  id="roomId"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room ID"
                  value={roomIdToJoin}
                  onChange={(e) => setRoomIdToJoin(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  onClick={() => {
                    setShowJoinModal(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
