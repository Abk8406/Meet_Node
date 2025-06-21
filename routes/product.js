const express = require("express");
const db = require("../config/db"); // MySQL connection
const router = express.Router();

// ✅ GET All Products (with optional category filter)
router.get("/details", (req, res) => {
  const { category } = req.query; // Get category from query params

  let sql = `
    SELECT p.id, p.name, p.image, p.price, p.item_number, c.category_name, p.created_at
    FROM products p 
    JOIN categories c ON p.category_id = c.id
  `;

  if (category) {
    sql += ` WHERE c.category_name = ?`; // Filter by category
  }

  sql += " ORDER BY p.created_at DESC"; // Show latest products first

  db.query(sql, category ? [category] : [], (err, results) => {
    if (err) {
      console.error("❌ Error fetching products:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

module.exports = router;




// ✅ ADD Product
router.post("/add", (req, res) => {
  const { name, image, price, item_number, category_id } = req.body;
  if (!name || !image || !price || !item_number || !category_id) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const sql = `INSERT INTO products (name, image, price, item_number, category_id) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [name, image, price, item_number, category_id], (err, result) => {
    if (err) {
      console.error("❌ Error adding product:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "✅ Product added successfully", product_id: result.insertId });
  });
});

// ✅ UPDATE Product
router.put("/update/:id", (req, res) => {
  const { name, image, price, item_number, category_id } = req.body;
  const productId = req.params.id;

  const sql = `UPDATE products SET name=?, image=?, price=?, item_number=?, category_id=? WHERE id=?`;
  db.query(sql, [name, image, price, item_number, category_id, productId], (err, result) => {
    if (err) {
      console.error("❌ Error updating product:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "✅ Product updated successfully" });
  });
});

// ✅ DELETE Product
router.delete("/delete/:id", (req, res) => {
  const productId = req.params.id;

  const sql = `DELETE FROM products WHERE id=?`;
  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error("❌ Error deleting product:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "✅ Product deleted successfully" });
  });
});

module.exports = router;
