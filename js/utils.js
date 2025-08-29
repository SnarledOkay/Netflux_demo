export const qs = (sel, el = document) => el.querySelector(sel);
export const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];
export const html = (strings, ...vals) =>
  strings.map((s, i) => s + (vals[i] ?? "")).join("");
export const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
export const params = () =>
  new URLSearchParams(location.hash.split("?")[1] || "");
export const setHash = (path, p = {}) => {
  const usp = new URLSearchParams(p);
  location.hash = usp.toString() ? `${path}?${usp.toString()}` : path;
};
