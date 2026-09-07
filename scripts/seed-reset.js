const { sequelize, User, LoanProduct } = require('../models');

async function resetSeed() {
  try {
    await sequelize.sync({ force: true });

    const users = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'chairman', password: 'chairman123', role: 'chairman' },
      { username: 'loan_officer', password: 'loans123', role: 'loan_officer' },
      { username: 'cashier', password: 'cashier123', role: 'cashier' },
      { username: 'treasurer', password: 'treasurer123', role: 'treasurer' }
    ];

    for (const userData of users) {
      const hashed = await User.hashPassword(userData.password);
      await User.create({ username: userData.username, password_hash: hashed, role: userData.role });
    }

    const loanProducts = [
      {
        product_name: 'Salary Advance',
        description: 'Short-term advance for salaried members',
        interest_rate: 5.0,
        rate_type: 'per_annum',
        min_amount: 100000,
        max_amount: 2000000,
        max_tenor_months: 12,
        status: 'active'
      },
      {
        product_name: 'Agriculture Loan',
        description: 'Loan for agricultural input and equipment',
        interest_rate: 8.0,
        rate_type: 'per_annum',
        min_amount: 500000,
        max_amount: 10000000,
        max_tenor_months: 24,
        status: 'active'
      },
      {
        product_name: 'Emergency Loan',
        description: 'Quick loan for urgent member needs',
        interest_rate: 6.0,
        rate_type: 'per_annum',
        min_amount: 50000,
        max_amount: 1000000,
        max_tenor_months: 6,
        status: 'active'
      }
    ];

    for (const product of loanProducts) {
      await LoanProduct.create(product);
    }

    console.log('Database reset and seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Reset seed failed:', error);
    process.exit(1);
  }
}

resetSeed();
