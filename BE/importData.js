/**
 * 📊 IMPORT SAMPLE DATA TO MONGODB
 * 
 * Usage: node importData.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Product = require('./src/models/productModel');
const Order = require('./src/models/orderModel');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carsupper';

// File paths
const PRODUCTS_FILE = path.join(__dirname, '..', 'DB', 'carsupper.products.json');
const ORDERS_FILE = path.join(__dirname, '..', 'DB', 'carsupper.orders.json');

async function importData() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Read JSON files
        console.log('📂 Reading data files...');
        const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
        const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
        console.log(`   - Products: ${productsData.length} items`);
        console.log(`   - Orders: ${ordersData.length} items\n`);

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Import products
        console.log('📦 Importing products...');
        const products = productsData.map(p => ({
            _id: p._id.$oid,
            name: p.name,
            description: p.description,
            price: p.price,
            discountPrice: p.discountPrice,
            category: p.category.$oid,
            images: p.images,
            variants: p.variants.map(v => ({
                color: v.color,
                transmission: v.transmission,
                engine: v.engine,
                stock: v.stock
            })),
            status: p.status,
            viewCount: p.viewCount || 0,
            createdAt: p.createdAt?.$date || new Date(),
            updatedAt: p.updatedAt?.$date || new Date()
        }));

        await Product.insertMany(products);
        console.log(`✅ Imported ${products.length} products\n`);

        // Import orders
        console.log('🛒 Importing orders...');
        const orders = ordersData.map(o => ({
            _id: o._id.$oid,
            user: o.user.$oid,
            products: o.products.map(p => ({
                productId: p.productId.$oid,
                name: p.name,
                price: p.price,
                quantity: p.quantity,
                color: p.color,
                transmission: p.transmission,
                engine: p.engine
            })),
            total: o.total,
            status: o.status,
            feedback: o.feedback,
            shippingAddress: o.shippingAddress,
            paymentMethod: o.paymentMethod,
            createdAt: o.createdAt?.$date || new Date(),
            updatedAt: o.updatedAt?.$date || new Date()
        }));

        await Order.insertMany(orders);
        console.log(`✅ Imported ${orders.length} orders\n`);

        // Summary
        console.log('📊 IMPORT SUMMARY:');
        console.log('   ✅ Products:', products.length);
        console.log('   ✅ Orders:', orders.length);
        console.log('   ✅ Products with viewCount:', products.filter(p => p.viewCount > 0).length);
        console.log('   ✅ Orders with feedback:', orders.filter(o => o.feedback).length);
        console.log('\n🎉 Import completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run import
importData();
