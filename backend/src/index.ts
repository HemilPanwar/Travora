import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import tripRoutes from "./routes/trips";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

export const prisma = new PrismaClient({ log: ["query"] });

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
