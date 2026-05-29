import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/database";
import authRoutes from "./routes/auth.routes";
import playerRoutes from "./routes/player.routes";
import matchReportRoutes from "./routes/matchReport.routes";
import clubRoutes from "./routes/club.routes";
import setupSwagger from "./config/swagger";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", project: "ClubSync" });
});

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/match-reports", matchReportRoutes);
app.use("/api/club", clubRoutes);

setupSwagger(app);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 ClubSync running on port ${PORT}`);
  });
});

export default app;
