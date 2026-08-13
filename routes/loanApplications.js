const express = require('express');
const router = express.Router();
const { LoanApplication, Member, LoanProduct, User, Loan } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// GET all loan applications
router.get('/', authenticate, async (req, res) => {
	try {
		const apps = await LoanApplication.findAll({
			include: [
				{ model: Member, attributes: ['id', 'full_name'] },
				{ model: LoanProduct, attributes: ['id', 'product_name'] },
				{ model: User, as: 'reviewer', attributes: ['id', 'username'] }
			],
			order: [['createdAt', 'DESC']]
		});
		res.json(apps);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// POST – submit new loan application
router.post('/', authenticate, async (req, res) => {
	try {
		const { member_id, product_id, amount, repayment_period_months, insurance_fee } = req.body;
		const member = await Member.findByPk(member_id);
		if (!member || member.status !== 'active') {
			return res.status(400).json({ error: 'Invalid member' });
		}
		const product = await LoanProduct.findByPk(product_id);
		if (!product || product.status !== 'active') {
			return res.status(400).json({ error: 'Invalid loan product' });
		}
		const app = await LoanApplication.create({
			member_id,
			product_id,
			amount,
			repayment_period_months,
			insurance_fee: insurance_fee || 0,
			status: 'pending'
		});
		res.status(201).json({ success: true, application: app });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// PUT – review (approve/reject)
router.put('/:id', authenticate, authorize('admin', 'chairman', 'loan_officer'), async (req, res) => {
	try {
		const { status, notes } = req.body;
		const app = await LoanApplication.findByPk(req.params.id, {
			include: [{ model: Member }, { model: LoanProduct }]
		});
		if (!app) return res.status(404).json({ error: 'Application not found' });

		await app.update({
			status,
			reviewed_by: req.user.id,
			reviewed_at: new Date(),
			notes
		});

		if (status === 'approved') {
			const loan_id = `L-${Date.now()}`;
			await Loan.create({
				loan_id,
				member_id: app.member_id,
				product_id: app.product_id,
				amount: app.amount,
				interest_rate: app.LoanProduct ? app.LoanProduct.interest_rate : null,
				repayment_period_months: app.repayment_period_months,
				balance: app.amount,
				insurance_fee: app.insurance_fee,
				status: 'pending',
				created_by: req.user.id
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
		const app = await LoanApplication.findByPk(req.params.id);
		if (!app) return res.status(404).json({ error: 'Application not found' });
		await app.destroy();
		res.json({ success: true });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
