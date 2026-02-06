const mongoose = require('mongoose');
const Product = require('./models/Product');
mongoose.connect('mongodb+srv://shukurbayassylay_db_user:Assylay2007.@cluster0.7dqmxpg.mongodb.net/');


async function updateProducts() {
    for (const [name, url] of Object.entries(photos)) {
        await Product.updateOne({ name: name }, { $set: { image: url } });
        console.log(`Updated: ${name}`);
    }
    console.log("All photos updated! Now press Ctrl+C to exit.");
}

updateProducts();