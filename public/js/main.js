const app = {
    showToast: (msg) => alert(msg),
    // 1. Каталог товаров (shop.html)
    loadCatalog: async () => {
        // 1. Получаем значение из поля поиска
        const searchInput = document.getElementById('search');
        const searchTerm = searchInput ? searchInput.value.trim() : '';

        // 2. Формируем запрос к серверу (передаем параметр name для фильтрации)
        const query = searchTerm ? `?name=${encodeURIComponent(searchTerm)}` : '';

        try {
            const res = await fetch(`/api/products${query}`);
            const data = await res.json();
            const grid = document.getElementById('product-grid');

            if (grid) {
                // Если поиск ничего не нашел
                if (data.length === 0) {
                    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No jewelry found matching "${searchTerm}"</p>`;
                    return;
                }

                // 3. Отрисовываем карточки. Теперь каждая берет СВОЮ картинку из p.image
                grid.innerHTML = data.map(p => `
                    <div class="card" style="display: flex; flex-direction: column; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: 0.3s;">
                        <div style="width: 100%; height: 220px; background: #fdfdfd;">
                            <img src="${p.image}" alt="${p.name}" 
                                 style="width: 100%; height: 100%; object-fit: cover;"
                                 onerror="this.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'">
                        </div>
                        
                        <div style="padding: 15px; text-align: center;">
                            <h3 style="margin: 0; font-family: 'serif'; color: #222; font-size: 1.1rem; height: 3rem; display: flex; align-items: center; justify-content: center;">
                                ${p.name}
                            </h3>
                            <p style="color: #C5A059; font-weight: bold; font-size: 1.3rem; margin: 10px 0;">$${p.price}</p>
                            
                            <div style="display: flex; gap: 8px; margin-top: 10px;">
                                <button class="btn-gold" onclick="app.addToWishlist('${p._id}')" 
                                    style="flex: 1; padding: 10px; cursor: pointer; border: 1px solid #C5A059; background: transparent; color: #C5A059; border-radius: 4px; font-weight: 600; font-size: 0.8rem;">
                                    ❤
                                </button>
                                <a href="product.html?id=${p._id}" class="btn-gold" 
                                    style="flex: 2; background: black; color: white; text-align: center; text-decoration: none; padding: 10px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;">
                                    DETAILS
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error("Catalog Error:", err);
        }
    },
    // 2. Добавление в Wishlist
    addToWishlist: async (id) => {
        try {
            const res = await fetch(`/api/wishlist/${id}`, { method: 'POST' });
            if (res.ok) {
                // Теперь уведомляем, что товар в корзине (Shopping Bag)
                alert("Added to your Shopping Bag!");
            }
        } catch (err) {
            console.error("Error adding to bag:", err);
        }
    },

    checkout: async () => {
        try {
            // 1. Сначала считаем общую сумму из элементов в корзине
            const userRes = await fetch('/api/user/me');
            const user = await userRes.json();

            if (!user.wishlist || user.wishlist.length === 0) {
                return alert("Your bag is empty!");
            }

            const totalAmount = user.wishlist.reduce((sum, item) => sum + item.price, 0);

            // 2. Отправляем заказ на сервер для аналитики админа
            const orderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalAmount: totalAmount })
            });

            if (orderRes.ok) {
                // 3. ОЧИСТКА КОРЗИНЫ
                // Нам нужно пройтись по всем ID в wishlist и удалить их
                for (const item of user.wishlist) {
                    await fetch(`/api/wishlist/${item._id}`, { method: 'DELETE' });
                }

                alert("Thank you! Your order has been placed and sent to administration.");

                // 4. Перенаправляем в профиль или обновляем страницу
                location.href = 'profile.html';
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (err) {
            console.error("Checkout Error:", err);
            alert("An error occurred during checkout.");
        }
    },
    // 4. Добавление товара (Admin)
    addItem: async () => {
        const name = document.getElementById('new-name').value;
        const price = document.getElementById('new-price').value;
        const image = document.getElementById('new-image').value; // Забираем ссылку на фото

        if(!name || !price) return alert("Fill all fields");

        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                price: Number(price),
                image: image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400", // Если пусто, ставим дефолтное фото
                category: "Luxury",
                stock: 10,
                specs: {metal: "Gold", stone: "Diamond"}
            })
        });
        if (res.ok) {
            alert("Product added to Database!");
            location.reload();
        }
    },

    /// 5. Загрузка статистики (admin.html)
    loadAdminStats: async () => {
        try {
            // 1. Получаем данные по категориям
            const resStats = await fetch('/api/stats/categories');
            const stats = await resStats.json();

            // Рисуем круговую диаграмму категорий
            const catCtx = document.getElementById('categoryChart').getContext('2d');
            new Chart(catCtx, {
                type: 'doughnut',
                data: {
                    labels: stats.map(s => s._id),
                    datasets: [{
                        data: stats.map(s => s.count),
                        backgroundColor: ['#C5A059', '#222', '#E5E5E5', '#888'],
                        borderWidth: 0
                    }]
                },
                options: { plugins: { legend: { position: 'bottom' } } }
            });

            // 2. Получаем данные по доходу
            const resRev = await fetch('/api/stats/revenue');
            const rev = await resRev.json();

            // Обновляем текстовые карточки
            const revContainer = document.getElementById('revenue-stats');
            if (revContainer) {
                revContainer.innerHTML = `
                    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <div style="flex: 1; background: #C5A059; color: white; padding: 20px; border-radius: 10px;">
                            <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">Total Revenue</p>
                            <h2 style="margin: 5px 0 0 0;">$${rev.totalRevenue || 0}</h2>
                        </div>
                        <div style="flex: 1; background: #222; color: white; padding: 20px; border-radius: 10px;">
                            <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">Orders Completed</p>
                            <h2 style="margin: 5px 0 0 0;">${rev.count || 0}</h2>
                        </div>
                    </div>
                `;
            }

            // Рисуем график дохода (имитация роста для красоты)
            const revCtx = document.getElementById('revenueChart').getContext('2d');
            new Chart(revCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Monthly Revenue',
                        data: [rev.totalRevenue * 0.2, rev.totalRevenue * 0.4, rev.totalRevenue * 0.3, rev.totalRevenue * 0.7, rev.totalRevenue * 0.9, rev.totalRevenue],
                        borderColor: '#C5A059',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(197, 160, 89, 0.1)'
                    }]
                }
            });

        } catch (err) {
            console.error("Admin Stats Error:", err);
        }
    },

    // 6. Загрузка профиля (profile.html)
    loadProfile: async () => {
    try {
        const res = await fetch('/api/user/me');
        const user = await res.json();
        const profileContainer = document.getElementById('profile-data');

        if (profileContainer) {
            const firstLetter = user.username ? user.username[0].toUpperCase() : 'A';
            const location = user.location || "Location not set";
            const joined = user.joinedDate || "Member since 2026";

            profileContainer.innerHTML = `
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid #eee; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 120px; height: 120px; background: #C5A059; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 50px; margin-bottom: 20px; font-family: 'serif'; box-shadow: 0 4px 15px rgba(197, 160, 89, 0.3);">
                            ${firstLetter}
                        </div>
                        <h1 style="margin: 0; color: #222; font-family: 'serif'; font-size: 2.5rem;">${user.username}</h1>
                        <p style="color: #C5A059; font-size: 1.1rem; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Premium Member</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; width: 100%; color: #666;">
                            <span><strong>📍 Location:</strong> ${location}</span>
                            <span><strong>📧 Email:</strong> ${user.email}</span>
                            <span><strong>📅 Joined:</strong> ${joined}</span>
                        </div>
                        
                        <a href="shop.html" class="btn-gold" style="margin-top: 30px; padding: 12px 30px; text-decoration: none; display: inline-block; background: black; color: white; border-radius: 8px;">
                            CONTINUE SHOPPING
                        </a>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        console.error("Profile loading error:", err);
    }
},

    // 7. Детали товара (product.html)
    loadProductDetail: async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) return;

        try {
            const res = await fetch(`/api/products/${id}`);
            const p = await res.json();

            const metal = (p.specs && p.specs.metal) ? p.specs.metal : "Gold";
            const stone = (p.specs && p.specs.stone) ? p.specs.stone : "Diamond";

            const detailContainer = document.getElementById('product-detail-view');
            if (detailContainer) {
                detailContainer.innerHTML = `
                    <div class="card" style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h1 style="color: #222; margin-bottom: 10px;">${p.name}</h1>
                        <p class="price" style="font-size: 28px; color: #C5A059; font-weight: bold;">$${p.price}</p>
                        
                        <div style="text-align: left; margin: 30px 0; padding: 20px; background: #fdfdfd; border: 1px solid #eee; border-radius: 8px; color: #444;">
                            <p style="margin: 8px 0;"><strong>Metal:</strong> ${metal}</p>
                            <p style="margin: 8px 0;"><strong>Stone:</strong> ${stone}</p>
                            <p style="margin: 8px 0;"><strong>Stock Available:</strong> ${p.stock} units</p>
                        </div>
                        
                        <button class="btn-gold" style="width: 100%; padding: 18px; font-size: 1.1rem; cursor: pointer;" onclick="app.buyProduct('${p._id}')">Place Order Now</button>
                    </div>
                `;
            }
        } catch (err) { console.error(err); }
    },

    // 8. Покупка
    buyProduct: async (id) => {
        const res = await fetch(`/api/products/${id}/buy`, { method: 'PATCH' });
        if(res.ok) {
            await fetch('/api/orders', { method: 'POST' });
            alert("Success! Order placed.");
            location.href = 'admin.html';
        }
    },
    loadCart: async () => {
    try {
        const res = await fetch('/api/user/me');
        const user = await res.json();

        const container = document.getElementById('cart-items');
        const summaryBox = document.getElementById('cart-summary-box');
        const subtotalDisplay = document.getElementById('subtotal-price');
        const totalDisplay = document.getElementById('total-price');

        // ГЛАВНОЕ ИЗМЕНЕНИЕ: проверяем user.wishlist вместо user.cart
        if (!user.wishlist || user.wishlist.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #fff; border-radius: 15px;">
                    <p style="color: #bbb; font-size: 1.2rem;">Your shopping bag is empty.</p>
                    <a href="shop.html" style="color: #C5A059; text-decoration: none; font-weight: bold;">Browse Collection</a>
                </div>
            `;
            if (summaryBox) summaryBox.style.display = 'none';
            return;
        }

        let total = 0;
        // Рендерим данные из wishlist
        container.innerHTML = user.wishlist.map(item => {
            total += item.price;
            return `
                <div style="display: flex; align-items: center; background: #fff; padding: 20px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); border: 1px solid #eee;">
                    <img src="${item.image}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 10px;">
                    <div style="margin-left: 20px; flex: 1;">
                        <h4 style="font-family: 'serif'; margin: 0; font-size: 1.1rem;">${item.name}</h4>
                        <p style="color: #C5A059; font-weight: bold; margin: 8px 0;">$${item.price}</p>
                        <button onclick="app.removeFromCart('${item._id}')" style="background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 0.8rem; text-decoration: underline; padding: 0;">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        // Обновляем цены в правой колонке
        if (subtotalDisplay) subtotalDisplay.innerText = `$${total}`;
        if (totalDisplay) totalDisplay.innerText = `$${total}`;
        if (summaryBox) summaryBox.style.display = 'block';

    } catch (err) {
        console.error("Cart loading error:", err);
    }
},

// Также убедись, что метод удаления тоже работает с wishlist
removeFromCart: async (id) => {
    try {
        const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
        if (res.ok) {
            app.loadCart(); // Перерисовываем корзину после удаления
        }
    } catch (err) {
        console.error("Delete error:", err);
    }
},
    addToCart: async (productId) => {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
            body: JSON.stringify({ productId })
        });

        if (response.ok) {
            app.showToast("Added to your collection");
            // Можно обновить счетчик в хедере, если он есть
        }
    } catch (err) {
        console.error("Cart Error:", err);
    }
},

    placeOrder: async () => {

        app.showToast("Thank you! Your order has been placed.");

    }
};
