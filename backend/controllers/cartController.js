import userModel from "../models/userModel.js";

// Add products to user cart
const addToCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { itemId, size } = req.body;

        if (!itemId || !size) {
            return res.status(400).json({ success: false, message: "Item ID and size are required." });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let cartData = userData.cartData || {};

        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
        } else {
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.json({ success: true, message: "Added To Cart" });
    } catch (error) {
        console.error('addToCart error:', error);
        return res.status(500).json({ success: false, message: "Failed to add item to cart." });
    }
};

// Update user cart
const updateCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { itemId, size, quantity } = req.body;

        if (!itemId || !size || quantity === undefined) {
            return res.status(400).json({ success: false, message: "Item ID, size, and quantity are required." });
        }

        const parsedQuantity = parseInt(quantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity < 0 || parsedQuantity > 100) {
            return res.status(400).json({ success: false, message: "Quantity must be a valid number between 0 and 100." });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let cartData = userData.cartData || {};

        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        if (parsedQuantity === 0) {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        } else {
            cartData[itemId][size] = parsedQuantity;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        return res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        console.error('updateCart error:', error);
        return res.status(500).json({ success: false, message: "Failed to update cart." });
    }
};

// Get user cart data
const getUserCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const cartData = userData.cartData || {};
        return res.json({ success: true, cartData });
    } catch (error) {
        console.error('getUserCart error:', error);
        return res.status(500).json({ success: false, message: "Failed to retrieve cart data." });
    }
};

export { addToCart, updateCart, getUserCart };