import express from "express";
import supabase from "./lib/supabase.js";

const app = express();

app.get("/test-db", async (req, res) => {
  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    return res.json({ error });
  }

  res.json({ data });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
