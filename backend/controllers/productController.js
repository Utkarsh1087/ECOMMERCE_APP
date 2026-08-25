import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Add product (Admin only)
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        if (!name || !description || !price || !category || !subCategory) {
            return res.status(400).json({ success: false, message: "Missing required product fields." });
        }

        const parsedPrice = Number(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ success: false, message: "Price must be a positive number." });
        }

        let parsedSizes = [];
        try {
            parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : (Array.isArray(sizes) ? sizes : []);
        } catch {
            parsedSizes = [];
        }

        const files = req.files || {};
        const image1 = files.image1 && files.image1[0];
        const image2 = files.image2 && files.image2[0];
        const image3 = files.image3 && files.image3[0];
        const image4 = files.image4 && files.image4[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imageUrl = [];
        if (images.length > 0) {
            imageUrl = await Promise.all(
                images.map(async (item) => {
                    const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                    return result.secure_url;
                })
            );
        }

        const productData = {
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            price: parsedPrice,
            subCategory: subCategory.trim(),
            bestseller: bestseller === 'true' || bestseller === true,
            sizes: parsedSizes,
            images: imageUrl,
            date: Date.now()
        };

        const product = new productModel(productData);
        await product.save();

        return res.status(201).json({ success: true, message: "Product Added Successfully", productId: product._id });
    } catch (error) {
        console.error('addProduct error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// List products
const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({}).sort({ date: -1 });
        return res.json({ success: true, products });
    } catch (error) {
        console.error('listProduct error:', error);
        return res.status(500).json({ success: false, message: "Failed to retrieve products." });
    }
};

// Remove product (Admin only)
const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const deleted = await productModel.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        return res.json({ success: true, message: "Product Removed Successfully" });
    } catch (error) {
        console.error('removeProduct error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        return res.json({ success: true, product });
    } catch (error) {
        console.error('singleProduct error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export { listProduct, addProduct, removeProduct, singleProduct };