const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET all users
router.get('/', authenticate, authorize('admin', 'chairman'), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['id', 'ASC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single user
router.get('/:id', authenticate, authorize('admin', 'chairman'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST – create user
router.post('/', authenticate, authorize('admin', 'chairman'), async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const existing = await User.findOne({ where: { username } });
        if (existing) return res.status(409).json({ error: 'Username already exists' });
        const hashed = await User.hashPassword(password);
        const user = await User.create({ username, password_hash: hashed, role });
        res.status(201).json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT – update user
router.put('/:id', authenticate, authorize('admin', 'chairman'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { username, password, role } = req.body;
        const updateData = {};
        if (username) updateData.username = username;
        if (role) updateData.role = role;
        if (password) {
            updateData.password_hash = await User.hashPassword(password);
        }
        await user.update(updateData);
        res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE
router.delete('/:id', authenticate, authorize('admin', 'chairman'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        await user.destroy();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
