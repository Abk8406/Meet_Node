const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Role = sequelize.define("roles", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  role_name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
}, { timestamps: false });

module.exports = Role;


