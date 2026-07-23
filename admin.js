(function () {
  "use strict";

  const loginPanel = document.querySelector("#login-panel");
  const editorPanel = document.querySelector("#editor-panel");
  const loginStatus = document.querySelector("#login-status");
  const status = document.querySelector("#admin-status");
  const editor = document.querySelector("#article-editor");
  const loginForm = document.querySelector("#login-form");
  let articles = [];
  let loadedForUser = null;

  const firebaseConfig = {
    apiKey: "AIzaSyCp4FOcmY1wzh2vrkGmrfQIBHcnNmRgRQ8",
    authDomain: "anaelle-25eef.firebaseapp.com",
    projectId: "anaelle-25eef",
    storageBucket: "anaelle-25eef.firebasestorage.app",
    messagingSenderId: "997189141013",
    appId: "1:997189141013:web:193eabfc60b36b6b9d841c"
  };

  if (!window.firebase) {
    loginStatus.textContent =
      "Firebase n’a pas pu se charger. Vérifiez votre connexion Internet puis rechargez la page.";
    return;
  }

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const setStatus = (message, isError) => {
    status.textContent = message;
    status.style.color = isError ? "#9a2f2f" : "";
  };

  const articlePayload = (article, index) => ({
    category: article.category || "Culture",
    title: (article.title || "").trim() || "Article sans titre",
    intro: (article.intro || "").trim(),
    meta: (article.meta || "").trim() || "Article · 5 min",
    paragraphs: Array.isArray(article.paragraphs) ? article.paragraphs : [],
    order: index,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  const syncArticle = (index, field, value) => {
    if (field === "paragraphs") {
      articles[index].paragraphs = value
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    } else {
      articles[index][field] = value;
    }
  };

  const render = () => {
    editor.innerHTML = "";
    articles.forEach((article, index) => {
      const card = document.createElement("section");
      card.className = "article-admin";
      card.innerHTML =
        '<div class="article-admin-head"><h2>Article ' + (index + 1) + "</h2>" +
        '<button type="button" data-delete>Supprimer</button></div>' +
        '<div class="two-columns"><div><label>Catégorie</label>' +
        '<select data-field="category">' +
        ["Livres", "Culture", "Patrimoine", "Médiation"].map((category) =>
          "<option" + (article.category === category ? " selected" : "") + ">" +
          category + "</option>"
        ).join("") + "</select></div>" +
        '<div><label>Indication de lecture</label><input data-field="meta" value="' +
        escapeHtml(article.meta) + '"></div></div>' +
        '<label>Titre</label><input data-field="title" value="' + escapeHtml(article.title) + '">' +
        '<label>Introduction</label><textarea data-field="intro">' + escapeHtml(article.intro) + "</textarea>" +
        '<label>Paragraphes — laissez une ligne vide entre chaque paragraphe</label>' +
        '<textarea class="paragraphs" data-field="paragraphs">' +
        escapeHtml((article.paragraphs || []).join("\n\n")) + "</textarea>";

      card.querySelectorAll("[data-field]").forEach((field) => {
        field.addEventListener("input", () =>
          syncArticle(index, field.dataset.field, field.value)
        );
      });
      card.querySelector("[data-delete]").addEventListener("click", async () => {
        if (!confirm("Supprimer définitivement cet article ?")) return;
        try {
          if (article.id) await db.collection("blogArticles").doc(article.id).delete();
          articles.splice(index, 1);
          render();
          setStatus("Article supprimé. Le site va se mettre à jour.");
        } catch (error) {
          setStatus("Suppression impossible : " + error.message, true);
        }
      });
      editor.append(card);
    });
  };

  const loadArticles = async () => {
    setStatus("Chargement des articles…");
    try {
      const snapshot = await db.collection("blogArticles").orderBy("order", "asc").get();
      articles = snapshot.empty
        ? JSON.parse(JSON.stringify(window.BLOG_ARTICLES || []))
        : snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      render();
      setStatus(
        snapshot.empty
          ? "La base est vide. Les articles actuels sont prêts à être enregistrés."
          : "Articles synchronisés avec Firestore."
      );
    } catch (error) {
      setStatus("Chargement impossible : " + error.message, true);
    }
  };

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const identifier = document.querySelector("#admin-identifier").value.trim();
    const password = document.querySelector("#admin-password").value;
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (identifier !== "anaelleSG") {
      loginStatus.textContent = "Identifiant incorrect.";
      return;
    }

    loginStatus.textContent = "Connexion en cours…";
    submitButton.disabled = true;
    try {
      await auth.signInWithEmailAndPassword(
        "anaellesg@anaelle-25eef.firebaseapp.com",
        password
      );
      loginStatus.textContent = "";
    } catch (error) {
      console.error("Firebase Authentication:", error.code);
      const messages = {
        "auth/invalid-credential": "Identifiant ou mot de passe incorrect.",
        "auth/unauthorized-domain": "Cette adresse du site doit être autorisée dans Firebase Authentication.",
        "auth/network-request-failed": "Connexion à Firebase impossible. Vérifiez votre accès Internet."
      };
      loginStatus.textContent =
        messages[error.code] || "Connexion refusée (" + error.code + ").";
    } finally {
      submitButton.disabled = false;
    }
  });

  document.querySelector("#add-article").addEventListener("click", () => {
    articles.unshift({
      category: "Culture",
      title: "Titre du nouvel article",
      intro: "Courte introduction de l’article.",
      meta: "Article · 5 min",
      paragraphs: ["Premier paragraphe de l’article."]
    });
    render();
    window.scrollTo({ top: editor.offsetTop - 90, behavior: "smooth" });
  });

  document.querySelector("#save-all").addEventListener("click", async () => {
    setStatus("Enregistrement dans Firestore…");
    try {
      const batch = db.batch();
      articles.forEach((article, index) => {
        const reference = article.id
          ? db.collection("blogArticles").doc(article.id)
          : db.collection("blogArticles").doc();
        article.id = reference.id;
        batch.set(reference, articlePayload(article, index));
      });
      await batch.commit();
      setStatus("Modifications publiées. Le blog est à jour.");
    } catch (error) {
      setStatus("Enregistrement impossible : " + error.message, true);
    }
  });

  document.querySelector("#logout").addEventListener("click", () => auth.signOut());

  auth.onAuthStateChanged(async (user) => {
    loginPanel.hidden = Boolean(user);
    editorPanel.hidden = !user;
    if (user && loadedForUser !== user.uid) {
      loadedForUser = user.uid;
      await loadArticles();
    }
    if (!user) {
      loadedForUser = null;
      articles = [];
      editor.innerHTML = "";
    }
  });
})();
