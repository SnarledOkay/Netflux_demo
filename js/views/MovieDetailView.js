import { Api } from "../api.js";
import { html, escape } from "../utils.js";

export const MovieDetailView = async (ctx) => {
  const { id } = ctx.params;
  const m = await Api.getMovieById(id);
  if (!m) return `<p>Không tìm thấy phim.</p>`;

  return html`
    <div class="movie-hero">
      <img src="${escape(m.poster)}" alt="${escape(m.title)}" />
      <div>
        <h1>${escape(m.title)}</h1>
        <div class="movie-meta">
          ${m.year} • ${m.isSeries ? "Series" : m.durationMinutes + "′"} •
          ${m.categories.join(" • ")} ${m.rating ? ` • ★ ${m.rating}` : ""}
        </div>
        <p>${escape(m.description)}</p>
        ${m.isSeries
          ? `
          <h3>Tập</h3>
          <div class="episodes">
            ${m.episodes
              .map(
                (ep) => `
              <a href="#/watch/${encodeURIComponent(m.id)}?episode=${
                  ep.episode
                }">${ep.episode}. ${escape(ep.name)}</a>
            `
              )
              .join("")}
          </div>
        `
          : `
          <a class="episodes" href="#/watch/${encodeURIComponent(
            m.id
          )}"><strong>▶ Xem ngay</strong></a>
        `}
      </div>
    </div>
    <h3>Thể loại</h3>
    <div class="episodes">
      ${m.categories
        .map((c) => `<a href="#/?category=${encodeURIComponent(c)}">${c}</a>`)
        .join("")}
    </div>
  `;
};
