import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
