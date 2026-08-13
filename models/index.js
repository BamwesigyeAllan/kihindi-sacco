const sequelize = require('../config/database');
const User = require('./User');
const Member = require('./Member');
const SavingsAccount = require('./SavingsAccount');
const SavingsTransaction = require('./SavingsTransaction');
const FixedDeposit = require('./FixedDeposit');
const LoanProduct = require('./LoanProduct');
const Loan = require('./Loan');
const LoanRepayment = require('./LoanRepayment');
const Transaction = require('./Transaction');
const MemberApplication = require('./MemberApplication');
const LoanApplication = require('./LoanApplication');

// Existing associations (keep your original ones if any)
// Add new associations only after all models are defined

// New associations
MemberApplication.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

LoanApplication.belongsTo(Member, { foreignKey: 'member_id' });
LoanApplication.belongsTo(LoanProduct, { foreignKey: 'product_id' });
LoanApplication.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// (Optional) If you want reverse associations, add them too
Member.hasMany(LoanApplication, { foreignKey: 'member_id' });
LoanProduct.hasMany(LoanApplication, { foreignKey: 'product_id' });
User.hasMany(LoanApplication, { foreignKey: 'reviewed_by', as: 'reviewed_applications' });

module.exports = {
    sequelize,
    User,
    Member,
    SavingsAccount,
    SavingsTransaction,
    FixedDeposit,
    LoanProduct,
    Loan,
    LoanRepayment,
    Transaction,
    MemberApplication,
    LoanApplication
};