require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const jewelryItems = [
    {
        name: "Royal Diamond Ring",
        price: 2500,
        category: "Rings",
        specs: { metal: "Platinum", stone: "Diamond" },
        stock: 5,
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800"
    },
    {
        name: "Emerald Serenity Necklace",
        price: 1800,
        category: "Necklaces",
        specs: { metal: "Yellow Gold", stone: "Emerald" },
        stock: 3,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800"
    },
    {
        name: "Midnight Sapphire Studs",
        price: 950,
        category: "Earrings",
        specs: { metal: "White Gold", stone: "Sapphire" },
        stock: 8,
        image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800"
    },
    {
        name: "Golden Leaf Bracelet",
        price: 400,
        category: "Bracelets",
        specs: { metal: "24K Gold", stone: "None" },
        stock: 12,
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800"
    },
    {
        name: "Pearl Elegance Set",
        price: 1200,
        category: "Sets",
        specs: { metal: "Silver", stone: "Pearl" },
        stock: 4,
        image: "https://images.unsplash.com/photo-1535633302704-b02f4faad311?w=800"
    },
    {
        name: "Ruby Fire Pendant",
        price: 1500,
        category: "Necklaces",
        specs: { metal: "Rose Gold", stone: "Ruby" },
        stock: 6,
        image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800"
    },
    {
        name: "Silver Moon Hoops",
        price: 150,
        category: "Earrings",
        specs: { metal: "Silver", stone: "None" },
        stock: 20,
        image: "https://images.unsplash.com/photo-1535633602411-da6379b07ff0?w=800"
    },
    {
        name: "Amethyst Charm",
        price: 300,
        category: "Bracelets",
        specs: { metal: "Gold Plated", stone: "Amethyst" },
        stock: 10,
        image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800"
    }
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