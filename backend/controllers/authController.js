const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User, UserProfile } = require('../models');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const axios = require('axios');

const sendOTPEmail = async (email, otp) => {
    // For development convenience, always log the OTP to the console
    console.log(`\n=========================================`);
    console.log(`[DEV] OTP for ${email} is: ${otp}`);
    console.log(`=========================================\n`);

    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_USER || 'nutriscanwebapp@gmail.com';

    if (!brevoApiKey) {
        console.log('BREVO_API_KEY not configured in .env. Skipping actual email delivery.');
        return; // Skip sending email if not configured
    }

    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: 'NutriScan', email: senderEmail },
            to: [{ email: email }],
            subject: 'NutriScan - Email Verification OTP',
            htmlContent: `<html><body><p>Your OTP for NutriScan email verification is: <strong>${otp}</strong></p><p>It is valid for 10 minutes.</p></body></html>`
        }, {
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            }
        });
        console.log(`OTP email sent successfully to ${email} via Brevo`);
    } catch (error) {
        console.error('Error sending email via Brevo:', error.response ? error.response.data : error.message);
        throw new Error('Failed to send OTP email via Brevo API.');
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check existing user
        let existingUser = await User.findOne({ where: { email } });
        
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({ message: 'User already exists and is verified' });
            }
            // If user exists but is not verified, we can just resend OTP and update password
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

        let user;
        if (existingUser) {
            existingUser.password = hashedPassword;
            existingUser.name = name;
            existingUser.otp = otp;
            existingUser.otpExpires = otpExpires;
            await existingUser.save();
            user = existingUser;
        } else {
            // Create user
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpires,
                isVerified: false
            });

            // Initialize empty profile
            await UserProfile.create({ userId: user.id });
        }

        // Send OTP email
        try {
            await sendOTPEmail(email, otp);
            res.status(201).json({ 
                message: 'User registered successfully. Please check your email for OTP.', 
                userId: user.id 
            });
        } catch (emailError) {
            console.error('Email sending failed, but user was created:', emailError);
            // In development, we still want to succeed because OTP is logged to console
            res.status(201).json({ 
                message: 'User registered. Email delivery failed, but you can find your OTP in the server logs (Dev Mode).', 
                userId: user.id,
                emailError: true
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        console.error('OTP Verification error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        try {
            await sendOTPEmail(email, otp);
            res.json({ message: 'OTP resent successfully. Please check your email.' });
        } catch (emailError) {
            console.error('Email resending failed:', emailError);
            res.json({ 
                message: 'OTP regenerated. Email delivery failed, but you can find your OTP in the server logs (Dev Mode).',
                emailError: true 
            });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email first', notVerified: true });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'supersecretjwtkey',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Manually delete related records first to ensure no foreign key constraint errors
        const { ProductScanHistory, SavedProduct, ProductSubmission, NutritionAnalysisResult, UserFeedback } = require('../models');
        
        await UserProfile.destroy({ where: { userId } });
        await ProductScanHistory.destroy({ where: { userId } });
        await SavedProduct.destroy({ where: { userId } });
        await ProductSubmission.destroy({ where: { userId } });
        await NutritionAnalysisResult.destroy({ where: { userId } });
        await UserFeedback.destroy({ where: { userId } });

        // Finally delete the user
        await user.destroy();

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
