const express = require('express');
const JavaScriptObfuscator = require('javascript-obfuscator');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));

// admin.html সার্ভ করো
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Secure API এন্ডপয়েন্ট
app.post('/api/secure', (req, res) => {
    try {
        const { code, level } = req.body;

        // ভ্যালিডেশন
        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'No code provided'
            });
        }

        // ⚠️ base options বাইরে ডিক্লেয়ার (গুরুত্বপূর্ণ)
        let options = {
            compact: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayThreshold: 0.75,
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
            selfDefending: false
        };

        // High level হলে অতিরিক্ত অপশন
        if (level === 'high') {
            options.controlFlowFlattening = true;
            options.controlFlowFlatteningThreshold = 0.75;
            options.deadCodeInjection = true;
            options.deadCodeInjectionThreshold = 0.4;
            options.selfDefending = true;
        }

        // ⚠️ await নেই — মেথড সিনক্রোনাস
        const result = JavaScriptObfuscator.obfuscate(code, options);

        res.json({
            success: true,
            code: result.getObfuscatedCode()
        });

    } catch (err) {
        // Render লগে এরর প্রিন্ট
        console.error('=== OBFUSCATION ERROR ===');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);

        res.status(500).json({
            success: false,
            error: 'Obfuscation failed',
            detail: err.message
        });
    }
});

// Render-এর জন্য PORT env variable
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});