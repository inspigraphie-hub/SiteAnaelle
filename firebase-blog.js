import { db } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const articlesQuery = query(collection(db, "blogArticles"), orderBy("order", "asc"));

onSnapshot(
  articlesQuery,
  (snapshot) => {
    if (snapshot.empty) return;
    const articles = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    }));
    window.FIREBASE_BLOG_ARTICLES = articles;
    const render = () => window.renderBlogArticles?.(articles);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  },
  (error) => {
    console.warn("Le blog Firebase est indisponible. Le contenu de secours reste affiché.", error);
  }
);
