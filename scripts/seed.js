const { sequelize, User, LoanProduct } = require('../models');

const defaultUsers = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'chairperson', password: 'chairman123', role: 'chairperson' },
  { username: 'manager', password: 'manager123', role: 'manager' },
  { username: 'loans_officer', password: 'loans123', role: 'loans_officer' },
  { username: 'officer', password: 'cashier123', role: 'officer' },
  { username: 'treasurer', password: 'treasurer123', role: 'treasurer' }
];

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

async function seed() {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Refusing to create development seed accounts in production.');
    }
    await sequelize.sync();

    for (const userData of defaultUsers) {
      const hashed = await User.hashPassword(userData.password);
      await User.findOrCreate({
        where: { username: userData.username },
        defaults: { username: userData.username, password_hash: hashed, role: userData.role }
      });
    }

    for (const product of loanProducts) {
      await LoanProduct.findOrCreate({ where: { product_name: product.product_name }, defaults: product });
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
