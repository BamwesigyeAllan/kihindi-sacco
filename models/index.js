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

// ============================================================
// ASSOCIATIONS (all with correct spelling: foreignKey)
// ============================================================

// User ↔ Member
User.hasMany(Member, { foreignKey: 'registered_by' });
Member.belongsTo(User, { foreignKey: 'registered_by' });

// User ↔ SavingsAccount
User.hasMany(SavingsAccount, { foreignKey: 'created_by' });
SavingsAccount.belongsTo(User, { foreignKey: 'created_by' });

// Member ↔ SavingsAccount
Member.hasOne(SavingsAccount, { foreignKey: 'member_id' });
SavingsAccount.belongsTo(Member, { foreignKey: 'member_id' });

// SavingsAccount ↔ SavingsTransaction
SavingsAccount.hasMany(SavingsTransaction, { foreignKey: 'savings_account_id' });
SavingsTransaction.belongsTo(SavingsAccount, { foreignKey: 'savings_account_id' });

// Member ↔ FixedDeposit
Member.hasMany(FixedDeposit, { foreignKey: 'member_id' });
FixedDeposit.belongsTo(Member, { foreignKey: 'member_id' });

// User ↔ FixedDeposit
User.hasMany(FixedDeposit, { foreignKey: 'created_by' });
FixedDeposit.belongsTo(User, { foreignKey: 'created_by' });

// Loan ↔ Member, Product, User
Member.hasMany(Loan, { foreignKey: 'member_id' });
Loan.belongsTo(Member, { foreignKey: 'member_id' });

LoanProduct.hasMany(Loan, { foreignKey: 'product_id' });
Loan.belongsTo(LoanProduct, { foreignKey: 'product_id' });

User.hasMany(Loan, { foreignKey: 'created_by' });
Loan.belongsTo(User, { foreignKey: 'created_by' });

// Loan ↔ LoanRepayment
Loan.hasMany(LoanRepayment, { foreignKey: 'loan_id' });
LoanRepayment.belongsTo(Loan, { foreignKey: 'loan_id' });

// NEW: MemberApplication ↔ User (reviewer)
MemberApplication.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
User.hasMany(MemberApplication, { foreignKey: 'reviewed_by', as: 'reviewed_member_applications' });

// NEW: LoanApplication associations
LoanApplication.belongsTo(Member, { foreignKey: 'member_id' });
Member.hasMany(LoanApplication, { foreignKey: 'member_id' });

LoanApplication.belongsTo(LoanProduct, { foreignKey: 'product_id' });
LoanProduct.hasMany(LoanApplication, { foreignKey: 'product_id' });

LoanApplication.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
User.hasMany(LoanApplication, { foreignKey: 'reviewed_by', as: 'reviewed_loan_applications' });

// General Transaction associations
Member.hasMany(Transaction, { foreignKey: 'member_id' });
Transaction.belongsTo(Member, { foreignKey: 'member_id' });

User.hasMany(Transaction, { foreignKey: 'created_by' });
Transaction.belongsTo(User, { foreignKey: 'created_by' });

// ============================================================
// EXPORT
// ============================================================
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