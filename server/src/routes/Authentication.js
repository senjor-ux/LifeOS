const express = require("express");
const requireAuth = require("../middleware/Auth");
const {
  registerUser,
  loginUser,
  logoutUser,
  profile,
} = require("../controllers/AuthController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", requireAuth, profile);
router.post("/logout", requireAuth, logoutUser);

module.exports = router;
