const mongoose = require('mongoose');
const Product = require('./models/Product');
mongoose.connect('mongodb+srv://shukurbayassylay_db_user:Assylay2007.@cluster0.7dqmxpg.mongodb.net/');

const photos = {
    "Royal Diamond Ring": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    "Emerald Serenity Necklace": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
    "Midnight Sapphire Studs": "https://images.unsplash.com/photo-1635767791008-3cbaaa5df335?w=800",
    "Golden Leaf Bracelet": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
    "Pearl Elegance Set": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800",
    "Ruby Fire Pendant": "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800",
    "Silver Moon Hoops": "https://images.unsplash.com/photo-1630019058353-524407960100?w=800",
    "Amethyst Charm": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800"

};

async function updateProducts() {
    for (const [name, url] of Object.entries(photos)) {
        await Product.updateOne({ name: name }, { $set: { image: url } });
        console.log(`Updated: ${name}`);
    }
    console.log("All photos updated! Now press Ctrl+C to exit.");
}

updateProducts();