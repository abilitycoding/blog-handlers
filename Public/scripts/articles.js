document.addEventListener("DOMContentLoaded", () => {
  fetchArticles();

  const articleForm = document.getElementById("article-form");
  if (articleForm) {
    articleForm.addEventListener("submit", handleArticleSubmit);
  }

  const logoutButton = document.getElementById("logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }
});

// Fetch all articles
async function fetchArticles() {
  try {
    const response = await fetch("/api/articles");
    const articlesList = document.getElementById("articles-list");

    if (response.ok) {
      const articles = await response.json();
      articlesList.innerHTML = "";

      articles.forEach((article) => {
        const articleDiv = document.createElement("div");
        articleDiv.className = "article";
        articleDiv.innerHTML = `
          <h3>${article.title}</h3>
          <p>${article.content}</p>
          <button class="btn1" onclick="likeArticle(${article.id})">Like (${
          article.likes || 0
        })</button>
          <button class="btn1" onclick="viewComments(${article.id})">View Comments</button>
          <button class="btn1" onclick="editArticle(${article.id})">Edit</button>
          <button class="btn1" onclick="deleteArticle(${article.id})">Delete</button>
        `;
        articlesList.appendChild(articleDiv);
      });
    } else {
      articlesList.innerHTML = "<p>Failed to load articles.</p>";
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
}

async function fetchArticleDetails(articleId) {
  try {
    const response = await fetch(`/api/articles/${articleId}`);
    if (response.ok) {
      const article = await response.json();
      document.getElementById("article-title").textContent = article.title;
      document.getElementById("article-content").textContent = article.content;
    } else if (response.status === 404) {
      alert("Article not found!");
      window.location.href = "/articles"; // Redirect to articles page
    } else {
      alert("Failed to load article details.");
    }
  } catch (error) {
    console.error("Error fetching article details:", error);
    alert("An error occurred while fetching article details.");
  }
}

// Submit a new article
async function handleArticleSubmit(event) {
  event.preventDefault();

  const title = document.getElementById("article-title").value.trim();
  const content = document.getElementById("article-content").value.trim();

  if (!title || !content) {
    alert("Title and content are required!");
    return;
  }

  try {
    const response = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      alert("Article added successfully!");
      fetchArticles();
      event.target.reset();
    } else {
      alert("Failed to add article.");
    }
  } catch (error) {
    console.error("Error adding article:", error);
  }
}

// Like an article
async function likeArticle(articleId) {
  try {
    const response = await fetch(`/api/articles/${articleId}/like`, {
      method: "POST"
    });

    if (response.ok) {
      alert("Article liked!");
      fetchArticles(); // Refresh the articles list to update the like count
    } else {
      alert("Failed to like article.");
    }
  } catch (error) {
    console.error("Error liking article:", error);
  }
}

// View comments for an article
function viewComments(articleId) {
  window.location.href = `/comments?id=${articleId}`;
}

// Edit an article
async function editArticle(articleId) {
  const title = prompt("Enter new title:");
  const content = prompt("Enter new content:");

  if (!title || !content) return;

  try {
    const response = await fetch(`/api/articles/${articleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    });

    if (response.ok) {
      alert("Article updated successfully!");
      fetchArticles();
    } else {
      alert("Failed to update article.");
    }
  } catch (error) {
    console.error("Error updating article:", error);
  }
}

// Delete an article
async function deleteArticle(articleId) {
  const confirmDelete = confirm("Are you sure you want to delete this article?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });

    if (response.ok) {
      alert("Article and its comments deleted successfully!");
      fetchArticles(); // Refresh the articles list
    } else {
      const data = await response.json();
      alert(data.message || "Failed to delete article.");
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    alert("An error occurred while deleting the article.");
  }
}

// Handle user logout
async function handleLogout() {
  try {
    const response = await fetch("/api/users/logout", { method: "POST" });

    if (response.ok) {
      alert("Logged out successfully!");
      window.location.href = "/login";
    } else {
      alert("Logout failed.");
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
}
