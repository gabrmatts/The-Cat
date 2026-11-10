// Apenas animações: revelação ao rolar, cabeçalho e leve parallax nas imagens.
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: .12 });
document.querySelectorAll(".rv").forEach(el => reduce ? el.classList.add("in") : io.observe(el));
const header = document.querySelector("header"), frames = document.querySelectorAll(".frame i");
addEventListener("scroll", () => {
  header.classList.toggle("solid", scrollY > 40);
  if (!reduce) frames.forEach(f => { const r = f.getBoundingClientRect(); f.style.transform = `translateY(${(r.top - innerHeight / 2) * -.05}px)`; });
}, { passive: true });
// Fecha o menu lateral ao escolher um link
document.querySelectorAll("nav a").forEach(a => a.addEventListener("click", () => document.getElementById("menu").checked = false));