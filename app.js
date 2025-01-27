const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
const exphbs = require("express-handlebars"); // Add this

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5000",
    credentials: true
  })
);

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

// Set Handlebars as the view engine
app.engine(
  "handlebars",
  exphbs.engine({ defaultLayout: "main", extname: ".handlebars" })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "Views")); // Handlebars templates in `Views`

// Serve static files
app.use("/styles", express.static(path.join(__dirname, "Public", "styles")));
app.use("/scripts", express.static(path.join(__dirname, "Public", "scripts")));

// Routes
const articleRoutes = require("./Routes/articleRoutes");
const userRoutes = require("./Routes/userRoutes");
const commentRoutes = require("./Routes/commentRoutes");

// API routes
app.use("/api/articles", articleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

// Render Handlebars templates
app.get("/", (req, res) => {
  res.render("login", { title: "Login - Blogging Platform" });
});

app.get("/register", (req, res) => {
  res.render("register", { title: "Register - Blogging Platform" });
});

app.get("/articles", (req, res) => {
  res.render("articles", {
    title: "Articles - Blogging Platform",
    articles: [] // Pass dynamic data if available
  });
});

app.get("/comments", (req, res) => {
  res.render("comments", {
    title: "Comments - Blogging Platform",
    article: {}, // Pass article data
    comments: [] // Pass dynamic comments
  });
});

// Test session route
app.get("/api/session", (req, res) => {
  if (req.session.user) {
    res.json({ session: req.session.user });
  } else {
    res.status(401).json({ message: "No active session." });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
