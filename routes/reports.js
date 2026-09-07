const express = require('express');
const { FixedDeposit, Member, Loan, LoanProduct, SavingsAccount, Transaction } = require('../models');
const config = require('../config');
const { Op, fn, col, literal } = require('sequelize');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
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

router.get('/deposits-chart', async (req, res) => {
    try {
        const monthExpr = config.database.dialect === 'sqlite'
            ? fn('strftime', '%Y-%m', col('start_date'))
            : fn('DATE_FORMAT', col('start_date'), '%Y-%m');

        const results = await FixedDeposit.findAll({
            attributes: [
                [monthExpr, 'month'],
                [fn('SUM', col('amount')), 'total']
            ],
            group: ['month'],
            order: [[literal('month'), 'ASC']],
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

router.get('/loans-chart', async (req, res) => {
    try {
        const results = await Loan.findAll({
            attributes: [
                [col('LoanProduct.product_name'), 'product'],
                [fn('SUM', col('amount')), 'total']
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
