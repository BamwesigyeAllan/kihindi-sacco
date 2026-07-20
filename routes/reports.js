const express = require('express');
const { FixedDeposit, Member, Loan, LoanProduct, SavingsAccount, Transaction } = require('../models');
const { authenticate } = require('../middleware/auth');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const router = express.Router();

router.get('/dashboard', authenticate, async (req, res) => {
    try {
        const totalMembers = await Member.count({ where: { status: 'active' } });
        const totalDeposits = await FixedDeposit.sum('amount', { where: { status: 'active' } });
        const outstandingLoans = await Loan.sum('balance', { where: { status: 'active' } });
        const totalSavings = await SavingsAccount.sum('balance', { where: { status: 'active' } });

        const recentTransactions = await Transaction.findAll({
            include: [{ model: Member, attributes: ['full_name'] }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({
            totalMembers: totalMembers || 0,
            totalSavings: totalSavings || 0,
            totalDeposits: totalDeposits || 0,
            outstandingLoans: outstandingLoans || 0,
            recentTransactions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/deposits-chart', authenticate, async (req, res) => {
    try {
        const results = await FixedDeposit.findAll({
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('start_date'), '%Y-%m'), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: ['month'],
            order: [[sequelize.literal('month'), 'ASC']],
            where: {
                start_date: { [Op.gte]: new Date(new Date().getFullYear() - 1, 0, 1) }
            },
            raw: true
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/loans-chart', authenticate, async (req, res) => {
    try {
        const results = await Loan.findAll({
            attributes: [
                [sequelize.col('LoanProduct.product_name'), 'product'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            include: [{ model: LoanProduct, attributes: [] }],
            group: ['LoanProduct.product_name'],
            raw: true
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;