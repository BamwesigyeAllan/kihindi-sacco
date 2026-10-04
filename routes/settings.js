const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const { STAFF_MANAGE } = require('../utils/roles');

const router = express.Router();
const logoDir = path.join(__dirname, '..', 'uploads', 'branding');
const allowedTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
};

fs.mkdirSync(logoDir, { recursive: true });

function getLogo() {
    const filename = fs.readdirSync(logoDir)
        .filter((entry) => /^sacco-logo-\d+\.(png|jpe?g|webp)$/i.test(entry))
        .sort((a, b) => b.localeCompare(a))[0];
    return filename ? `/uploads/branding/${filename}` : '/icons/icon.svg';
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => callback(null, logoDir),
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `sacco-logo-${Date.now()}${extension}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (allowedTypes[extension] !== file.mimetype) {
            return callback(new Error('Choose a PNG, JPG, JPEG, or WebP image.'));
        }
        callback(null, true);
    }
});

router.get('/logo', (req, res) => {
    try {
        res.json({ logoUrl: getLogo() });
    } catch (error) {
        res.status(500).json({ error: 'Unable to load SACCO logo' });
    }
});

router.get('/manifest.webmanifest', (req, res) => {
    try {
        const logoUrl = getLogo();
        const extension = path.extname(logoUrl).toLowerCase();
        const type = allowedTypes[extension] || 'image/svg+xml';
        res.set('Cache-Control', 'no-cache');
        res.json({
            name: "Mbarara City Kihindi Boda Rider's SACCO",
            short_name: 'Kihindi SACCO',
            description: "Mbarara City Kihindi Boda Rider's SACCO management system",
            start_url: '/',
            display: 'standalone',
            background_color: '#fffdf5',
            theme_color: '#d5a20a',
            orientation: 'portrait',
            icons: [{ src: logoUrl, sizes: 'any', type, purpose: 'any' }]
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to load app manifest' });
    }
});

router.post('/logo', authenticate, authorize(...STAFF_MANAGE), (req, res) => {
    upload.single('logo')(req, res, (error) => {
        if (error) return res.status(400).json({ error: error.message });
        if (!req.file) return res.status(400).json({ error: 'Select a logo image to upload' });

        try {
            for (const filename of fs.readdirSync(logoDir)) {
                if (filename !== req.file.filename && /^sacco-logo-\d+\.(png|jpe?g|webp)$/i.test(filename)) {
                    fs.unlinkSync(path.join(logoDir, filename));
                }
            }
            res.json({ success: true, logoUrl: `/uploads/branding/${req.file.filename}` });
        } catch (saveError) {
            fs.unlinkSync(req.file.path);
            res.status(500).json({ error: 'Unable to save SACCO logo' });
        }
    });
});

module.exports = router;