const { getUser, register } = require("../models/AuthModel");
const bcrypt = require("bcrypt");

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
      return res.status(400).json({ message: "Invalid Input" });

    const normalize = email.trim().toLowerCase();

    const check = await getUser(normalize);

    if (check) return res.status(409).json({ message: "User already exist" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await register([username.trim(), normalize, hashedPassword]);

    const { password_hash, ...safeUser } = user;

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Registration failed" });
      }

      req.session.user = {
        id: safeUser.id,
        username: safeUser.username,
        email: safeUser.email,
      };

      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Registration failed" });
        }

        return res.status(200).json({
          message: "Registration successful",
          data: safeUser,
        });
      });
    });
  } catch (err) {
    console.error("Registration failed:", err);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
}

async function loginUser(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      return res.status(400).json({ message: "Invalid request body" });

    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    )
      return res.status(400).json({ message: "Invalid Input" });

    const normalize = email.trim().toLowerCase();

    const user = await getUser(normalize);

    if (!user)
      return res.status(401).json({
        message: "Invalid email or password",
      });

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches)
      return res.status(401).json({
        message: "Invalid email or password",
      });

    const { password_hash, ...safeUser } = user;

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }

      req.session.user = {
        id: safeUser.id,
        username: safeUser.username,
        email: safeUser.email,
      };

      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        return res.status(200).json({
          message: "Login successful",
          data: safeUser,
        });
      });
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Login failed",
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
