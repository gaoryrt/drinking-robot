const express = require('express');
const { getConfig, saveConfig } = require('../config');
const router = express.Router();

// Middleware for data validation
function validateConfig(req, res, next) {
    const config = req.body;
    if (typeof config !== 'object' || config === null) {
        return res.status(400).send('Bad Request: config must be a JSON object.');
    }
    // todo 验证配置信息
    next();
}

// Use middleware before the routes where it's needed
router.post('/', validateConfig, async (req, res) => {
    try {
        await saveConfig(req.body);
        res.status(200).send('Configuration saved successfully.');
    } catch (error) {
        res.status(500).send('Error saving configuration.');
    }
});

router.get('/', async (req, res) => {``
    try {
        const config = await getConfig();
        res.status(200).json(config);
    } catch (error) {
        res.status(500).send('Error retrieving configuration.');
    }
});

module.exports = router;