const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const DB_FILE = "./db.json";

app.use(cors());
// Rasm yuklashda muammo bo'lmasligi uchun limitni yuqori ushlaymiz
app.use(bodyParser.json({ limit: "50mb" }));

// --- 1. FAYLDAN O'QISH VA YOZISH ---
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      foods: [],
      orders: [],
      settings: { bgColor: "#f3f4f6" },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- 2. MAHSULOTLAR API ---

app.get("/api/foods", (req, res) => {
  const db = readDB();
  res.json(db.foods);
});

app.post("/api/foods", (req, res) => {
  const db = readDB();
  const newFood = {
    ...req.body,
    // ID bo'lsa o'ziniki, bo'lmasa yangi generatsiya qilamiz
    id: req.body.id || req.body._id || Date.now().toString(),
    price: Number(req.body.price),
  };

  const index = db.foods.findIndex(
    (f) => f.id === newFood.id || f._id === newFood.id,
  );

  if (index !== -1) {
    db.foods[index] = { ...db.foods[index], ...newFood };
  } else {
    db.foods.push(newFood);
  }

  writeDB(db);
  res.status(201).json(newFood);
});

app.delete("/api/foods/:id", (req, res) => {
  const db = readDB();
  db.foods = db.foods.filter(
    (f) => f.id !== req.params.id && f._id !== req.params.id,
  );
  writeDB(db);
  res.json({ message: "O'chirildi" });
});

// --- 3. BUYURTMALAR API ---

app.get("/api/orders", (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const db = readDB();
  const newOrder = {
    ...req.body,
    id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    status: "Kutilmoqda",
    date: new Date().toLocaleString("uz-UZ"),
  };
  db.orders.push(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

// STATUSNI YANGILASH (Tayyor tugmasi bosilganda ishlaydi)
app.patch("/api/orders/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body;

  const index = db.orders.findIndex((o) => o.id === id || o._id === id);

  if (index !== -1) {
    db.orders[index].status = status;
    writeDB(db);
    console.log(`✅ Order ${id} updated to: ${status}`);
    res.json(db.orders[index]);
  } else {
    res.status(404).json({ message: "Zakas topilmadi" });
  }
});

app.delete("/api/orders/:id", (req, res) => {
  const db = readDB();
  db.orders = db.orders.filter(
    (o) => o.id !== req.params.id && o._id !== req.params.id,
  );
  writeDB(db);
  res.json({ message: "Zakas olib tashlandi" });
});

// --- 4. SOZLAMALAR ---

app.get("/api/settings", (req, res) => {
  const db = readDB();
  res.json(db.settings || { bgColor: "#f3f4f6" });
});

app.post("/api/settings", (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ message: "Saqlandi", settings: db.settings });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} da ishga tushdi`);
});
