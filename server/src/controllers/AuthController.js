const { getUser, register } = require("../models/AuthModel");
const bcrypt = require("bcrypt");
const createError = require("../utils/createError");

async function registerUser(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      return res.status(400).json({ message: "Invalid request body" });

    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      !password
    )
      createError("Invalid input", 400);

    const normalize = email.trim().toLowerCase();

    const check = await getUser(normalize);

    if (check) createError("User already exist", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await register([username.trim(), normalize, hashedPassword]);

    const { password_hash, ...safeUser } = user;

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({
          message: "Registration failed",
        });
      }

      req.session.user = {
        id: safeUser.id,
        username: safeUser.username,
        email: safeUser.email,
      };

      req.session.save((err) => {
        if (err) {
          return res.status(500).json({
            message: "Registration failed",
          });
        }

        return res.status(201).json({
          message: "Registration successful",
          data: safeUser,
        });
      });
    });
  } catch (err) {
    console.error("Registration failed:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
}

async function loginUser(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      createError("Invalid request body", 400);

    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    )
      createError("Invalid input", 400);

    const normalize = email.trim().toLowerCase();

    const user = await getUser(normalize);

    if (!user) createError("Invalid email or password", 401);

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) createError("Invalid email or password", 401);

    const { password_hash, ...safeUser } = user;

    req.session.regenerate((err) => {
      if (err) {
        res.status(500).json({ message: "Login failed" });
      }

      req.session.user = {
        id: safeUser.id,
        username: safeUser.username,
        email: safeUser.email,
      };

      req.session.save((err) => {
        if (err) {
          res.status(500).json({ message: "Login failed" });
        }

        return res.status(200).json({
          message: "Login successful",
          data: safeUser,
        });
      });
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(err.statusCode || 500).json({
      message: err.message || "Login failed",
    });
  }
}

async function logoutUser(req, res) {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send("Error logging out.");
    } else {
      res.clearCookie("connect.sid");
      res.send("User logged out.");
    }
  });
}

async function profile(req, res) {
  if (req.session.user) {
    return res.json({
      message: `Welcome back ${req.session.user.username}`,
      data: req.session.user,
    });
  }

  return res.status(401).json({
    message: "No active session",
  });
}

module.exports = { registerUser, loginUser, logoutUser, profile };
