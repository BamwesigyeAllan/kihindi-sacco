const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize, User } = require('./models');
const { authenticate } = require('./middleware/auth');

dotenv.config();

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

const PORT = process.env.PORT || 5000;

// ============================================================
// SYNC DATABASE & CREATE DEFAULT USERS
// ============================================================
sequelize.sync().then(async () => {
    console.log('✅ Database synced');

    const defaultUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'chairperson', password: 'chairperson123', role: 'chairperson' },
        { username: 'treasurer', password: 'treasurer123', role: 'treasurer' },
        { username: 'loans_officer', password: 'loans123', role: 'loans_officer' }
    ];

    for (const userData of defaultUsers) {
        const existing = await User.findOne({ where: { username: userData.username } });
        if (!existing) {
            const hashed = await User.hashPassword(userData.password);
            await User.create({
                username: userData.username,
                password_hash: hashed,
                role: userData.role
            });
            console.log(`✅ Default user created: ${userData.username} (role: ${userData.role})`);
        }
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
});