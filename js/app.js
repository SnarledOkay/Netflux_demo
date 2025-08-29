import { Router } from "./router.js";
import { Api } from "./api.js";
import { qs, html } from "./utils.js";

const appEl = document.getElementById("app");
const navEl = document.getElementById("category-nav");

async function render() {
  const result = await Router.resolve();
  if (typeof result === "string") {
    appEl.innerHTML = result;
  } else {
    appEl.innerHTML = result.html || "";
    if (typeof result.onMount === "function") {
      // gọi sau khi DOM đã cắm vào trang
      result.onMount();
    }
  }
}

async function initNav() {
  const cats = await Api.getCategories();
  const hash = location.hash;
  const current = new URLSearchParams(hash.split("?")[1] || "").get("category");
  navEl.innerHTML = [
    `<a href="#/" class="${current ? "" : "active"}">Tất cả</a>`,
    ...cats.map(
      (c) =>
        `<a href="#/?category=${encodeURIComponent(c.slug || c.id)}" class="${
          (c.slug || c.id) === current ? "active" : ""
        }">${c.name}</a>`
    ),
  ].join("");
}

function initSearch() {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    location.hash = q ? `#/?q=${encodeURIComponent(q)}` : "#/";
  });
}

window.addEventListener("hashchange", () => {
  render();
  initNav();
});
window.addEventListener("load", async () => {
  await initNav();
  initSearch();
  await render();
});
