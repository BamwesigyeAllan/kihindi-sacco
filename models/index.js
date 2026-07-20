const sequelize = require('../config/database');
const User = require('./user');
const Member = require('./Member');
const SavingsAccount = require('./SavingsAccount');
const SavingsTransaction = require('./SavingsTransaction');
const SavingsAlert = require('./SavingsAlert');
const WithdrawalReceipt = require('./WithdrawalReceipt');
const FixedDeposit = require('./FixedDeposit');
const LoanProduct = require('./LoanProduct');
const Loan = require('./Loan');
const LoanRepayment = require('./LoanRepayment');
const Transaction = require('./Transaction');

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

// Member ↔ SavingsAlert
Member.hasMany(SavingsAlert, { foreignKey: 'member_id' });
SavingsAlert.belongsTo(Member, { foreignKey: 'member_id' });

// Member ↔ WithdrawalReceipt
Member.hasMany(WithdrawalReceipt, { foreignKey: 'member_id' });
WithdrawalReceipt.belongsTo(Member, { foreignKey: 'member_id' });

// User ↔ FixedDeposit
User.hasMany(FixedDeposit, { foreignKey: 'created_by' });
FixedDeposit.belongsTo(User, { foreignKey: 'created_by' });

// Member ↔ FixedDeposit
Member.hasMany(FixedDeposit, { foreignKey: 'member_id' });
FixedDeposit.belongsTo(Member, { foreignKey: 'member_id' });

// User ↔ Loan
User.hasMany(Loan, { foreignKey: 'created_by' });
Loan.belongsTo(User, { foreignKey: 'created_by' });

// Member ↔ Loan
Member.hasMany(Loan, { foreignKey: 'member_id' });
Loan.belongsTo(Member, { foreignKey: 'member_id' });

// Loan ↔ LoanProduct
Loan.belongsTo(LoanProduct, { foreignKey: 'product_id' });
LoanProduct.hasMany(Loan, { foreignKey: 'product_id' });

// Loan ↔ LoanRepayment
Loan.hasMany(LoanRepayment, { foreignKey: 'loan_id' });
LoanRepayment.belongsTo(Loan, { foreignKey: 'loan_id' });

// User ↔ LoanRepayment
User.hasMany(LoanRepayment, { foreignKey: 'created_by' });
LoanRepayment.belongsTo(User, { foreignKey: 'created_by' });

// Member ↔ Transaction
Member.hasMany(Transaction, { foreignKey: 'member_id' });
Transaction.belongsTo(Member, { foreignKey: 'member_id' });

// User ↔ Transaction
User.hasMany(Transaction, { foreignKey: 'created_by' });
Transaction.belongsTo(User, { foreignKey: 'created_by' });

module.exports = {
    sequelize,
    User,
    Member,
    SavingsAccount,
    SavingsTransaction,
    SavingsAlert,
    WithdrawalReceipt,
    FixedDeposit,
    LoanProduct,
    Loan,
    LoanRepayment,
    Transaction
};