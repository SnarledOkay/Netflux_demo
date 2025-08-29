const USE_MOCK = true; // đổi sang false khi backend sẵn sàng
const API_BASE = "/api"; // khi dùng backend Spring, giữ nguyên
const MOCK_BASE = "./mock";

const delay = (ms) => new Promise((r) => setTimeout(r, ms)); // mô phỏng network (tùy)

export const Api = {
  async getCategories() {
    if (USE_MOCK) {
      const res = await fetch(`${MOCK_BASE}/categories.json`);
      const data = await res.json();
      return data.items;
    }
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    return data.items;
  },

  /**
   * movies list: lọc + phân trang client (mock). Backend sẽ trả sẵn phân trang.
   * query: { page=1, size=20, category, q, sort }
   */
  async getMovies(query = {}) {
    if (USE_MOCK) {
      const res = await fetch(`${MOCK_BASE}/movies.json`);
      const raw = await res.json();
      let items = raw.items;

      if (query.category) {
        items = items.filter((m) => m.categories.includes(query.category));
      }
      if (query.q) {
        const k = query.q.toLowerCase();
        items = items.filter((m) => m.title.toLowerCase().includes(k));
      }
      if (query.sort === "year_desc")
        items = items.sort((a, b) => b.year - a.year);
      if (query.sort === "year_asc")
        items = items.sort((a, b) => a.year - b.year);

      const page = Number(query.page || 1);
      const size = Number(query.size || 20);
      const total = items.length;
      const start = (page - 1) * size;
      const paged = items.slice(start, start + size);

      return { page, size, total, items: paged };
    }

    const usp = new URLSearchParams(query);
    const res = await fetch(`${API_BASE}/movies?` + usp.toString());
    return res.json();
  },

  async getMovieById(id) {
    if (USE_MOCK) {
      const res = await fetch(`${MOCK_BASE}/movies.json`);
      const { items } = await res.json();
      return items.find((m) => m.id === id);
    }
    const res = await fetch(`${API_BASE}/movies/${id}`);
    return res.json();
  },

  // For series: episode optional => chọn episode cụ thể
  async getSources(movieId, episode) {
    if (USE_MOCK) {
      const res = await fetch(`${MOCK_BASE}/sources/${movieId}.json`);
      const data = await res.json();
      if (data.items) return data; // phim lẻ
      if (data.episodes) {
        if (!episode) return data.episodes[0];
        return (
          data.episodes.find((e) => String(e.episode) === String(episode)) ||
          data.episodes[0]
        );
      }
      return { items: [] };
    }
    const usp = new URLSearchParams();
    if (episode) usp.set("episode", episode);
    const url = usp.toString()
      ? `${API_BASE}/movies/${movieId}/sources?${usp.toString()}`
      : `${API_BASE}/movies/${movieId}/sources`;
    const res = await fetch(url);
    return res.json();
  },

  //
};
