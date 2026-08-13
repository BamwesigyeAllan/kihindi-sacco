const { sequelize, User, LoanProduct } = require('../models');
const bcrypt = require('bcrypt');

async function resetSeed() {
  try {
    await sequelize.sync({ force: true });

    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password_hash: adminPassword, role: 'admin' });

    // Create a user for each role
    const roles = ['admin', 'chairperson', 'manager', 'loans_officer', 'officer', 'treasurer'];
    const defaultPassHash = await bcrypt.hash('password123', 10);

    for (const role of roles) {
      const username = role;
      // skip creating duplicate admin (already created above)
      if (username === 'admin') continue;
      await User.create({ username, password_hash: defaultPassHash, role });
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
      await LoanProduct.create(product);
    }

    console.log('✅ Database reset and seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset seed failed:', error);
    process.exit(1);
  }
}

resetSeed();