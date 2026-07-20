require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const examRoutes = require("./routes/examRoutes");
const feeRoutes = require("./routes/feeRoutes");
const miscRoutes = require("./routes/miscRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const messageRoutes = require("./routes/messageRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URLS ? process.env.CLIENT_URLS.split(",") : "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ success: true, message: "AI-Powered School ERP & LMS API is running" }));
app.get("/api/health", (req, res) => res.json({ success: true, status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api", miscRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`));

module.exports = app;
