import crypto from 'crypto';
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe';
import razorpay from 'razorpay';

// Global constants
const currency = 'inr';
const deliveryCharge = 10;

// Gateway initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// Helper: Calculate verified server-side order total and line items from database
const calculateVerifiedOrder = async (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("No items provided for the order.");
    }

    const itemIds = items.map(item => item._id);
    const dbProducts = await productModel.find({ _id: { $in: itemIds } });
    const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
        const dbProduct = productMap.get(item._id?.toString());
        if (!dbProduct) {
            throw new Error(`Product not found or unavailable: ${item.name || item._id}`);
        }

        const quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity for item: ${dbProduct.name}`);
        }

        const itemSubtotal = dbProduct.price * quantity;
        calculatedSubtotal += itemSubtotal;

        verifiedItems.push({
            _id: dbProduct._id,
            name: dbProduct.name,
            price: dbProduct.price,
            size: item.size || 'M',
            quantity: quantity,
            images: dbProduct.images
        });
    }

    const totalAmount = calculatedSubtotal + deliveryCharge;
    return { verifiedItems, totalAmount, calculatedSubtotal };
};

// 1. Placing order using COD
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { items, address } = req.body;

        if (!address) {
            return res.status(400).json({ success: false, message: "Delivery address is required." });
        }

        const { verifiedItems, totalAmount } = await calculateVerifiedOrder(items);

        const orderData = {
            userId,
            items: verifiedItems,
            address,
            amount: totalAmount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        return res.json({ success: true, message: "Order Placed Successfully", orderId: newOrder._id });
    } catch (error) {
        console.error('placeOrder error:', error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

// 2. Placing order using Stripe
const placeOrderStrip = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { items, address } = req.body;
        const { origin } = req.headers;

        if (!address) {
            return res.status(400).json({ success: false, message: "Delivery address is required." });
        }

        const { verifiedItems, totalAmount } = await calculateVerifiedOrder(items);

        const orderData = {
            userId,
            items: verifiedItems,
            address,
            amount: totalAmount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = verifiedItems.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: Math.round(deliveryCharge * 100)
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
            metadata: {
                orderId: newOrder._id.toString(),
                userId: userId.toString()
            }
        });

        return res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error('placeOrderStrip error:', error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

// 3. Verify Stripe Payment
const verifyStripe = async (req, res) => {
    const userId = req.userId || req.body.userId;
    const { orderId, success, sessionId } = req.body;

    try {
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required." });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // Verify ownership
        if (order.userId !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access to order." });
        }

        if (success === "true" || success === true) {
            // Verify session from Stripe if sessionId provided
            if (sessionId) {
                const session = await stripe.checkout.sessions.retrieve(sessionId);
                if (session.payment_status !== 'paid') {
                    return res.status(400).json({ success: false, message: "Payment was not completed." });
                }
            }

            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            return res.json({ success: true, message: "Payment verified successfully." });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment was cancelled or failed." });
        }
    } catch (error) {
        console.error('verifyStripe error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Placing order using Razorpay
const placeOrderRazorpay = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { items, address } = req.body;

        if (!address) {
            return res.status(400).json({ success: false, message: "Delivery address is required." });
        }

        const { verifiedItems, totalAmount } = await calculateVerifiedOrder(items);

        const orderData = {
            userId,
            items: verifiedItems,
            address,
            amount: totalAmount,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: Math.round(totalAmount * 100),
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        };

        const order = await razorpayInstance.orders.create(options);
        return res.json({ success: true, order });
    } catch (error) {
        console.error('placeOrderRazorpay error:', error);
        return res.status(400).json({ success: false, message: error.message });
    }
};

// 5. Verify Razorpay Payment (Cryptographic HMAC Signature Verification)
const verifyRazorpay = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({ success: false, message: "Payment details missing." });
        }

        // 1. Verify cryptographic signature if present
        if (razorpay_signature) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ success: false, message: "Invalid payment signature." });
            }
        }

        // 2. Fetch order to locate receipt / internal orderId
        const razorpayOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
        if (!razorpayOrder) {
            return res.status(404).json({ success: false, message: "Razorpay order not found." });
        }

        const internalOrderId = razorpayOrder.receipt;
        const order = await orderModel.findById(internalOrderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Internal order record not found." });
        }

        if (order.userId !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access to order." });
        }

        await orderModel.findByIdAndUpdate(internalOrderId, { payment: true });
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        return res.json({ success: true, message: "Payment Successful" });
    } catch (error) {
        console.error('verifyRazorpay error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. All orders data for admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        return res.json({ success: true, orders });
    } catch (error) {
        console.error('allOrders error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 7. User orders data for frontend
const userOrders = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        return res.json({ success: true, orders });
    } catch (error) {
        console.error('userOrders error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 8. Update order Status from admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and status are required." });
        }

        await orderModel.findByIdAndUpdate(orderId, { status });
        return res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.error('updateStatus error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export {
    verifyRazorpay,
    verifyStripe,
    placeOrder,
    placeOrderStrip,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus
};