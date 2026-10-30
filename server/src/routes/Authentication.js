const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const router = express.Router();

// registration schema (if u give username email and password stores in database and now youre registered)
const regModel = async (username, email, password) => {
  // encrypts password
  const hashedPassword = await bcrypt.hash(password, 12);

  const results = await pool.query(
    `INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email`,
    [username, email, hashedPassword],
  );
  return results.rows[0];
};

// route where you send the data
router.post("/register", async (req, res) => {
  try {
    // takes the data
    const { username, email, password } = req.body;

    // checks if all input areas filled in
    if (!username || !email || !password)
      return res.status(400).json({ message: "Invalid Input" });

    // checks if user exists (by email, cant be more than 1 person with same email)
    const results = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1`,
      [email],
    );

    // if exist don't register
    if (!!results.rows[0])
      return res.status(409).json({ message: "email already exists" });

    // if doesn't let through
    const user = await regModel(username, email, password);

    // create seassion (auto loggin)
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    // finish
    return res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (err) {
    // error if anything goes wrong
    console.error("Registration failed:", err);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// route where you send the data
router.post("/login", async (req, res) => {
  try {
    // stores data
    const { email, password } = req.body;

    // checks if all input areas filled in
    if (!email || !password) {
      return res.status(400).json({ message: "Invalid Input" });
    }

    // gets user data
    const results = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1`,
      [email],
    );

    const user = results.rows[0];

    // if user doesn't exist don't login
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // compares encrypted password to the one you gave
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    // if no match don't let
    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // creates session so auto login works
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

// auto login, checks if session exists and logs in
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

// logout, destroys session
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
