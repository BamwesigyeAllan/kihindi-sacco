const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { body, param } = require('express-validator');
const { Member, Transaction, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { generateMembershipNo } = require('../utils/helpers');
const router = express.Router();

const uploadDir = './uploads/photos';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'member-' + unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/', authenticate, async (req, res) => {
    try {
        const members = await Member.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, authorize('admin', 'manager'), upload.single('photo'), validate([
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('nin').trim().notEmpty().withMessage('NIN is required'),
    body('member_password').notEmpty().withMessage('Member password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('next_of_kin_name').trim().notEmpty().withMessage('Next of kin name is required'),
    body('next_of_kin_phone').trim().notEmpty().withMessage('Next of kin phone is required'),
    body('share_capital').optional().isFloat({ min: 0 }).withMessage('Share capital must be a non-negative number'),
    body('entrance_fee_paid').optional().isBoolean().withMessage('Entrance fee paid must be true or false')
]), async (req, res) => {
    try {
        const body = req.body;
        const photoPath = req.file ? req.file.path : null;

        if (!body.full_name || !body.nin || !body.member_password) {
            return res.status(400).json({ error: 'Full name, NIN, and password are required' });
        }

        const existing = await Member.findOne({ where: { nin: body.nin } });
        if (existing) return res.status(409).json({ error: 'NIN already registered' });

        const membership_no = await generateMembershipNo();
        const hashedPassword = await bcrypt.hash(body.member_password, 10);

        const member = await Member.create({
            membership_no,
            full_name: body.full_name,
            gender: body.gender,
            date_of_birth: body.date_of_birth,
            nin: body.nin,
            phone: body.phone,
            member_password: hashedPassword,
            marital_status: body.marital_status,
            village: body.village,
            parish: body.parish,
            sub_county: body.sub_county,
            district: body.district,
            occupation: body.occupation,
            stage_name: body.stage_name,
            next_of_kin_name: body.next_of_kin_name,
            next_of_kin_phone: body.next_of_kin_phone,
            entrance_fee_paid: body.entrance_fee_paid === 'true',
            share_capital: parseFloat(body.share_capital) || 0,
            photo_url: photoPath,
            status: body.status || 'pending',
            registration_date: new Date(),
            registered_by: req.user.id
        });

        if (member.entrance_fee_paid) {
            await Transaction.create({
                member_id: member.id,
                type: 'fee',
                amount: 20000,
                description: 'Entrance fee paid',
                created_by: req.user.id
            });
        }

        res.status(201).json({ success: true, member });
    } catch (error) {
        console.error('Create member error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', authenticate, authorize('admin', 'manager'), upload.single('photo'), validate([
    param('id').isInt().withMessage('Member ID must be an integer'),
    body('phone').optional().trim().isLength({ min: 7 }).withMessage('Phone number is invalid'),
    body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Status must be active, inactive, or pending')
]), async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);
        if (!member) return res.status(404).json({ error: 'Member not found' });
        if (req.file) {
            if (member.photo_url && fs.existsSync(member.photo_url)) fs.unlinkSync(member.photo_url);
            req.body.photo_url = req.file.path;
        }
        await member.update(req.body);
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);
        if (!member) return res.status(404).json({ error: 'Member not found' });
        await member.update({ status: 'inactive' });
        res.json({ success: true, message: 'Member deactivated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;