const { Member, FixedDeposit } = require('../models');

async function generateMembershipNo() {
    const year = new Date().getFullYear();
    const count = await Member.count() + 1;
    return `M-${year}-${String(count).padStart(4, '0')}`;
}

async function generateDepositAccountNo(startDate) {
    const year = startDate.getFullYear();
    const count = await FixedDeposit.count() + 1;
    return `KFD/${year}/${String(count).padStart(3, '0')}`;
}

function formatCurrency(amount) {
    return `UGX ${Number(amount).toLocaleString()}`;
}

module.exports = { generateMembershipNo, generateDepositAccountNo, formatCurrency };