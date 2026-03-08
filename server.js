import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ediRoutes from "./routes/ediRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", ediRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
