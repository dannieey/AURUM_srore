const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    image: { type: String, default: 'https://via.placeholder.com/300x300?text=Jewelry' }, // Добавили это поле
    category: String,
    stock: { type: Number, default: 10 },
    specs: {
        metal: String,
        stone: String,
        weight: Number
    },
    reviews: [{ user: String, comment: String, rating: Number }]
});

// Составной индекс для оптимизации фильтрации [cite: 35]
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);