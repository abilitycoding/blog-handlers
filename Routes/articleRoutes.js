const express = require("express");
const db = require("../Config/db");

const router = express.Router();

// Fetch all articles
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM articles ORDER BY created_at DESC"
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ message: "Database error." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query("SELECT * FROM articles WHERE id = ?", [
      id
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Article not found." });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({ message: "Database error." });
  }
});

// Fetch Comments for an Article
router.get("/:articleId/comments", async (req, res) => {
  const { articleId } = req.params;

  if (!articleId) {
    return res.status(400).json({ message: "Article ID is required." });
  }

  try {
    const [results] = await db.query(
      "SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC",
      [articleId]
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this article." });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Database error." });
  }
});

// Add a new article
router.post("/", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO articles (title, content) VALUES (?, ?)",
      [title, content]
    );
    res.status(201).json({
      message: "Article added successfully.",
      articleId: result.insertId
    });
  } catch (err) {
    console.error("Error adding article:", err);
    res.status(500).json({ message: "Database error." });
  }
});

// Like an article
router.post("/:id/like", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE articles SET likes = likes + 1 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Article not found." });
    }

    res.status(200).json({ message: "Article liked successfully." });
  } catch (err) {
    console.error("Error liking article:", err);
    res.status(500).json({ message: "Database error." });
  }
});

// Edit an article
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    const [result] = await db.query(
      "UPDATE articles SET title = ?, content = ? WHERE id = ?",
      [title, content, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Article not found." });
    }

    res.status(200).json({ message: "Article updated successfully." });
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({ message: "Database error." });
  }
});

// Delete an article
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Delete associated comments
    await db.query("DELETE FROM comments WHERE article_id = ?", [id]);

    // Delete the article
    const [result] = await db.query("DELETE FROM articles WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Article not found." });
    }

    res
      .status(200)
      .json({ message: "Article and its comments deleted successfully." });
  } catch (err) {
    console.error("Error deleting article:", err);
    res.status(500).json({ message: "Database error." });
  }
});

module.exports = router;
