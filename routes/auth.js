const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User } = require('../models');
const { validate } = require('../middleware/validate');
const config = require('../config');
const router = express.Router();

router.post('/login', validate([
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
]), async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await user.validatePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            config.jwtSecret,
            { expiresIn: '7d' }
        );
        res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
