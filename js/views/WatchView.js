import { Api } from "../api.js";
import { html, params, escape } from "../utils.js";

export const WatchView = async (ctx) => {
  const { id } = ctx.params;
  const p = params();
  const episode = p.get("episode");

  const m = await Api.getMovieById(id);
  if (!m) return `<p>Không tìm thấy phim.</p>`;

  const payload = await Api.getSources(id, episode);

  // chuẩn hoá items (phim lẻ hoặc series)
  let items = [];
  if (Array.isArray(payload?.items)) {
    items = payload.items;
  } else if (Array.isArray(payload?.episodes)) {
    const epObj = episode
      ? payload.episodes.find((e) => String(e.episode) === String(episode))
      : payload.episodes[0];
    items = epObj?.items || [];
  }

  const title = m.isSeries && episode ? `${m.title} — Tập ${episode}` : m.title;
  const hls = items.find((s) => s.type === "hls");
  const mp4s = items.filter((s) => s.type === "mp4");

  const htmlStr = html`
    <h1>${escape(title)}</h1>
    ${m.isSeries
      ? `
      <div class="episodes" style="margin-bottom:12px">
        ${m.episodes
          .map(
            (ep) => `
          <a class="${
            String(ep.episode) === String(episode || 1) ? "active" : ""
          }"
             href="#/watch/${encodeURIComponent(m.id)}?episode=${ep.episode}">
             ${ep.episode}
          </a>`
          )
          .join("")}
      </div>`
      : ""}

    <div class="player">
      <video
        id="player"
        controls
        playsinline
        muted
        preload="metadata"
        style="width:100%;aspect-ratio:16/9;height:auto;"
        poster="${escape(m.poster || "")}"
      ></video>
    </div>

    <div style="margin-top:8px;" class="episodes">
      ${mp4s
        .map(
          (s) =>
            `<a data-src="${escape(s.url)}" class="quality">${escape(
              s.quality || "MP4"
            )}</a>`
        )
        .join("")}
      ${hls
        ? `<a data-src="${escape(hls.url)}" class="quality">${escape(
            hls.quality || "HLS"
          )}</a>`
        : ""}
    </div>
    <div id="player-tip" class="badge" style="margin-top:6px;"></div>
  `;

  return {
    html: htmlStr,
    onMount() {
      const video = document.getElementById("player");
      const tip = document.getElementById("player-tip");
      let hlsInst = null;

      function loadScript(src) {
        return new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = src;
          s.onload = res;
          s.onerror = () => rej(new Error("load fail " + src));
          document.head.appendChild(s);
        });
      }
      async function ensureHls() {
        if (window.Hls) return;
        await loadScript(
          "https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js"
        );
      }

      async function playSrc(src) {
        if (!src) {
          tip.textContent = "Không có nguồn phát.";
          return;
        }
        if (hlsInst?.destroy) {
          try {
            hlsInst.destroy();
          } catch {}
          hlsInst = null;
        }
        tip.textContent = "";

        const isM3u8 = /\.m3u8(?:\?|$)/i.test(src);

        if (isM3u8) {
          video.setAttribute("crossorigin", "anonymous"); // HLS thường cần CORS
          await ensureHls();
          if (window.Hls?.isSupported()) {
            hlsInst = new window.Hls();
            hlsInst.loadSource(src);
            hlsInst.attachMedia(video);
            hlsInst.on(window.Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch((err) => {
                tip.textContent = "Nhấn Play để xem.";
                console.warn(err);
              });
            });
            hlsInst.on(window.Hls.Events.ERROR, (_, data) => {
              console.warn("HLS error:", data);
              tip.textContent = "Lỗi HLS. Thử chọn MP4.";
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.play().catch((err) => {
              tip.textContent = "Nhấn Play để xem.";
              console.warn(err);
            });
          } else {
            tip.textContent = "Trình duyệt không hỗ trợ HLS. Chọn MP4.";
          }
        } else {
          // MP4 cross-origin: không ép CORS
          video.removeAttribute("crossorigin");
          video.src = src;
          video.play().catch((err) => {
            tip.textContent = "Nhấn Play để xem.";
            console.warn(err);
          });
        }
      }

      // chọn chất lượng đầu tiên
      const first = document.querySelector(".quality");
      if (first) {
        first.classList.add("active");
        playSrc(first.getAttribute("data-src"));
      }

      // đổi chất lượng
      document.querySelectorAll(".quality").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          document
            .querySelectorAll(".quality")
            .forEach((x) => x.classList.remove("active"));
          el.classList.add("active");
          playSrc(el.getAttribute("data-src"));
        });
      });

      // log/trợ giúp
      video.addEventListener("error", () => {
        console.warn("video error:", video.error);
        tip.textContent =
          "Không phát được video (kiểm tra CORS/MIME hoặc thử nguồn khác).";
      });
    },
  };
};
