const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db"); // Ensure database is connected
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
require("./dbInit");
const openai = require("./routes/open.routes");
const deepseek = require("./routes/deepseek.routes");
const transactionRoutes = require('./routes/transactionRoutes');
const roomRoutes = require('./routes/roomRoutes');
const User = require("./Model/User");
const Role = require("./Model/Role");
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Sync Database
db.sync({ alter: true }).then(() => {
  console.log("Tables Synced!");
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/openai', openai);
app.use('/api/deepseek', deepseek);
app.use('/api/rooms', roomRoutes);

// In-memory store for room data (can be shifted to Redis or a DB for persistence)
const rooms = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.emit('connection-established', { userId: socket.id });

  socket.on('join-room', ({ roomId, userName }) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`User ${socket.id} (${userName}) joined room: ${roomId}`);

    // Store user info
    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }
    rooms[roomId][socket.id] = { userName };

    // Get list of all users in the room
    const roomMembers = Object.keys(rooms[roomId]).map(id => ({
      id: id,
      name: rooms[roomId][id].userName,
      isSharing: rooms[roomId][id].isSharing || false
    }));
    
    // Send the full member list to the new user
    socket.emit('room-members', roomMembers);

    // Notify other users in the room
    socket.to(roomId).emit('user-joined', { 
      userId: socket.id, 
      userName: userName,
      roomId: roomId 
    });
  });

  socket.on('start-sharing', ({ roomId }) => {
    if (rooms[roomId] && rooms[roomId][socket.id]) {
      rooms[roomId][socket.id].isSharing = true;
      socket.to(roomId).emit('user-started-sharing', { userId: socket.id, roomId });
    }
  });
  
  socket.on('stop-sharing', ({ roomId }) => {
    if (rooms[roomId] && rooms[roomId][socket.id]) {
      rooms[roomId][socket.id].isSharing = false;
      socket.to(roomId).emit('user-stopped-sharing', { userId: socket.id, roomId });
    }
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      sender: socket.id,
      roomId: data.roomId
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      sender: socket.id,
      roomId: data.roomId
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id,
      roomId: data.roomId
    });
  });

  // Chat message handler
  socket.on('chat-message', (msg) => {
    if (msg && msg.roomId) {
      socket.to(msg.roomId).emit('chat-message', msg);
    }
  });

  // Typing indicator handlers
  socket.on('typing', (data) => {
    if (data && data.roomId && data.userName) {
      socket.to(data.roomId).emit('typing', { userId: socket.id, userName: data.userName });
    }
  });
  socket.on('stop-typing', (data) => {
    if (data && data.roomId && data.userName) {
      socket.to(data.roomId).emit('stop-typing', { userId: socket.id, userName: data.userName });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Find which room the user was in
    for (const roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        delete rooms[roomId][socket.id];
        // Notify others in the room
        socket.to(roomId).emit('user-left', { userId: socket.id, roomId: roomId });
        if (Object.keys(rooms[roomId]).length === 0) {
          delete rooms[roomId]; // Clean up empty room
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
