const User = require('./User');
const Role = require('./Role');
const Room = require('./Room');
const RoomUser = require('./RoomUser');

User.belongsTo(Role, { foreignKey: 'id' });  // Assuming `role_id` is in `users` table
Role.hasMany(User, { foreignKey: 'id' });

// Room associations
Room.hasMany(RoomUser, { foreignKey: 'room_id', sourceKey: 'room_id' });
RoomUser.belongsTo(Room, { foreignKey: 'room_id', targetKey: 'room_id' });

module.exports = { User, Role, Room, RoomUser };
