require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(express.static('public')); 

const dbURI = process.env.MONGO_URI; 
mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalAmount: Number,
    status: { type: String, default: 'Delivered' },
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// api endpoints

// 1. Поиск и получение всех товаров
app.get('/api/products', async (req, res) => {
    const { name } = req.query;
    let query = {};
    if (name) query.name = { $regex: name, $options: 'i' };
    const products = await Product.find(query);
    res.json(products);
});

// 2. Детали товара
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (err) { res.status(404).send("Not Found"); }
});

// 3. Создать товар (CRUD - Create)
app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
});

// 4. Удалить товар (CRUD - Delete)
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// 5. Обновить товар ($set)
app.patch('/api/products/:id', async (req, res) => {
    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
});

// 6. Покупка ($inc - уменьшение склада)
app.patch('/api/products/:id/buy', async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $inc: { stock: -1 } },
        { new: true }
    );
    res.json(product);
});

// 7. Вишлист ($addToSet)
app.post('/api/wishlist/:productId', async (req, res) => {
    const user = await User.findOne(); 
    if (!user) return res.status(404).send("User not found");
    await User.findByIdAndUpdate(user._id, { 
        $addToSet: { wishlist: req.params.productId } 
    });
    res.json({ message: "Successfully added to your collection!" });
});

// 8. Профиль (.populate)
app.get('/api/user/me', async (req, res) => {
    const user = await User.findOne().populate('wishlist');
    res.json(user);
});

// 9. Удалить из вишлиста ($pull)
app.patch('/api/user/wishlist/:productId', async (req, res) => {
    const user = await User.findOne();
    await User.findByIdAndUpdate(user._id, { $pull: { wishlist: req.params.productId } });
    res.json({ message: "Removed from wishlist" });
});

// 10. Агрегация: Средняя цена
app.get('/api/stats/categories', async (req, res) => {
    const stats = await Product.aggregate([
        { $group: { _id: "$category", avgPrice: { $avg: "$price" }, count: { $sum: 1 } } },
        { $sort: { avgPrice: -1 } }
    ]);
    res.json(stats);
});

// 11. Агрегация: Премиум
app.get('/api/stats/premium', async (req, res) => {
    const premium = await Product.aggregate([
        { $match: { price: { $gt: 1000 } } },
        { $project: { name: 1, price: 1, metal: "$specs.metal" } }
    ]);
    res.json(premium);
});

// 12. Создать заказ
app.post('/api/orders', async (req, res) => {
    try {
        const user = await User.findOne();
        const newOrder = new Order({
            userId: user._id,
            totalAmount: req.body.totalAmount || Math.floor(Math.random() * 3000) + 500,
            status: 'Delivered'
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 13. Агрегация: Доход
app.get('/api/stats/revenue', async (req, res) => {
    const stats = await Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);
    res.json(stats[0] || { totalRevenue: 0, count: 0 });
});

// 14. Регистрация (Dummy)
app.post('/api/auth/register', (req, res) => {
    res.json({ message: "User registered successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));