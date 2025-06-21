const db = require("../Model/index"); // Import your Sequelize setup

async function testDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connection successful!");

    // Run a test query
    const user = await db.User.findAll();
    console.log("✅ Users retrieved:", user.length);

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    db.sequelize.close();
  }
}

testDatabase();
