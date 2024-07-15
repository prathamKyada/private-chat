const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const app = require("express")();
const cors = require("cors");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(bodyparser.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8082"],
  })
);

let clientSocketIds = [];
let CONNECTED_USER = [];
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "chat1",
});

app.post("/login", (req, res) => {    
  // console.log('logined')
  connection.query(
    `SELECT user_name, user_id, user_full_name, user_image from chat_user where user_name="${req.body.username}" AND password="${req.body.password}"`,
    function (error, results, fields) {
      if (error) throw error;

      if (results.length == 1) {
        res.send({ data: results[0] });
      } else {
        res.send({ status: false });
      }
    }
  );
});



app.get("/past-chats/:user1Id/:user2Id", (req, res) => {
  const user1Id = req.params.user1Id;
  const user2Id = req.params.user2Id;

  const query = `
     SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp ASC`;


  connection.query(
    query,
    [user1Id, user2Id, user2Id, user1Id],
    (err, results) => {
      if (err) throw err;
      res.json(results);
    }
  );
});

const getSocketByUserId = (userId) => {
  let socket = "";
  for (let i = 0; i < clientSocketIds.length; i++) {
    if (clientSocketIds[i].userId == userId) {
      socket = clientSocketIds[i].socket;
      break;
    }
  }
  return socket;
};

let receiverId;


io.on("connection", (socket) => {
  console.log("connected");

  socket.on("disconnect", () => {
    console.log("disconnected");
    CONNECTED_USER = CONNECTED_USER.filter(
      (item) => item.socketId != socket.id
    );
    io.emit("updateUserList", CONNECTED_USER);
  });

  socket.on("loggedin", function (user) {
    clientSocketIds.push({
      username: user.user_name,
      user_full_name: user.user_full_name,
      user_id: user.user_id,
      user_img: user.user_image,
    });

    CONNECTED_USER = CONNECTED_USER.filter(
      (item) => item.user_id != user.user_id
    );
    CONNECTED_USER.push({ ...user, socketId: socket.id });
    io.emit("updateUserList", CONNECTED_USER);
  });

  socket.on("create", function (data) {

    receiverId = data.withUserId;
    socket.join(data.room);
    let withSocket = getSocketByUserId( receiverId );
    socket.broadcast.to(data.room).emit("invite", { room: data });
  });

  socket.on("joinRoom", function (data) {
    socket.join(data?.room.room);
  });

  socket.on("message", function (data) {
    let query =
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)";

    // sessionStorage.setItem('ReceiverId', receiverId)
    // console.log("Reciver > ", receiverId);
    connection.query(
      query,
      [data.from.user_id, receiverId, data.message],
      function (error, result) {
        if (error) throw error;
        // console.log("Message inserted:", result.insertId);
      }
    );

    socket.to(CONNECTED_USER.socketId).emit("message", data);
  });
});

server.listen(8082, function () {
  console.log("server started");
});