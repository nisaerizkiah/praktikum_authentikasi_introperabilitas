require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();

// Koneksi ke database Movies
const dbMovies = new sqlite3.Database(process.env.DB_MOVIES || "movies.db", (err) => {
  if (err) {
    console.error("Gagal konek ke DB Movies:", err.message);
  } else {
    console.log("Terhubung ke DB Movies");

    dbMovies.run(
      `CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        director TEXT NOT NULL,
        year INTEGER NOT NULL
      )`,
      (err) => {
        if (!err) {
          dbMovies.get("SELECT COUNT(*) AS count FROM movies", (err, row) => {
            if (!err && row.count === 0) {
              console.log("Mengisi data awal Movies...");
              const insert = "INSERT INTO movies (title, director, year) VALUES (?, ?, ?)";
              dbMovies.run(insert, ["Inception", "Christopher Nolan", 2010]);
              dbMovies.run(insert, ["The Matrix", "The Wachowskis", 1999]);
              dbMovies.run(insert, ["Interstellar", "Christopher Nolan", 2014]);
            }
          });
        }
      }
    );
  }
});

// Koneksi ke database Directors
const dbDirectors = new sqlite3.Database(process.env.DB_DIRECTORS || "directors.db", (err) => {
  if (err) {
    console.error("Gagal konek ke DB Directors:", err.message);
  } else {
    console.log("Terhubung ke DB Directors");

    dbDirectors.run(
      `CREATE TABLE IF NOT EXISTS directors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        country TEXT NOT NULL
      )`,
      (err) => {
        if (!err) {
          dbDirectors.get("SELECT COUNT(*) AS count FROM directors", (err, row) => {
            if (!err && row.count === 0) {
              console.log("Mengisi data awal Directors...");
              const insert = "INSERT INTO directors (name, country) VALUES (?, ?)";
              dbDirectors.run(insert, ["Christopher Nolan", "UK"]);
              dbDirectors.run(insert, ["The Wachowskis", "USA"]);
              dbDirectors.run(insert, ["Quentin Tarantino", "USA"]);
            }
          });
        }
      }
    );

    // Tambahkan juga tabel users di database directors agar autentikasi bisa di sana
    dbDirectors.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`
    );
  }
});

module.exports = { dbMovies, dbDirectors };