const express = require("express");
const db = require("../config/db"); // MySQL connection
const   router = express.Router();

/** ✅ Add User to `cartUser` Table */
router.post("/add-user", (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: "User ID is required!" });
    }

    const sql = "INSERT INTO cartUser (user_id) VALUES (?)";
    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("❌ Error adding user to cart:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ message: "✅ User added to cart", cart_user_id: result.insertId });
    });
});

/** ✅ Add Product to `cartDetails` */
router.post("/add-item", (req, res) => {
    const { cart_user_id, product_id, name, image, price, item_number, category_id } = req.body;
    if (!cart_user_id || !product_id || !name || !image || !price || !item_number || !category_id) {
        return res.status(400).json({ error: "All fields are required!" });
    }
    const sql = `
        INSERT INTO cartDetails (cart_user_id, product_id, name, image, price, item_number, category_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [cart_user_id, product_id, name, image, price, item_number, category_id], (err, result) => {
        if (err) {
            console.error("❌ Error adding item to cart:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ message: "✅ Item added to cart", cart_item_id: result.insertId });
    });
});

/** ✅ Get All Cart Items for a User */
router.get("/user-cart/:user_id", (req, res) => {
    const user_id = req.params.user_id;

    const sql = `
        SELECT cd.id, cd.name, cd.image, cd.price, cd.item_number, c.category_name, cd.created_at
        FROM cartDetails cd
        JOIN cartUser cu ON cd.cart_user_id = cu.id
        JOIN categories c ON cd.category_id = c.id
        WHERE cu.user_id = ?
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("❌ Error fetching user cart:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(results);
    });
});

/** ✅ Remove an Item from Cart */
router.delete("/remove-item/:cart_item_id", (req, res) => {
    const cart_item_id = req.params.cart_item_id;

    const sql = "DELETE FROM cartDetails WHERE id = ?";
    db.query(sql, [cart_item_id], (err, result) => {
        if (err) {
            console.error("❌ Error removing item from cart:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ message: "✅ Item removed from cart" });
    });
});

/** ✅ Clear User Cart */
router.delete("/clear-cart/:user_id", (req, res) => {
    const user_id = req.params.user_id;

    const sql = `
        DELETE cd FROM cartDetails cd
        JOIN cartUser cu ON cd.cart_user_id = cu.id
        WHERE cu.user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error("❌ Error clearing user cart:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ message: "✅ User cart cleared" });
    });
});

module.exports = router;
