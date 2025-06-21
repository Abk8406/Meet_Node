const express = require('express');
const router = express.Router();
const Room = require('../Model/Room');
const RoomUser = require('../Model/RoomUser');

// Route to create a room
router.post('/create', async (req, res) => {
  try {
    const { roomName } = req.body;
    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    
    const roomId = Date.now().toString(); // Simple unique ID
    
    // Save room to database
    const room = await Room.create({
      room_id: roomId,      
      name: roomName
    });
    
    res.status(201).json({ roomId, roomName });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Route to join a room
router.post('/join', async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    if (!roomId || !userName) {
      return res.status(400).json({ error: 'Room ID and user name are required' });
    }
    
    // Check if room exists
    const room = await Room.findOne({ where: { room_id: roomId, is_active: true } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Check if user is already in the room
    const existingUser = await RoomUser.findOne({ 
      where: { 
        room_id: roomId, 
        user_name: userName, 
        is_active: true 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User is already in this room' });
    }
    
    // Add user to room
    await RoomUser.create({
      room_id: roomId,
      user_name: userName
    });
    
    res.status(200).json({ message: `User ${userName} joined room ${room.name}` });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Route to get room details
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOne({ where: { room_id: roomId, is_active: true } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Get all users in the room
    const users = await RoomUser.findAll({ 
      where: { room_id: roomId, is_active: true },
      attributes: ['user_name', 'joined_at']
    });
    
    res.status(200).json({
      roomId: room.room_id,
      roomName: room.name,
      users: users.map(user => ({
        name: user.user_name,
        joinedAt: user.joined_at
      }))
    });
  } catch (error) {
    console.error('Error getting room details:', error);
    res.status(500).json({ error: 'Failed to get room details' });
  }
});

// Route to leave a room
router.post('/leave', async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    if (!roomId || !userName) {
      return res.status(400).json({ error: 'Room ID and user name are required' });
    }
    
    // Deactivate user in room (soft delete)
    const result = await RoomUser.update(
      { is_active: false },
      { where: { room_id: roomId, user_name: userName, is_active: true } }
    );
    
    if (result[0] === 0) {
      return res.status(404).json({ error: 'User not found in room' });
    }
    
    res.status(200).json({ message: `User ${userName} left the room` });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

module.exports = router; 