const bcrypt = require('bcrypt');
const { sequelize, User, Member, LoanProduct } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ alter: true });

    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.findOrCreate({
      where: { username: 'admin' },
      defaults: { username: 'admin', password_hash: adminPassword, role: 'admin' }
    });

    // Ensure a user exists for each role
    const roles = ['admin', 'chairperson', 'manager', 'loans_officer', 'officer', 'treasurer'];
    const defaultPassHash = await bcrypt.hash('password123', 10);

    for (const role of roles) {
      const username = role;
      await User.findOrCreate({
        where: { username },
        defaults: { username, password_hash: defaultPassHash, role }
      });
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
      }
    ];

    for (const product of loanProducts) {
      await LoanProduct.findOrCreate({ where: { product_name: product.product_name }, defaults: product });
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();