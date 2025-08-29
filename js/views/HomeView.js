import { Api } from "../api.js";
import { html, params } from "../utils.js";
import { MovieCard } from "../components/MovieCard.js";

export const HomeView = async () => {
  const p = params();
  const q = p.get("q") || "";
  const category = p.get("category") || "";
  const page = Number(p.get("page") || 1);
  const size = Number(p.get("size") || 20);
  const listMode = p.get("list") === "1" || !!q; // khi search hoặc xem tất cả

  // --- MODE 1: List phẳng (khi search hoặc "Xem tất cả")
  if (listMode) {
    const { items, total } = await Api.getMovies({
      page,
      size,
      category,
      q,
      sort: "year_desc",
    });
    const pages = Math.ceil(total / size) || 1;

    return html`
      <h1>
        ${q
          ? `Kết quả: ${q}`
          : category
          ? `Thể loại: ${category}`
          : "Danh sách phim"}
      </h1>
      <div class="grid">${items.map(MovieCard).join("")}</div>
      <div class="pagination">
        ${Array.from({ length: pages }, (_, i) => i + 1)
          .map((i) => {
            const usp = new URLSearchParams({
              page: i,
              size,
              ...(category && { category }),
              ...(q && { q }),
              list: "1",
            });
            return `<a href="#/?${usp.toString()}" class="${
              i === page ? "active" : ""
            }">${i}</a>`;
          })
          .join("")}
      </div>
    `;
  }

  // --- MODE 2: Group theo thể loại (mặc định)
  const cats = await Api.getCategories();
  const usingCats = category
    ? cats.filter((c) => (c.slug || c.id) === category)
    : cats;

  // mỗi thể loại lấy 8 phim mới
  const perCat = 8;
  const sections = await Promise.all(
    usingCats.map(async (c) => {
      const { items } = await Api.getMovies({
        page: 1,
        size: perCat,
        category: c.slug || c.id,
        sort: "year_desc",
      });
      return { cat: c, items };
    })
  );

  return html`
    ${sections
      .map(({ cat, items }) =>
        items.length
          ? `
      <section class="section">
        <div class="section-header">
          <h2>${cat.name}</h2>
          <a class="see-all" href="#/?category=${encodeURIComponent(
            cat.slug || cat.id
          )}&list=1">Xem tất cả</a>
        </div>
        <div class="grid">
          ${items.map(MovieCard).join("")}
        </div>
      </section>
    `
          : ""
      )
      .join("")}
  `;
};
