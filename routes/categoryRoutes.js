const express = require("express");
const db = require("../config/db"); // MySQL connection
const router = express.Router();

// ✅ GET All Categories
router.get("/all", (req, res) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching categories:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});

// ✅ ADD Category
router.post("/add", (req, res) => {
  const { category_name } = req.body;
  if (!category_name) {
    return res.status(400).json({ error: "Category name is required!" });
  }

  const sql = "INSERT INTO categories (category_name) VALUES (?)";
  db.query(sql, [category_name], (err, result) => {
    if (err) {
        console.log(err)
      console.error("❌ Error adding category:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "✅ Category added successfully", category_id: result.insertId });
  });
});

// ✅ UPDATE Category
router.put("/update/:id", (req, res) => {
  const { category_name } = req.body;
  const categoryId = req.params.id;

  const sql = "UPDATE categories SET category_name=? WHERE id=?";
  db.query(sql, [category_name, categoryId], (err, result) => {
    if (err) {
      console.error("❌ Error updating category:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "✅ Category updated successfully" });
  });
});

// ✅ DELETE Category
router.delete("/delete/:id", (req, res) => {
  const categoryId = req.params.id;

  const sql = "DELETE FROM categories WHERE id=?";
  db.query(sql, [categoryId], (err, result) => {
    if (err) {
      console.error("❌ Error deleting category:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "✅ Category deleted successfully" });
  });
});

module.exports = router;
