const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RoomUser = sequelize.define("room_users", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  room_id: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  user_name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  joined_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, { timestamps: false });

module.exports = RoomUser; 