import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Login from "./Components/Login";
import ChatWindow from "./Components/ChatWindow";
import UserList from "./Components/UserList";
import "./App.css";
// import './Style/chat.css'


const socket = io("http://localhost:8082");

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    socket.on("updateUserList", (userList) => {
      setUsers(userList);
    });

    socket.on("invite", (data) => {
      socket.emit("joinRoom", data);
      setCurrentRoom(data.room.room);
    });

    socket.on("message", (msg) => {
      if (currentRoom !== msg.room) {
        setCurrentRoom(msg.room);
      }
    });

    return () => {
      socket.off("updateUserList");
      socket.off("invite");
      socket.off("message");
    };
  }, [currentRoom]);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
    socket.emit("loggedin", userData);
  };

  const handleCreateRoom = (id) => {
    let room = Date.now() + Math.random();
    room = room.toString().replace(".", "_");
    let data = {
      room: room,
      userId: user.user_id,
      withUserId: id,
    }

    sessionStorage.setItem('touserdata', data.userId)
    socket.emit("create", data );
    console.log("App Data > ", data.userId);
    setCurrentRoom(room);
  };
  // console.log("userrr > ", user.user_image);
  return (
    <div className="App">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div id="after-login">
            <div className="me">
              <img src={`/Assests/Images/${user.user_image}`} alt="" />
              {user.user_full_name}
            </div>
          <div className="user-list-chat-window">
            <div className="user-list">
              <UserList users={users} onCreateRoom={handleCreateRoom} />
            </div>
            <div className="chat-window">
              {currentRoom && <ChatWindow room={currentRoom} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
