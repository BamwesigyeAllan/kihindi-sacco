const express = require('express');
const { Loan, Member, LoanProduct, LoanRepayment, Transaction } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET all loans (with insurance_fee hidden from non-privileged roles)
router.get('/', authenticate, async (req, res) => {
    try {
        const loans = await Loan.findAll({
            include: [
                { model: Member, attributes: ['id', 'full_name', 'phone'] },
                { model: LoanProduct, attributes: ['id', 'product_name', 'interest_rate'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        // If user is not privileged, remove insurance_fee from response
        const privilegedRoles = ['admin', 'chairperson', 'manager', 'loans_officer', 'treasurer'];
        if (!privilegedRoles.includes(req.user.role)) {
            loans.forEach(loan => {
                delete loan.dataValues.insurance_fee;
            });
        }
        
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET loan products
router.get('/products', authenticate, async (req, res) => {
    try {
        const products = await LoanProduct.findAll({ where: { status: 'active' } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST apply for loan (with insurance_fee)
router.post('/', authenticate, authorize('admin', 'chairperson', 'manager', 'loans_officer', 'treasurer', 'officer'), async (req, res) => {
    try {
        const { member_id, product_id, amount, repayment_period_months, insurance_fee } = req.body;

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
            insurance_fee: insurance_fee || 0,
            status: 'pending',
            created_by: req.user.id
        });

        res.status(201).json({ success: true, loan });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT approve/disburse loan
router.put('/:id', authenticate, authorize('admin', 'chairperson', 'manager', 'loans_officer'), async (req, res) => {
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

// POST repay loan
router.post('/:id/repay', authenticate, authorize('admin', 'chairperson', 'manager', 'loans_officer', 'treasurer', 'officer'), async (req, res) => {
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