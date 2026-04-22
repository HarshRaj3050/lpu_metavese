const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.route');
const agoraRoutes = require('./routes/agora.route');

const cors = require("cors");
const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Support multiple origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];
if (CLIENT_URL && !allowedOrigins.includes(CLIENT_URL)) {
  allowedOrigins.push(CLIENT_URL);
}

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api/agora", agoraRoutes);

app.get("/", (req, res) => {
    res.send("Server working");
});


module.exports = app