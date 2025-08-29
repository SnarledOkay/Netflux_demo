import { html, escape } from "../utils.js";

export const MovieCard = (m) => html`
  <a
    class="card"
    href="#/movie/${encodeURIComponent(m.id)}"
    title="${escape(m.title)}"
  >
    <img src="${escape(m.poster)}" alt="${escape(m.title)}" loading="lazy" />
    <div class="content">
      <div class="badge">
        ${escape(m.year)} • ${m.isSeries ? "Series" : m.durationMinutes + "′"}
      </div>
      <strong>${escape(m.title)}</strong>
      <div class="badge">${m.categories.map(escape).join(" • ")}</div>
    </div>
  </a>
`;
