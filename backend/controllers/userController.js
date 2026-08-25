import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const normalizedEmail = validator.normalizeEmail(email);
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = createToken(user._id);
            return res.json({ success: true, token });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
};

// Route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address" });
        }

        const normalizedEmail = validator.normalizeEmail(email);

        const exists = await userModel.findOne({ email: normalizedEmail });
        if (exists) {
            return res.status(409).json({ success: false, message: "User already exists with this email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: trimmedName,
            email: normalizedEmail,
            password: hashedPassword,
            cartData: {}
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        return res.status(201).json({ success: true, token });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ success: false, message: 'An error occurred during registration.' });
    }
};

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { role: 'admin', email: process.env.ADMIN_EMAIL },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.json({ success: true, token });
        } else {
            return res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ success: false, message: 'An error occurred during admin login.' });
    }
};

export { loginUser, registerUser, adminLogin };