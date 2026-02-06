# AURUM – Luxury Jewelry E-Commerce Platform

AURUM is a full-stack web application designed for a premium jewelry store. The project demonstrates advanced database management using MongoDB,frontend-backend integration, and business analytics through the Aggregation Framework.

## Features
* **Dynamic Catalog:** Real-time search and filtering of jewelry items.
* **Detailed Product Views:** Deep dive into item specifications (metal, stones, stock).
* **User Collection (Wishlist):** Ability to save favorite items using MongoDB Referenced Data Models.
* **Order Management:** Placing orders that instantly reflect in business analytics.
* **Admin Dashboard:** Real-time statistics including category price averages and total revenue.

## Tech Stack
* **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript (Vanilla ES6).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas (NoSQL).
* **ODM:** Mongoose.

## Database Architecture

### 1. Collections Structure
* **Products:** Uses the **Embedded Pattern** for technical specifications (`specs`).
* **Users:** Uses the **Reference Pattern** to link saved products via `ObjectId`.
* **Orders:** Links users and products to calculate business metrics.

### 2. Aggregation Pipelines
The project implements complex MongoDB Aggregations:
* **Revenue Analytics:** Sums up all successful transactions to show "Total Revenue".
* **Market Analysis:** Calculates the average price per jewelry category to help with pricing strategy.

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-link]
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the root and add your MongoDB URI:
    ```env
    MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/jewelryDB
    ```
4.  **Run the server:**
    ```bash
    node server.js
    ```
    Access the app at `http://localhost:3000`.

## Optimization
The database is optimized with a **Compound Index** on `{ category: 1, price: -1 }` to ensure high performance during filtered searches.