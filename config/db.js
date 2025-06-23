const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  },
});

sequelize
  .authenticate()
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => {
    console.error("❌ Connection Error:", err.message);
    console.error(err);
  });

module.exports = sequelize;
