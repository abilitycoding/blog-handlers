const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../Config/db");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const { username, password, realName, dob, bio } = req.body;

  // Validate inputs
  if (!username || !password || !realName || !dob) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Insert user into the database
    const query = `INSERT INTO users (username, password_hash, real_name, dob, bio) VALUES (?, ?, ?, ?, ?)`;
    const values = [username, hash, realName, dob, bio];

    await db.query(query, values);
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    // Handle duplicate username error
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "User already registered. Please use a different username."
      });
    }

    // Handle other errors
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Both username and password are required." });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE username = ?", [
      username
    ]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      // Set session user data
      req.session.user = { id: user.id, username: user.username };
      return res
        .status(200)
        .json({ message: "Login successful.", user: req.session.user });
    } else {
      return res.status(401).json({ message: "Invalid username or password." });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/test-session", (req, res) => {
  if (req.session.user) {
    res.json({ session: req.session.user });
  } else {
    res.json({ message: "No session found." });
  }
});


// Logout User
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: "Logout failed." });
    } else {
      res.status(200).json({ message: "Logout successful." });
    }
  });
});

// Edit User Info
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { username, realName, dob, bio, avatar } = req.body;

  if (!username || !realName || !dob) {
    return res.status(400).json({
      message: "Username, real name, and date of birth are required."
    });
  }

  db.query(
    "UPDATE users SET username = ?, real_name = ?, dob = ?, bio = ?, avatar = ? WHERE id = ?",
    [username, realName, dob, bio, avatar, id],
    (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error." });
      }
      res.status(200).json({ message: "User updated successfully." });
    }
  );
});

// Delete User
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  });
});

module.exports = router;
