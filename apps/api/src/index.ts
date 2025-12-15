import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API server is running" });
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
