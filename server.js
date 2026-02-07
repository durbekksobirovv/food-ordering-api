const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs'); // Fayllar bilan ishlash uchun kutubxona

const app = express();
const DB_FILE = './db.json'; // Ma'lumotlar saqlanadigan fayl nomi

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- 1. FAYLDAN O'QISH VA YOZISH FUNKSIYALARI ---

// Fayldan ma'lumotlarni o'qib olish
const readDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        // Agar fayl bo'lmasa, bo'sh struktura yaratamiz
        const initialData = { foods: [], orders: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

// Faylga ma'lumotlarni yozish
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- 2. API YO'NALISHLARI ---

// Barcha taomlarni olish
app.get('/api/foods', (req, res) => {
    const db = readDB();
    res.json(db.foods);
});

// Yangi taom qo'shish yoki tahrirlash
app.post('/api/foods', (req, res) => {
    const db = readDB();
    const newFood = {
        ...req.body,
        id: req.body.id || Date.now().toString(),
        price: Number(req.body.price)
    };

    // Tahrirlash yoki yangi qo'shishni tekshirish
    const index = db.foods.findIndex(f => f.id === newFood.id);
    if (index !== -1) {
        db.foods[index] = newFood;
    } else {
        db.foods.push(newFood);
    }

    writeDB(db);
    res.status(201).json(newFood);
});

// Taomni o'chirish
app.delete('/api/foods/:id', (req, res) => {
    const db = readDB();
    db.foods = db.foods.filter(f => f.id !== req.params.id);
    writeDB(db);
    res.json({ message: "O'chirildi" });
});

// Zakaslarni olish
app.get('/api/orders', (req, res) => {
    const db = readDB();
    res.json(db.orders);
});

// Yangi zakas qabul qilish
app.post('/api/orders', (req, res) => {
    const db = readDB();
    const newOrder = {
        ...req.body,
        id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleString('uz-UZ')
    };
    db.orders.push(newOrder);
    writeDB(db);
    
    console.log("✅ Yangi zakas saqlandi!");
    res.status(201).json(newOrder);
});

// Zakasni o'chirish (Tayyor bo'lganda)
app.delete('/api/orders/:id', (req, res) => {
    const db = readDB();
    db.orders = db.orders.filter(o => o.id !== req.params.id);
    writeDB(db);
    res.json({ message: "Zakas bajarildi" });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} da yoniq`);
    console.log(`💾 Ma'lumotlar db.json fayliga saqlanmoqda`);
});