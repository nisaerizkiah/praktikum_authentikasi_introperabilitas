// ===================== IMPORT DAN KONFIG =====================
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { dbMovies, dbDirectors } = require("./database.js");

const app = express();
const PORT = process.env.PORT || 3200;
const JWT_SECRET = process.env.JWT_SECRET || "rahasia";

// Middleware untuk parsing JSON body
app.use(bodyParser.json());

// ===================== MIDDLEWARE AUTENTIKASI JWT =====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = decoded;
    next();
  });
}

// ===================== REGISTER USER =====================
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

  dbDirectors.run(sql, [username, hashedPassword], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE"))
        return res.status(409).json({ message: "Username sudah digunakan" });
      return res
        .status(500)
        .json({ message: "Gagal register", error: err.message });
    }
    res.json({ message: "Registrasi berhasil", id: this.lastID });
  });
});

// ===================== LOGIN USER =====================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });

  const sql = "SELECT * FROM users WHERE username = ?";
  dbDirectors.get(sql, [username], (err, user) => {
    if (err)
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      { username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" } // Token berlaku 1 jam
    );

    res.json({ message: "Login berhasil", token });
  });
});

// ===================== GET SEMUA DIRECTORS (PUBLIK) =====================
app.get("/directors", (req, res) => {
  const sql = "SELECT * FROM directors ORDER BY id ASC";
  dbDirectors.all(sql, [], (err, rows) => {
    if (err)
      return res.status(500).json({ message: "Gagal mengambil data", error: err.message });
    res.json({ message: "success", data: rows });
  });
});

// ===================== GET DIRECTOR BY ID (PUBLIK) =====================
app.get("/directors/:id", (req, res) => {
  const sql = "SELECT * FROM directors WHERE id = ?";
  dbDirectors.get(sql, [req.params.id], (err, row) => {
    if (err)
      return res.status(500).json({ message: "Gagal mengambil data", error: err.message });
    if (!row) return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json({ message: "success", data: row });
  });
});

// ===================== POST TAMBAH DIRECTOR (DENGAN TOKEN) =====================
app.post("/directors", authenticateToken, (req, res) => {
  const { name, country } = req.body;
  if (!name || !country)
    return res.status(400).json({ message: "Nama dan negara wajib diisi" });

  const sql = "INSERT INTO directors (name, country) VALUES (?, ?)";
  dbDirectors.run(sql, [name, country], function (err) {
    if (err)
      return res.status(500).json({ message: "Gagal menambah data", error: err.message });
    res.json({ message: "Director berhasil ditambah", id: this.lastID });
  });
});

// ===================== PUT UBAH DIRECTOR (DENGAN TOKEN) =====================
app.put("/directors/:id", authenticateToken, (req, res) => {
  const { name, country } = req.body;
  if (!name || !country)
    return res.status(400).json({ message: "Nama dan negara wajib diisi" });

  const sql = "UPDATE directors SET name = ?, country = ? WHERE id = ?";
  dbDirectors.run(sql, [name, country, req.params.id], function (err) {
    if (err)
      return res.status(500).json({ message: "Gagal mengubah data", error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json({ message: "Director berhasil diperbarui" });
  });
});

// ===================== DELETE DIRECTOR (DENGAN TOKEN) =====================
app.delete("/directors/:id", authenticateToken, (req, res) => {
  const sql = "DELETE FROM directors WHERE id = ?";
  dbDirectors.run(sql, [req.params.id], function (err) {
    if (err)
      return res.status(500).json({ message: "Gagal menghapus data", error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json({ message: "Director berhasil dihapus" });
  });
});

// ===================== STATUS SERVER =====================
app.get("/status", (req, res) => {
  res.json({
    ok: true,
    status: "Server is running",
    service: "Directors API (JWT Protected)",
  });
});

// ===================== JALANKAN SERVER =====================
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
