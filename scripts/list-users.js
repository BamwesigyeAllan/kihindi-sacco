const { sequelize, User } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({ attributes: ['id', 'username', 'role', 'createdAt'] });
    console.log(JSON.stringify(users.map(u => u.get({ plain: true })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err);
    process.exit(1);
  }
})();