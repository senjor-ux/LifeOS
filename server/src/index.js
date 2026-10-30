require('dotenv').config({
    path: require('path').resolve(__dirname, '../.env.local')
});
const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

const pool = require("./config/db");
const auth = require("./routes/Authentication");
const tasks = require("./routes/Tasks")


const app = express();
const port = 3000;

app.use(express.json());



app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),

    secret: `${process.env.SECRET_CODE}`,
    resave: false,
    saveUninitialized: false,

    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);

app.use("/auth", auth);
app.use("/task", tasks)

app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
