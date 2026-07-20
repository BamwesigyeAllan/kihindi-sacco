const express = require('express');
const { body, param } = require('express-validator');
const { Loan, Member, LoanProduct, LoanRepayment, Transaction } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { member_id } = req.query;
        const where = {};
        if (member_id) where.member_id = member_id;

        const loans = await Loan.findAll({
            where,
            include: [
                { model: Member, attributes: ['id', 'full_name', 'phone'] },
                { model: LoanProduct, attributes: ['id', 'product_name', 'interest_rate'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/products', authenticate, async (req, res) => {
    try {
        const products = await LoanProduct.findAll({ where: { status: 'active' } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/products/:id', authenticate, validate([
    param('id').isInt().withMessage('Product ID must be an integer')
]), async (req, res) => {
    try {
        const product = await LoanProduct.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Loan product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/products/:id', authenticate, authorize('admin', 'manager'), validate([
    param('id').isInt().withMessage('Product ID must be an integer')
]), async (req, res) => {
    try {
        const product = await LoanProduct.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Loan product not found' });
        await product.destroy();
        res.json({ success: true, message: 'Loan product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/products', authenticate, authorize('admin', 'manager'), validate([
    body('product_name').trim().notEmpty().withMessage('Product name is required'),
    body('interest_rate').isFloat({ gt: 0 }).withMessage('Interest rate must be a positive number'),
    body('rate_type').isIn(['per_annum', 'per_month']).withMessage('Rate type must be per_annum or per_month'),
    body('min_amount').isFloat({ gt: 0 }).withMessage('Minimum amount must be a positive number'),
    body('max_amount').isFloat({ gt: 0 }).withMessage('Maximum amount must be a positive number'),
    body('max_tenor_months').isInt({ gt: 0 }).withMessage('Maximum tenor must be a positive integer')
]), async (req, res) => {
    try {
        const { product_name, description, interest_rate, rate_type, min_amount, max_amount, max_tenor_months } = req.body;
        const existing = await LoanProduct.findOne({ where: { product_name } });
        if (existing) return res.status(409).json({ error: 'Loan product already exists' });

        const product = await LoanProduct.create({
            product_name,
            description,
            interest_rate,
            rate_type,
            min_amount,
            max_amount,
            max_tenor_months,
            status: 'active'
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/products/:id', authenticate, authorize('admin', 'manager'), validate([
    param('id').isInt().withMessage('Product ID must be an integer'),
    body('product_name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('interest_rate').optional().isFloat({ gt: 0 }).withMessage('Interest rate must be a positive number'),
    body('rate_type').optional().isIn(['per_annum', 'per_month']).withMessage('Rate type must be per_annum or per_month'),
    body('min_amount').optional().isFloat({ gt: 0 }).withMessage('Minimum amount must be a positive number'),
    body('max_amount').optional().isFloat({ gt: 0 }).withMessage('Maximum amount must be a positive number'),
    body('max_tenor_months').optional().isInt({ gt: 0 }).withMessage('Maximum tenor must be a positive integer'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
]), async (req, res) => {
    try {
        const product = await LoanProduct.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Loan product not found' });

        await product.update(req.body);
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, authorize('admin', 'manager'), validate([
    body('member_id').isInt().withMessage('Member ID is required'),
    body('product_id').isInt().withMessage('Loan product ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('repayment_period_months').isInt({ gt: 0 }).withMessage('Repayment period must be a positive integer')
]), async (req, res) => {
    try {
        const { member_id, product_id, amount, repayment_period_months } = req.body;

        const product = await LoanProduct.findByPk(product_id);
        if (!product) return res.status(400).json({ error: 'Invalid loan product' });

        if (amount < product.min_amount || amount > product.max_amount) {
            return res.status(400).json({ error: 'Amount outside product limits' });
        }
        if (repayment_period_months > product.max_tenor_months) {
            return res.status(400).json({ error: 'Tenor exceeds maximum allowed' });
        }

        const member = await Member.findByPk(member_id);
        if (!member || member.status !== 'active') {
            return res.status(400).json({ error: 'Invalid member' });
        }

        const loan_id = `L-${Date.now()}`;
        const loan = await Loan.create({
            loan_id,
            member_id,
            product_id,
            amount,
            interest_rate: product.interest_rate,
            repayment_period_months,
            balance: amount,
            status: 'pending',
            created_by: req.user.id
        });

        res.status(201).json({ success: true, loan });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', authenticate, authorize('admin', 'manager'), validate([
    param('id').isInt().withMessage('Loan ID must be an integer'),
    body('status').optional().isIn(['pending', 'active', 'completed', 'defaulted']).withMessage('Invalid loan status'),
    body('disbursement_date').optional().isISO8601().withMessage('Disbursement date must be a valid date')
]), async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id, {
            include: [{ model: Member }]
        });
        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        const { status, disbursement_date } = req.body;
        await loan.update({
            status,
            disbursement_date: status === 'active' ? new Date(disbursement_date || Date.now()) : null,
            due_date: status === 'active' ? new Date(Date.now() + loan.repayment_period_months * 30 * 24 * 60 * 60 * 1000) : null
        });

        if (status === 'active') {
            await Transaction.create({
                member_id: loan.member_id,
                type: 'loan_disbursement',
                amount: loan.amount,
                description: `Loan disbursed: ${loan.loan_id}`,
                reference: loan.loan_id,
                created_by: req.user.id
            });
        }

        res.json({ success: true, loan });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/repay', authenticate, authorize('admin', 'manager', 'officer'), validate([
    param('id').isInt().withMessage('Loan ID must be an integer'),
    body('amount_paid').isFloat({ gt: 0 }).withMessage('Amount paid must be greater than 0'),
    body('payment_date').optional().isISO8601().withMessage('Payment date must be a valid date'),
    body('payment_mode').optional().isIn(['cash', 'bank', 'mmo']).withMessage('Payment mode must be cash, bank, or mmo')
]), async (req, res) => {
    try {
        const { amount_paid, payment_date, payment_mode, reference_no } = req.body;
        const loan = await Loan.findByPk(req.params.id, {
            include: [{ model: Member }]
        });
        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        if (loan.status === 'completed' || loan.status === 'defaulted') {
            return res.status(400).json({ error: 'Loan is already closed' });
        }

        const remaining = Number(loan.balance) - Number(amount_paid);
        const newStatus = remaining <= 0 ? 'completed' : 'active';

        await LoanRepayment.create({
            loan_id: loan.id,
            amount_paid,
            payment_date: new Date(payment_date || Date.now()),
            payment_mode: payment_mode || 'cash',
            reference_no,
            created_by: req.user.id
        });

        await loan.update({ balance: Math.max(0, remaining), status: newStatus });

        await Transaction.create({
            member_id: loan.member_id,
            type: 'loan_repayment',
            amount: amount_paid,
            description: `Repayment for loan ${loan.loan_id}`,
            reference: loan.loan_id,
            created_by: req.user.id
        });

        res.json({ success: true, loan, remaining });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;