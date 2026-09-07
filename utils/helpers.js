async function generateMembershipNo() {
    const { Member } = require('../models');
    const year = new Date().getFullYear();
    const count = await Member.count() + 1;
    return `M-${year}-${String(count).padStart(4, '0')}`;
}

async function generateDepositAccountNo(startDate) {
    const { FixedDeposit } = require('../models');
    const year = startDate.getFullYear();
    const count = await FixedDeposit.count() + 1;
    return `KFD/${year}/${String(count).padStart(3, '0')}`;
}

function formatCurrency(amount) {
    return `UGX ${Number(amount).toLocaleString()}`;
}

function isTruthy(value) {
    if (value === true || value === 1) return true;
    const normalized = String(value || '').trim().toLowerCase();
    return ['true', 'on', '1', 'yes'].includes(normalized);
}

module.exports = { generateMembershipNo, generateDepositAccountNo, formatCurrency, isTruthy };
