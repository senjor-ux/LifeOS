const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const router = express.Router();

const regModel = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 12);

  const results = await pool.query(
    `INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email`,
    [username, email, hashedPassword],
  );
  return results.rows[0];
};

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "Invalid Input" });

    const results = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1`,
      [email],
    );

    if (!!results.rows[0])
      return res.status(409).json({ message: "email already exists" });

    const user = await regModel(username, email, password);

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (err) {
    console.error("Registration failed:", err);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid Input" });
    }

    const results = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1`,
      [email],
    );

    const user = results.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const { password_hash, ...safeUser } = user;

    req.session.user = {
      id: safeUser.id,
      username: safeUser.username,
      email: safeUser.email,
    };

    return res.status(200).json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

router.get("/profile", (req, res) => {
  if (req.session.user) {
    return res.json({
      message: `Welcome back ${req.session.user.username}`,
      user: req.session.user,
    });
  }

  return res.status(401).json({
    message: "No active session",
  });
});

router.post("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send("Error logging out.");
    } else {
      res.clearCookie("connect.sid");
      res.send("User logged out.");
    }
  });
});
module.exports = router;
