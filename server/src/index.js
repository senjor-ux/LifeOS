require('dotenv').config({
    path: require('path').resolve(__dirname, '../.env.local')
});

// packages
const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);


// files
const pool = require("./config/db");
const auth = require("./routes/Authentication");
const tasks = require("./routes/Tasks")

// launching stuff
const app = express();
const port = 3000;

app.use(express.json());

// auto login after refresh, session expires after 1 week and youll have to login manualy
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

// endpoints
app.use("/auth", auth);
app.use("/task", tasks)


// start server
app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
