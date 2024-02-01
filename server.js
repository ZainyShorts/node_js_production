const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const cors = require('cors');
const User = require("./models/userModel");
dotenv.config();
connectDB();
const app = express();

app.use(cors()); // allow front api's
app.use(express.json()); // to accept json data

// app.get("/", (req, res) => {
//   res.send("API Running!");
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
// }

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", async(_id) => {
    console.log('Setup' + _id)
    socket.emit("connected");
    
  });

  // socket.on('online',async()=>{
  //   console.log('wait')
  //   const users = await User.find()
  //   await User.updateOne({_id},{$set:{'online':true}})
  //   socket.join(_id);
  //   users.forEach(u => {
  //     socket.in(u._id).emit("onlineUser");
  //   });
  // })

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  // socket.on("typing", (room) => socket.in(room).emit("typing"));
  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id != newMessageRecieved.sender._id)
      {
        socket.in(user._id).emit("message recieved", newMessageRecieved);
        // socket.in(user._id).emit("latestMessage", newMessageRecieved);
        
      }
    });
  });

  
  // socket.on("disconnect", async() => {
  //   socket.emit('disconnected')
  //   console.log("Client disconnected");
  // });
  socket.on("close", () => {
    // socket.emit('disconnected')
    console.log("Client disconnected");
  });
});
