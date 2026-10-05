const express = require('express');
const { body, param } = require('express-validator');
const { SavingsAccount, SavingsTransaction, Member, SavingsAlert, WithdrawalReceipt, Transaction } = require('../models');
const { authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { SAVINGS_WRITE } = require('../utils/roles');
const router = express.Router();

// Get all savings accounts
router.get('/', async (req, res) => {
    try {
        const accounts = await SavingsAccount.findAll({
            include: [{ model: Member, attributes: ['id', 'full_name', 'phone', 'nin'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific member's savings account
router.get('/member/:memberId', validate([
    param('memberId').isInt().withMessage('Member ID must be an integer')
]), async (req, res) => {
    try {
        const account = await SavingsAccount.findOne({
            where: { member_id: req.params.memberId },
            include: [{ model: Member, attributes: ['id', 'full_name', 'phone', 'nin'] }]
        });
        if (!account) return res.status(404).json({ error: 'Savings account not found' });
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get alerts for a member
router.get('/alerts/:memberId', async (req, res) => {
    try {
        const alerts = await SavingsAlert.findAll({
            where: { member_id: req.params.memberId, is_read: false },
            order: [['triggered_at', 'DESC']]
        });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark alert as read
router.put('/alerts/:alertId', async (req, res) => {
    try {
        await SavingsAlert.update({ is_read: true }, { where: { id: req.params.alertId } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deposit with milestone alerts
router.post('/deposit', authorize(...SAVINGS_WRITE), validate([
    body('member_id').isInt().withMessage('Member ID must be an integer'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('description').optional().trim(),
    body('reference_no').optional().trim(),
    body('payment_mode').optional().isIn(['cash', 'bank', 'mmo']).withMessage('Payment mode must be cash, bank, or mmo')
]), async (req, res) => {
    try {
        const { member_id, amount, description, reference_no, payment_mode } = req.body;

        const member = await Member.findByPk(member_id);
        if (!member || member.status !== 'active') {
            return res.status(400).json({ error: 'Invalid member' });
        }

        let account = await SavingsAccount.findOne({ where: { member_id } });
        if (!account) {
            const account_no = `SAV-${Date.now()}`;
            account = await SavingsAccount.create({
                member_id,
                account_no,
                balance: 0,
                interest_rate: 0,
                opened_date: new Date(),
                created_by: req.user.id
            });
        }
        if (account.status !== 'active') {
            return res.status(400).json({ error: 'Savings account is not active' });
        }

        const oldBalance = Number(account.balance);
        const newBalance = oldBalance + Number(amount);
        await account.update({ balance: newBalance });

        const savingsTransaction = await SavingsTransaction.create({
            savings_account_id: account.id,
            type: 'deposit',
            amount,
            description: description || 'Savings deposit',
            transaction_date: new Date(),
            reference_no,
            created_by: req.user.id
        });
        const receipt_no = `SAV-RCP-${savingsTransaction.id}`;

        await Transaction.create({
            member_id,
            type: 'savings_deposit',
            amount,
            description: `Savings deposit to account ${account.account_no}`,
            reference: reference_no || receipt_no,
            created_by: req.user.id
        });

        // Milestone alerts
        const milestones = [100000, 500000, 1000000, 5000000, 10000000];
        for (const milestone of milestones) {
            if (oldBalance < milestone && newBalance >= milestone) {
                await SavingsAlert.create({
                    member_id,
                    alert_type: 'milestone',
                    threshold_amount: milestone,
                    triggered_at: new Date()
                });
                break;
            }
        }

        res.json({
            success: true,
            newBalance,
            account_no: account.account_no,
            receipt_no,
            receipt: {
                transaction_type: 'Savings deposit',
                member_name: member.full_name,
                membership_no: member.membership_no,
                account_no: account.account_no,
                amount: Number(amount),
                date: new Date().toLocaleDateString('en-UG'),
                description: description || 'Savings deposit',
                payment_mode: payment_mode || 'cash',
                reference_no: reference_no || ''
            }
        });
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Withdrawal with ID verification and receipt
router.post('/withdraw', authorize(...SAVINGS_WRITE), validate([
    body('member_id').isInt().withMessage('Member ID must be an integer'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('national_id').trim().notEmpty().withMessage('National ID is required'),
    body('description').optional().trim(),
    body('reference_no').optional().trim(),
    body('payment_mode').optional().isIn(['cash', 'bank', 'mmo']).withMessage('Payment mode must be cash, bank, or mmo')
]), async (req, res) => {
    try {
        const { member_id, amount, description, national_id, reference_no, payment_mode } = req.body;

        const member = await Member.findByPk(member_id);
        if (!member || member.status !== 'active') {
            return res.status(400).json({ error: 'Invalid member' });
        }
        if (member.nin !== national_id) {
            return res.status(400).json({ error: 'National ID does not match member record' });
        }

        const account = await SavingsAccount.findOne({ where: { member_id } });
        if (!account || account.status !== 'active') {
            return res.status(400).json({ error: 'Savings account not found or inactive' });
        }
        if (Number(account.balance) < Number(amount)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        const newBalance = Number(account.balance) - Number(amount);
        await account.update({ balance: newBalance });

        await SavingsTransaction.create({
            savings_account_id: account.id,
            type: 'withdrawal',
            amount,
            description: description || 'Savings withdrawal',
            transaction_date: new Date(),
            reference_no,
            created_by: req.user.id
        });

        const receipt_no = `RCP-${Date.now()}`;
        await WithdrawalReceipt.create({
            member_id,
            account_no: account.account_no,
            amount,
            national_id,
            receipt_no,
            withdrawal_date: new Date()
        });

        await Transaction.create({
            member_id,
            type: 'savings_withdrawal',
            amount,
            description: `Savings withdrawal from ${account.account_no}`,
            reference: reference_no || receipt_no,
            created_by: req.user.id
        });

        res.json({
            success: true,
            newBalance,
            account_no: account.account_no,
            receipt_no,
            receipt: {
                transaction_type: 'Savings withdrawal',
                member_name: member.full_name,
                account_no: account.account_no,
                amount,
                date: new Date().toLocaleDateString('en-UG'),
                national_id,
                membership_no: member.membership_no,
                description: description || 'Savings withdrawal',
                payment_mode: payment_mode || 'cash',
                reference_no: reference_no || ''
            }
        });
    } catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;