import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", project: "ClubSync" });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 ClubSync running on port ${PORT}`);
  });
});

export default app;
