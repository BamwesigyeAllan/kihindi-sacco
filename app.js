const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { sequelize, User, LoanProduct } = require('./models');
const { authenticate } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const savingsRoutes = require('./routes/savings');
const depositRoutes = require('./routes/deposits');
const loanRoutes = require('./routes/loans');
const reportRoutes = require('./routes/reports');
const memberApplicationRoutes = require('./routes/memberApplications');
const loanApplicationRoutes = require('./routes/loanApplications');
const userRoutes = require('./routes/users');

app.use('/auth', authRoutes);
app.use('/members', authenticate, memberRoutes);
app.use('/savings', authenticate, savingsRoutes);
app.use('/deposits', authenticate, depositRoutes);
app.use('/loans', authenticate, loanRoutes);
app.use('/reports', authenticate, reportRoutes);
app.use('/member-applications', authenticate, memberApplicationRoutes);
app.use('/loan-applications', authenticate, loanApplicationRoutes);
app.use('/users', authenticate, userRoutes);

app.get('/health', (req, res) => res.json({
    status: 'OK',
    timestamp: new Date(),
    dialect: config.database.dialect
}));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = config.port;

const defaultUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'chairman', password: 'chairman123', role: 'chairman' },
    { username: 'loan_officer', password: 'loans123', role: 'loan_officer' },
    { username: 'cashier', password: 'cashier123', role: 'cashier' },
    { username: 'treasurer', password: 'treasurer123', role: 'treasurer' }
];

const defaultProducts = [
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

async function bootstrap() {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log(`Database synced (${config.database.dialect})`);

    for (const userData of defaultUsers) {
        const existing = await User.findOne({ where: { username: userData.username } });
        if (!existing) {
            const hashed = await User.hashPassword(userData.password);
            await User.create({
                username: userData.username,
                password_hash: hashed,
                role: userData.role
            });
            console.log(`Default user created: ${userData.username}`);
        }
    }

    for (const product of defaultProducts) {
        await LoanProduct.findOrCreate({
            where: { product_name: product.product_name },
            defaults: product
        });
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Login: admin / admin123');
    });
}

bootstrap().catch((err) => {
    console.error('Database connection failed:', err.message);
    console.error('Set DB_DIALECT=sqlite for local file storage, or configure MySQL/TiDB in .env');
    process.exit(1);
});
