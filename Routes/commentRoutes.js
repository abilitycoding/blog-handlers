const express = require("express");
const db = require("../Config/db");

const router = express.Router();

// Add Comment
router.post("/", async (req, res) => {
  const { articleId, content } = req.body;

  if (!articleId || !content) {
    return res
      .status(400)
      .json({ message: "Article ID and content are required." });
  }

  try {
    // Check if the article exists
    const [articleCheck] = await db.query(
      "SELECT id FROM articles WHERE id = ?",
      [articleId]
    );
    if (articleCheck.length === 0) {
      return res.status(404).json({ message: "Article not found." });
    }

    // Insert the comment
    const [result] = await db.query(
      "INSERT INTO comments (article_id, content, created_at) VALUES (?, ?, NOW())",
      [articleId, content]
    );

    res.status(201).json({
      message: "Comment added successfully.",
      commentId: result.insertId
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Database error." });
  }
});

// Delete Comment
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "Valid comment ID is required." });
  }

  try {
    const [result] = await db.query("DELETE FROM comments WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Database error." });
  }
});

module.exports = router;
