const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const DB_FILE = "./db.json";

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      foods: [],
      orders: [],
      archive: [],
      settings: { bgColor: "#f3f4f6" },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
};

const writeDB = (data) =>
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// --- TAOM VA SOZLAMALAR API (O'ZGARISSIZ) ---
app.get("/api/foods", (req, res) => res.json(readDB().foods));
app.post("/api/foods", (req, res) => {
  const db = readDB();
  const newFood = {
    ...req.body,
    id: req.body.id || Date.now().toString(),
    price: Number(req.body.price),
  };
  const idx = db.foods.findIndex((f) => f.id === newFood.id);
  idx !== -1 ? (db.foods[idx] = newFood) : db.foods.push(newFood);
  writeDB(db);
  res.status(201).json(newFood);
});
app.delete("/api/foods/:id", (req, res) => {
  const db = readDB();
  db.foods = db.foods.filter((f) => f.id !== req.params.id);
  writeDB(db);
  res.json({ message: "O'chirildi" });
});

// --- BUYURTMALAR VA ARXIV (STATISTIKA UCHUN) ---

app.get("/api/orders", (req, res) => res.json(readDB().orders));

// Arxivlash API: "Yakunlash" bosilganda o'chirmaydi, arxivga ko'chiradi
app.post("/api/orders/archive/:id", (req, res) => {
  const db = readDB();
  const orderIdx = db.orders.findIndex((o) => o.id === req.params.id);

  if (orderIdx !== -1) {
    const archivedOrder = { ...db.orders[orderIdx], status: "Yakunlandi" };
    if (!db.archive) db.archive = [];
    db.archive.push(archivedOrder); // Statistika uchun saqlab qolamiz
    db.orders.splice(orderIdx, 1);
    writeDB(db);
    res.json({ message: "Zakas arxivlandi" });
  } else {
    res.status(404).json({ message: "Topilmadi" });
  }
});

// Statistika uchun hamma ma'lumotni olish
app.get("/api/stats/summary", (req, res) => {
  const db = readDB();
  const history = [...(db.archive || []), ...db.orders]; // O'chib ketmagan hamma pulni hisoblash
  res.json(history);
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server http://localhost:${PORT} da ishga tushdi`),
);
