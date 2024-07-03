const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3001;
const SECRET_KEY = "your_secret_key";

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Load users data
const loadUsers = () => {
  const data = fs.readFileSync("users.json");
  return JSON.parse(data);
};

// Save users data
const saveUsers = (users) => {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
};

// Routes
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  let users = loadUsers();
  users.push({ username, password });
  saveUsers(users);
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  let users = loadUsers();
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const token = jwt.sign({ username: user.username }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.cookie("auth_token", token);
    res.redirect("/user");
  } else {
    res.redirect("/login");
  }
});

app.get("/user", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.redirect("/login");
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.redirect("/login");
    }

    res.render("user", { username: decoded.username });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
