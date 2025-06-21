// const db = require("./config/db");

// const createCartUserTable = `
// CREATE TABLE IF NOT EXISTS cartUser (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     user_id INT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );`;

// const createCartDetailsTable = `
// CREATE TABLE IF NOT EXISTS cartDetails (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     cart_user_id INT NOT NULL,
//     product_id INT NOT NULL,
//     name VARCHAR(255) NOT NULL,
//     image VARCHAR(255) NOT NULL,
//     price DECIMAL(10,2) NOT NULL,
//     item_number VARCHAR(100) NOT NULL,
//     category_id INT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (cart_user_id) REFERENCES cartUser(id) ON DELETE CASCADE,
//     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
// );`;

// // Execute table creation queries one by one
// db.query(createCartUserTable, (err) => {
//   if (err) {
//     console.error("❌ Error creating cartUser table:", err.message);
//     return db.end();
//   }
//   console.log("✅ cartUser table created successfully!");

//   db.query(createCartDetailsTable, (err) => {
//     if (err) {
//       console.error("❌ Error creating cartDetails table:", err.message);
//     } else {
//       console.log("✅ cartDetails table created successfully!");
//     }
//     db.end(); // Close the database connection after execution
//   });
// });
