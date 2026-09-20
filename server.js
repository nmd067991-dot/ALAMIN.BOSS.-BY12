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
        
        // level অনুযায়ী obfuscation options
        let options = {
            compact: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayThreshold: 0.75,
        };
        
        if (level === 'high') {
            options.controlFlowFlattening = true;
            options.controlFlowFlatteningThreshold = 0.75;
            options.deadCodeInjection = true;
            options.deadCodeInjectionThreshold = 0.4;
            options.selfDefending = true;
        }
        
        const result = JavaScriptObfuscator.obfuscate(code, options);
        
        res.json({
            success: true,
            code: result.getObfuscatedCode()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Obfuscation failed'
        });
    }
});

// Render-এর জন্য PORT environment variable ব্যবহার করো
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});