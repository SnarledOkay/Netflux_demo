import { HomeView } from "./views/HomeView.js";
import { MovieDetailView } from "./views/MovieDetailView.js";
import { WatchView } from "./views/WatchView.js";

const routes = [
  { path: /^#\/?$/, view: HomeView },
  { path: /^#\/\?/, view: HomeView }, // có query
  { path: /^#\/movie\/([^/?#]+)/, view: MovieDetailView, params: ["id"] },
  { path: /^#\/watch\/([^/?#]+)/, view: WatchView, params: ["id"] },
];

export const Router = {
  async resolve() {
    const hash = location.hash || "#/";
    for (const r of routes) {
      const m = hash.match(r.path);
      if (m) {
        const ctx = { params: {} };
        (r.params || []).forEach(
          (name, i) => (ctx.params[name] = decodeURIComponent(m[i + 1]))
        );
        return r.view(ctx);
      }
    }
    return `<p>404 Not Found</p>`;
  },
};
