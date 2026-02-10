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
    const initialData = { foods: [], orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- 2. API YO'NALISHLARI ---

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

app.get("/api/orders", (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const db = readDB();
  const newOrder = {
    ...req.body,
    id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    status: "Kutilmoqda", // Default holat
    date: new Date().toLocaleString("uz-UZ"),
  };
  db.orders.push(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

// --- MANA SHU QISMI QO'SHILDI (STATUS YANGILASH) ---
app.patch("/api/orders/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body;

  const orderIndex = db.orders.findIndex((o) => o.id === id);

  if (orderIndex !== -1) {
    // Faqat statusni yangilaymiz
    db.orders[orderIndex].status = status;
    writeDB(db);
    console.log(`✅ Buyurtma ${id} statusi ${status}ga o'zgardi`);
    res.json(db.orders[orderIndex]);
  } else {
    res.status(404).json({ message: "Zakas topilmadi" });
  }
});
// ------------------------------------------------

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
// --- RANGNI OLISH ---
app.get('/api/settings', (req, res) => {
    const db = readDB();
    // Agar settings bo'lmasa, default rang qaytaramiz
    res.json(db.settings || { bgColor: "#f3f4f6" });
});

// --- RANGNI SAQLASH ---
app.post('/api/settings', (req, res) => {
    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    writeDB(db);
    res.json({ message: "Sozlamalar saqlandi", settings: db.settings });
});