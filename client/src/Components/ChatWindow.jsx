import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import jack from '../Assests/Images/jack.jpg'
const socket = io("http://localhost:8082", { transports: ["websocket"] });

const ChatWindow = ({ room }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  let dataa;
  let dtt;
  useEffect(() => {
    axios
      .get("http://localhost:8082/past-chats/1/2")
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error("Failed to load past chats:", error);
      });

    socket.on("message", (msg) => {
      if (msg.room === room) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [room]);

  let toUserId;
  toUserId = sessionStorage.getItem("touserdata");

  const handleSendMessage = () => {
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));

    if (!messageText.trim()) {
      alert("Please enter a message.");
      return;
    }

    dataa = {
      room: room,
      message: messageText,
      from: loggedInUser,
      to: toUserId,
    };

    socket.emit("message", dataa);

    dtt = {
      from: loggedInUser,
      to: dataa.to,
      content: messageText,
    };

    setMessages((prevMessages) => [...prevMessages, dtt]);

    setMessageText("");
  };

  function chatMsgSwap(msg) {
    if (msg.sender_id === toUserId) {
      return "left";
    }
    return "right";
  }

  return (
    <div className="chat-window" id={room}>
      <div className="body">
        {messages.map((msg, index) => (
          <div key={index} className="chat-text-right-aligned">
            <div className="userPhoto">
              <img src={jack} alt="" width={40}/>
            </div>
            <div className={`align-msg-${chatMsgSwap(msg)}`}>
                <span className={`message`}>{msg.content}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="footer">
        <input
          type="text"
          className="messageText"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button className="submit-btn" onClick={handleSendMessage}>
          GO
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
