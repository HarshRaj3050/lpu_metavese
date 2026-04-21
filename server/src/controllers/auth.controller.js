const userModel = require('../models/user.model');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sendEmail = require('../services/email.service');
const emailService = require("../utils/otp.utils");
const otpModel = require('../models/otp.model');


async function userRegister(req, res) {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const isUserExist = await userModel.findOne({
        $or: [
            { email }
        ]
    });

    if (isUserExist) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const hashPass = bcrypt.hashSync(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashPass
    });

    const otp = emailService.generateOtp();
    const html = emailService.getOtpHtml(otp);

    const otpHash = bcrypt.hashSync(otp, 10);
    await otpModel.create({
        email,
        user: user._id,
        otpHash
    });

    await sendEmail(email, 'OTP Verification', `Your OTP Code is ${otp}`, html);

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });
}


async function verifyEmail(req, res) {
    const { otp, email } = req.body;

    if (!otp || !email) {
        return res.status(400).json({ message: 'OTP and email are required' });
    }

    const otpDoc = await otpModel.findOne({ email }).sort({ createdAt: -1 });

    if (!otpDoc) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const match = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!match) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user, { verified: true }, { new: true });

    await otpModel.deleteMany({ user: otpDoc.user });

    const userId = user._id;
    

    return res.status(200).json({
        message: 'Email verified successfully',
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified
        },
    });
}


async function userLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
        return res.status(403).json({ message: 'Email not verified' });
    }

    const token = jwt.sign(
        { id: user?._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: false
    });
    
    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

async function logoutUser(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: "user logged out successfully" })
}

module.exports = { userRegister, verifyEmail, userLogin, logoutUser }