import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
