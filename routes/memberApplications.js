const express = require('express');
const router = express.Router();
const { MemberApplication, Member, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET all applications
router.get('/', authenticate, async (req, res) => {
    try {
        const apps = await MemberApplication.findAll({
            include: [{ model: User, as: 'reviewer', attributes: ['id', 'username'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single application
router.get('/:id', authenticate, async (req, res) => {
    try {
        const app = await MemberApplication.findByPk(req.params.id, {
            include: [{ model: User, as: 'reviewer', attributes: ['id', 'username'] }]
        });
        if (!app) return res.status(404).json({ error: 'Application not found' });
        res.json(app);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST – submit new application
router.post('/', authenticate, async (req, res) => {
    try {
        const data = req.body;
        const bcrypt = require('bcrypt');
        const hashed = await bcrypt.hash(data.member_password, 10);
        data.member_password = hashed;
        const app = await MemberApplication.create(data);
        res.status(201).json({ success: true, application: app });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT – review (approve/reject)
router.put('/:id', authenticate, authorize('admin', 'chairman'), async (req, res) => {
    try {
        const { status } = req.body;
        const app = await MemberApplication.findByPk(req.params.id);
        if (!app) return res.status(404).json({ error: 'Application not found' });

        await app.update({
            status,
            reviewed_by: req.user.id,
            reviewed_at: new Date()
        });

        if (status === 'approved') {
            const {
                full_name, gender, date_of_birth, nin, phone, member_password,
                marital_status, village, parish, sub_county, district,
                occupation, stage_name, next_of_kin_name, next_of_kin_phone,
                entrance_fee_paid, share_capital, photo_url
            } = app;
            const membership_no = `M-${new Date().getFullYear()}-${String(await Member.count() + 1).padStart(4, '0')}`;
            await Member.create({
                membership_no,
                full_name,
                gender,
                date_of_birth,
                nin,
                phone,
                member_password,
                marital_status,
                village,
                parish,
                sub_county,
                district,
                occupation,
                stage_name,
                next_of_kin_name,
                next_of_kin_phone,
                entrance_fee_paid,
                share_capital,
                photo_url,
                status: 'active',
                registration_date: new Date(),
                registered_by: req.user.id
            });
        }

        res.json({ success: true, application: app });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE
router.delete('/:id', authenticate, authorize('admin', 'chairman'), async (req, res) => {
    try {
        const app = await MemberApplication.findByPk(req.params.id);
        if (!app) return res.status(404).json({ error: 'Application not found' });
        await app.destroy();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
