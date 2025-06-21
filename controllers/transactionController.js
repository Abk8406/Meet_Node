const db = require('../Model/index'); // Import models
const { Sequelize } = require('sequelize');

async function performTransaction(req, res) {
  const t = await db.sequelize.transaction();

  try {
    // Deduct balance from user
    await db.User.update(
      { balance: Sequelize.literal('balance - 100') },
      { where: { id: 1 }, transaction: t }
    );

    // Create an order
    await db.Order.create(
      { userId: 1, amount: 100 },
      { transaction: t }
    );

    // Commit transaction
    await t.commit();
    res.json({ success: true, message: 'Transaction committed successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Transaction failed', error });
  }
}

module.exports = { performTransaction };
