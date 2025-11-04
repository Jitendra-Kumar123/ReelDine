const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {
    try {
        const { fullName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await userModel.create({
            fullName,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, type: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, type: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
}

function logoutUser(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({
        success: true,
        message: "User logged out successfully"
    });
}


async function registerFoodPartner(req, res) {
    try {
        const { name, email, password, phone, address, contactName } = req.body;

        // Check if food partner already exists
        const existingPartner = await foodPartnerModel.findOne({ email });
        if (existingPartner) {
            return res.status(400).json({
                success: false,
                message: "Food partner account with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create food partner
        const foodPartner = await foodPartnerModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            contactName
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: foodPartner._id, type: 'foodPartner' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            success: true,
            message: "Food partner registered successfully",
            foodPartner: {
                _id: foodPartner._id,
                email: foodPartner.email,
                name: foodPartner.name,
                address: foodPartner.address,
                contactName: foodPartner.contactName,
                phone: foodPartner.phone
            }
        });
    } catch (error) {
        console.error('Food partner registration error:', error);
        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
}

async function loginFoodPartner(req, res) {
    try {
        const { email, password } = req.body;

        // Find food partner
        const foodPartner = await foodPartnerModel.findOne({ email });
        if (!foodPartner) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: foodPartner._id, type: 'foodPartner' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Food partner logged in successfully",
            foodPartner: {
                _id: foodPartner._id,
                email: foodPartner.email,
                name: foodPartner.name,
                address: foodPartner.address,
                contactName: foodPartner.contactName,
                phone: foodPartner.phone
            }
        });
    } catch (error) {
        console.error('Food partner login error:', error);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
}

function logoutFoodPartner(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({
        success: true,
        message: "Food partner logged out successfully"
    });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner
}