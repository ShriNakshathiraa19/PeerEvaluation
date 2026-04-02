import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from 'express';

import connectDB from "./config/db.js";

import studentRoutes from "./routes/student/student.routes.js";
import authRoutes from './routes/authorization/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});