require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const jewelryItems = [
    { name: "Royal Diamond Ring", price: 2500, category: "Rings", specs: { metal: "Platinum", stone: "Diamond" }, stock: 5, reviews: [{user: "Alice", comment: "Stunning!"}] },
    { name: "Emerald Serenity Necklace", price: 1800, category: "Necklaces", specs: { metal: "Yellow Gold", stone: "Emerald" }, stock: 3 },
    { name: "Midnight Sapphire Studs", price: 950, category: "Earrings", specs: { metal: "White Gold", stone: "Sapphire" }, stock: 8 },
    { name: "Golden Leaf Bracelet", price: 400, category: "Bracelets", specs: { metal: "24K Gold", stone: "None" }, stock: 12 },
    { name: "Pearl Elegance Set", price: 1200, category: "Sets", specs: { metal: "Silver", stone: "Pearl" }, stock: 4 },
    { name: "Ruby Fire Pendant", price: 1500, category: "Necklaces", specs: { metal: "Rose Gold", stone: "Ruby" }, stock: 6 },
    { name: "Silver Moon Hoops", price: 150, category: "Earrings", specs: { metal: "Silver", stone: "None" }, stock: 20 },
    { name: "Amethyst Charm", price: 300, category: "Bracelets", specs: { metal: "Gold Plated", stone: "Amethyst" }, stock: 10 }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Seeding database...");
        
        // Очистка старых данных
        await Product.deleteMany({});
        await User.deleteMany({});

        const createdProducts = await Product.insertMany(jewelryItems);

        await User.create({
            username: "TestUser",
            email: "test@jewelry.com",
            wishlist: [createdProducts[0]._id]
        });

        console.log("Database seeded successfully!");
        process.exit();
    })
    .catch(err => {
        console.error("Seeding error:", err);
        process.exit(1);
    });