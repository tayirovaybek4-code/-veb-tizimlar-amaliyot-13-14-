"use strict";

function yoz(id, matn) {
  document.getElementById(id).textContent = matn;
}

const { protocol, host, hostname } = window.location;
const fayl = protocol === "file:";
const mahalliy = fayl || ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
const https = protocol === "https:";
yoz("manzil", host || "Mahalliy fayl");
yoz("himoya", https ? "HTTPS faol" : fayl ? "Fayl rejimi" : "HTTP ulanishi");
yoz("holat", mahalliy ? "Mahalliy" : https ? "Onlayn · HTTPS" : "Onlayn · HTTP");
document.getElementById("holat").classList.toggle("secure", https);

function ulanishniYangila() {
  const [navigatsiya] = performance.getEntriesByType("navigation");
  const kod = navigatsiya?.nextHopProtocol;
  const protokollar = { h2: "HTTP/2 (h2)", h3: "HTTP/3 (h3)", "http/1.1": "HTTP/1.1" };
  yoz("protokol", fayl ? "Qo‘llanilmaydi" : (protokollar[kod] ?? (kod || "Aniqlanmadi")));
  yoz("javob", !fayl && navigatsiya?.responseStart > 0 ? `${navigatsiya.responseStart.toFixed(1)} ms` : "—");
  yoz("yuklanish", navigatsiya?.loadEventEnd > 0 ? `${navigatsiya.loadEventEnd.toFixed(1)} ms` : "—");
}

document.getElementById("vaqtTugmasi").addEventListener("click", () => {
  const hozir = new Date();
  const sana = [hozir.getDate(), hozir.getMonth() + 1, hozir.getFullYear()]
    .map(qism => String(qism).padStart(2, "0")).join(".");
  const vaqt = hozir.toLocaleTimeString("uz-UZ", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  });
  yoz("vaqtMatni", `${sana} · ${vaqt}`);
});
window.addEventListener("load", () => setTimeout(ulanishniYangila, 0), { once: true });
