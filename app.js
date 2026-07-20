const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { sequelize, User } = require('./models');
const { authenticate } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const savingsRoutes = require('./routes/savings');
const depositRoutes = require('./routes/deposits');
const loanRoutes = require('./routes/loans');
const reportRoutes = require('./routes/reports');

app.use('/auth', authRoutes);
app.use('/members', authenticate, memberRoutes);
app.use('/savings', authenticate, savingsRoutes);
app.use('/deposits', authenticate, depositRoutes);
app.use('/loans', authenticate, loanRoutes);
app.use('/reports', authenticate, reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

const PORT = parseInt(process.env.PORT, 10) || config.port;

sequelize.sync({ alter: process.env.NODE_ENV !== 'production' }).then(async () => {
    console.log('✅ Database synced');
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
        const hashed = await User.hashPassword('password');
        await User.create({ username: 'admin', password_hash: hashed, role: 'admin' });
        console.log('✅ Default admin created (admin/password)');
    }
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
});