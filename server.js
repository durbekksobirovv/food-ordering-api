const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const DB_FILE = "./db.json";

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

// --- 1. FAYLDAN O'QISH VA YOZISH ---

const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    // Struktura ichiga categories massivini ham qo'shdik
    const initialData = {
      foods: [],
      orders: [],
      categories: ["Fastfud", "Ichimliklar"],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DB_FILE);
  const parsedData = JSON.parse(data);

  // Agar eski db.json ichida categories bo'lmasa, uni yaratib qo'yamiz
  if (!parsedData.categories) {
    parsedData.categories = [];
  }
  return parsedData;
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- 2. CATEGORIES API (YANGI QO'SHILDI) ---

// Barcha kategoriyalarni olish
app.get("/api/categories", (req, res) => {
  const db = readDB();
  res.json(db.categories);
});

// Yangi kategoriya qo'shish
app.post("/api/categories", (req, res) => {
  const db = readDB();
  const newCategory = req.body.name;

  if (!newCategory) {
    return res.status(400).json({ message: "Kategoriya nomi yozilmagan" });
  }

  if (db.categories.includes(newCategory)) {
    return res.status(400).json({ message: "Bu kategoriya allaqachon mavjud" });
  }

  db.categories.push(newCategory);
  writeDB(db);
  res.status(201).json(newCategory);
});

// Kategoriyani o'chirish
app.delete("/api/categories/:name", (req, res) => {
  const db = readDB();
  const catName = req.params.name;

  db.categories = db.categories.filter((c) => c !== catName);
  writeDB(db);
  res.json({ message: "Kategoriya o'chirildi" });
});

// --- 3. FOODS API ---

app.get("/api/foods", (req, res) => {
  const db = readDB();
  res.json(db.foods);
});

app.post("/api/foods", (req, res) => {
  const db = readDB();
  const newFood = {
    ...req.body,
    id: req.body.id || Date.now().toString(),
    price: Number(req.body.price),
  };

  const index = db.foods.findIndex((f) => f.id === newFood.id);
  if (index !== -1) {
    db.foods[index] = newFood;
  } else {
    db.foods.push(newFood);
  }

  writeDB(db);
  res.status(201).json(newFood);
});

app.delete("/api/foods/:id", (req, res) => {
  const db = readDB();
  db.foods = db.foods.filter((f) => f.id !== req.params.id);
  writeDB(db);
  res.json({ message: "O'chirildi" });
});

// --- 4. ORDERS API ---

app.get("/api/orders", (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const db = readDB();
  const newOrder = {
    ...req.body,
    id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleString("uz-UZ"),
  };
  db.orders.push(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

app.delete("/api/orders/:id", (req, res) => {
  const db = readDB();
  db.orders = db.orders.filter((o) => o.id !== req.params.id);
  writeDB(db);
  res.json({ message: "Zakas bajarildi" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} da yoniq`);
});
