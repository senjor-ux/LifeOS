const express = require("express");
const pool = require("../config/db");
const requireAuth = require("../middleware/Auth");

const router = express.Router();


router.post('/', requireAuth, (req, res) => {
    
})

router.patch("/:id", requireAuth, (req, res) => {
    const proj_id = req.params.id
})

router.delete("/:id", requireAuth, (req, res) => {
    const proj_id = req.params.id
})