require("dotenv").config({ path: ".env.local" });

const express = require("express");
const auth = require("./routes/Authentication")

const app = express();
const port = 3000;

app.use(express.json());
app.use('/auth', auth)

app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
