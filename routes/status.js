const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json([{ version: "1.0" }]);
});

module.exports = router;