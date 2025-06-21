const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Room = sequelize.define("rooms", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  room_id: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  created_at: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, { timestamps: false });

module.exports = Room; 