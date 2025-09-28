require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodroutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const ratingRoutes = require("./routes/ratingsRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express(); // ✅ Define 'app' before using it




app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images
app.use("/api/comments", commentRoutes);



app.use("/api/auth", authRoutes); // ✅ Moved after 'app' definition
app.use("/api", foodRoutes);
app.use("/api", restaurantRoutes);
app.use("/api/ratings", ratingRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("🔍 Checking MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
