const express = require('express');
const { body, param } = require('express-validator');
const { FixedDeposit, Member, Transaction } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { generateDepositAccountNo } = require('../utils/helpers');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { member_id } = req.query;
        const where = {};
        if (member_id) where.member_id = member_id;

        const deposits = await FixedDeposit.findAll({
            where,
            include: [{ model: Member, attributes: ['id', 'full_name', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });
        // Enrich with quarterly interest info
        const enriched = deposits.map(dep => {
            const d = dep.toJSON();
            const quarterly = Number(d.amount) * (Number(d.interest_rate) / 100) / 4;
            const monthsSince = Math.floor((new Date() - new Date(d.start_date)) / (30 * 24 * 60 * 60 * 1000));
            const quarters = Math.floor(monthsSince / 3);
            return {
                ...d,
                quarterly_interest: quarterly,
                quarters_completed: quarters,
                total_interest_earned: quarterly * quarters,
                next_interest_date: new Date(new Date(d.start_date).setMonth(new Date(d.start_date).getMonth() + (quarters + 1) * 3))
            };
        });
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, authorize('admin', 'manager'), validate([
    body('member_id').isInt().withMessage('Member ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('interest_rate').isFloat({ gt: 0 }).withMessage('Interest rate must be greater than 0'),
    body('tenor_months').isInt({ gt: 0 }).withMessage('Tenor months must be a positive integer'),
    body('start_date').isISO8601().withMessage('Start date must be a valid date'),
    body('interest_payment').optional().isIn(['at_maturity', 'monthly', 'quarterly']).withMessage('Interest payment must be at_maturity, monthly, or quarterly'),
    body('payment_mode').optional().isIn(['cash', 'bank', 'mmo']).withMessage('Payment mode must be cash, bank, or mmo')
]), async (req, res) => {
    try {
        const { member_id, amount, interest_rate, tenor_months, start_date, interest_payment, payment_mode, reference_no, amount_words } = req.body;

        const member = await Member.findByPk(member_id);
        if (!member || member.status !== 'active') {
            return res.status(400).json({ error: 'Member not found or inactive' });
        }

        const start = new Date(start_date);
        const maturity = new Date(start);
        maturity.setMonth(maturity.getMonth() + parseInt(tenor_months));

        const account_no = await generateDepositAccountNo(start);

        const deposit = await FixedDeposit.create({
            account_no,
            member_id,
            amount,
            amount_words,
            interest_rate,
            tenor_months,
            start_date: start,
            maturity_date: maturity,
            interest_payment: interest_payment || 'quarterly',
            payment_mode: payment_mode || 'cash',
            reference_no,
            status: 'active',
            created_by: req.user.id,
            interest_earned: 0,
            last_interest_date: start,
            total_interest_paid: 0
        });

        await Transaction.create({
            member_id,
            type: 'deposit',
            amount,
            description: `Fixed deposit opened: ${account_no}`,
            reference: account_no,
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            deposit,
            quarterly_interest: Number(amount) * (Number(interest_rate) / 100) / 4,
            maturity_date: maturity
        });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Calculate and add quarterly interest
router.post('/:id/interest', authenticate, authorize('admin', 'manager'), validate([
    param('id').isInt().withMessage('Deposit ID must be an integer')
]), async (req, res) => {
    try {
        const deposit = await FixedDeposit.findByPk(req.params.id, {
            include: [{ model: Member }]
        });
        if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
        if (deposit.status !== 'active') {
            return res.status(400).json({ error: 'Deposit is not active' });
        }

        const quarterly = Number(deposit.amount) * (Number(deposit.interest_rate) / 100) / 4;
        const newTotal = Number(deposit.total_interest_paid) + quarterly;

        await deposit.update({
            total_interest_paid: newTotal,
            last_interest_date: new Date(),
            interest_earned: Number(deposit.interest_earned) + quarterly
        });

        await Transaction.create({
            member_id: deposit.member_id,
            type: 'interest_payment',
            amount: quarterly,
            description: `Quarterly interest for ${deposit.account_no}`,
            reference: deposit.account_no,
            created_by: req.user.id
        });

        res.json({
            success: true,
            quarterly_interest: quarterly,
            total_interest_paid: newTotal,
            next_interest_date: new Date(new Date().setMonth(new Date().getMonth() + 3))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;