document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");

  if (!articleId) {
    // Alert and redirect if no article ID is found in the URL
    alert("No article selected!");
    window.location.href = "/articles";
    return;
  }

  fetchArticleDetails(articleId);
  fetchComments(articleId);

  const commentForm = document.getElementById("comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", (event) =>
      handleCommentSubmit(event, articleId)
    );
  }
});

async function fetchArticleDetails(articleId) {
  try {
    const response = await fetch(`/api/articles/${articleId}`);
    if (response.ok) {
      const article = await response.json();
      document.getElementById("article-title").textContent = article.title;
      document.getElementById("article-content").textContent = article.content;
    } else if (response.status === 404) {
      alert("Article not found!");
      window.location.href = "/articles";
    } else {
      alert("Failed to load article details.");
    }
  } catch (error) {
    console.error("Error fetching article details:", error);
    alert("An error occurred while fetching article details.");
  }
}

async function fetchComments(articleId) {
  try {
    const response = await fetch(`/api/articles/${articleId}/comments`);
    const commentsList = document.getElementById("comments-list");

    if (response.ok) {
      const comments = await response.json();
      commentsList.innerHTML = "";

      if (comments.length > 0) {
        comments.forEach((comment) => {
          const commentDiv = document.createElement("div");
          commentDiv.className = "comment";
          commentDiv.innerHTML = `
            <p>${comment.content}</p>
            <small>${new Date(comment.created_at).toLocaleString()}</small>
          `;
          commentsList.appendChild(commentDiv);
        });
      } else {
        commentsList.innerHTML =
          "<p>No comments yet. Be the first to comment!</p>";
      }
    } else if (response.status === 404) {
      alert("No comments found for this article.");
      commentsList.innerHTML = "<p>No comments found for this article.</p>";
    } else {
      commentsList.innerHTML = "<p>Failed to load comments.</p>";
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    commentsList.innerHTML =
      "<p>An error occurred while fetching comments.</p>";
  }
}

async function handleCommentSubmit(event, articleId) {
  event.preventDefault();

  const commentContent = document
    .getElementById("comment-content")
    .value.trim();

  if (!commentContent) {
    alert("Comment cannot be empty!");
    return;
  }

  try {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, content: commentContent })
    });

    if (response.ok) {
      alert("Comment added successfully!");
      document.getElementById("comment-form").reset();
      fetchComments(articleId); // Reload comments
    } else {
      const data = await response.json();
      alert(data.message || "Failed to add comment.");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("An error occurred while adding the comment.");
  }
}

async function deleteComment(commentId, articleId) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this comment?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Comment deleted successfully!");
      fetchComments(articleId); // Reload comments
    } else if (response.status === 404) {
      alert("Comment not found. It may have already been deleted.");
    } else {
      alert("Failed to delete comment.");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    alert("An error occurred while deleting the comment.");
  }
}
