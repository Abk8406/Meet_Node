const express = require('express');
const router = express.Router();
const { performTransaction } = require('../controllers/transactionController');

router.post('/transaction', performTransaction);

module.exports = router;
