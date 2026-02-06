const mongoose = require('mongoose');
// Проверь путь к модели, судя по скриншоту: ./models/Product
const Product = require('./models/Product');

// Твоя строка подключения из Compass:
const uri = "mongodb+srv://cluster0.7dqmxpg.mongodb.net/jewelryDB";

mongoose.connect(uri)
.then(async () => {
    console.log("Connected to jewelryDB...");

    const updates = {
        "Royal Diamond Ring": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
        "Emerald Serenity Necklace": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
        "Midnight Sapphire Studs": "https://images.unsplash.com/photo-1635767791008-3cbaaa5df335?w=800",
        "Golden Leaf Bracelet": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
        "Pearl Elegance Set": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800",
        "Ruby Fire Pendant": "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800",
        "Silver Moon Hoops": "https://images.unsplash.com/photo-1630019058353-524407960100?w=800",
        "Amethyst Charm": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800"
    };

    for (const [name, url] of Object.entries(updates)) {
        await Product.updateOne({ name: name }, { $set: { image: url } });
        console.log(`Fixed: ${name}`);
    }

    console.log("All fixed! Refresh Compass and your Shop page.");
    process.exit();
})
.catch(err => console.error(err));