"use strict";

const forma = document.getElementById("talabaForma");
const jadval = document.getElementById("jadvalTana");
const qidiruv = document.getElementById("qidiruv");
const saralash = document.getElementById("saralash");
const xabar = document.getElementById("xabar");
const bekor = document.getElementById("bekor");
const oyna = document.getElementById("ochirishOynasi");
const saralovchilar = {
  yangi: (a, b) => b.id - a.id,
  yuqori: (a, b) => b.baho - a.baho,
  past: (a, b) => a.baho - b.baho,
  fio: (a, b) => a.fio.localeCompare(b.fio, "uz")
};
let talabalar = [];
let tahrirId = null;
let ochirishId = null;

function bildirish(matn, xato = false) {
  xabar.textContent = matn;
  xabar.classList.toggle("error", xato);
}

function qidiruvMatni(matn) {
  return matn.toLocaleLowerCase("uz").replace(/[ʻʼ‘’`]/g, "'");
}

function tugma(matn, klass, amal, talaba) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = klass;
  element.dataset.amal = amal;
  element.dataset.id = talaba.id;
  element.setAttribute("aria-label", `${matn} · ${talaba.fio}`);
  element.textContent = matn;
  return element;
}

function korsat() {
  const izlanayotgan = qidiruvMatni(qidiruv.value.trim());
  const topilganlar = talabalar.filter(({ fio, guruh, fan }) =>
    qidiruvMatni(`${fio} ${guruh} ${fan}`).includes(izlanayotgan)
  ).sort(saralovchilar[saralash.value]);

  const jami = talabalar.length;
  const ballarYigindisi = talabalar.reduce((yigindi, talaba) => yigindi + talaba.baho, 0);
  document.getElementById("jamiSoni").textContent = jami;
  document.getElementById("ortachaBaho").textContent = jami ? (ballarYigindisi / jami).toFixed(1) : "0";
  document.getElementById("qatnashganlar").textContent = talabalar.filter(talaba => talaba.davomat === "Qatnashdi").length;
  document.getElementById("natija").textContent = `${topilganlar.length} ta yozuv`;

  jadval.replaceChildren();
  if (!topilganlar.length) {
    const katak = jadval.insertRow().insertCell();
    katak.colSpan = 8;
    katak.className = "empty";
    katak.textContent = jami ? "Qidiruvga mos yozuv topilmadi." : "Hozircha talabalar kiritilmadi.";
    return;
  }

  topilganlar.forEach((talaba, indeks) => {
    const qator = jadval.insertRow();
    const { fio, guruh, fan, baho, holat, davomat } = talaba;
    [indeks + 1, fio, guruh, fan, baho, holat, davomat].forEach(qiymat => {
      qator.insertCell().textContent = qiymat;
    });
    const amallar = document.createElement("div");
    amallar.className = "row-actions";
    amallar.append(
      tugma("Tahrirlash", "secondary", "tahrir", talaba),
      tugma("O‘chirish", "danger", "ochir", talaba)
    );
    qator.insertCell().append(amallar);
  });
}

function formaRejimi(talaba = null) {
  tahrirId = talaba?.id ?? null;
  forma.reset();
  if (talaba) {
    for (const nom of ["fio", "guruh", "fan", "baho", "holat", "davomat"]) {
      forma.elements.namedItem(nom).value = talaba[nom];
    }
  }
  document.getElementById("formaSarlavha").textContent = talaba ? "Talabani tahrirlash" : "Yangi talaba";
  document.getElementById("saqlash").textContent = talaba ? "O‘zgarishlarni saqlash" : "+ Saqlash";
  bekor.hidden = !talaba;
}

function yuklash() {
  try {
    talabalar = TalabalarOmbori.oqish();
  } catch {
    bildirish("Saqlangan yozuvlarni o‘qib bo‘lmadi. Brauzer xotirasi sozlamalarini tekshiring.", true);
  }
  korsat();
}

forma.addEventListener("submit", hodisa => {
  hodisa.preventDefault();
  try {
    const tahrir = tahrirId !== null;
    talabalar = TalabalarOmbori.saqlash(Object.fromEntries(new FormData(forma)), tahrirId);
    formaRejimi();
    korsat();
    bildirish(tahrir ? "O‘zgarishlar saqlandi." : "Talaba ro‘yxatga qo‘shildi.");
  } catch (xato) {
    bildirish(xato instanceof DOMException ? "Brauzer xotirasiga yozib bo‘lmadi." : xato.message, true);
  }
});

bekor.addEventListener("click", () => {
  formaRejimi();
  bildirish("");
  document.getElementById("talabaFio").focus();
});
qidiruv.addEventListener("input", korsat);
saralash.addEventListener("change", korsat);
jadval.addEventListener("click", hodisa => {
  const bosilgan = hodisa.target.closest("button[data-amal]");
  if (!bosilgan) return;
  const talaba = talabalar.find(yozuv => yozuv.id === Number(bosilgan.dataset.id));
  if (!talaba) return;
  if (bosilgan.dataset.amal === "tahrir") {
    formaRejimi(talaba);
    bildirish("");
    document.getElementById("talabaFio").focus();
    return;
  }
  ochirishId = talaba.id;
  document.getElementById("ochirishMatni").textContent = `${talaba.fio} ro‘yxatdan o‘chirilsinmi?`;
  oyna.returnValue = "";
  oyna.showModal();
});
oyna.addEventListener("close", () => {
  if (oyna.returnValue === "tasdiq") {
    try {
      talabalar = TalabalarOmbori.ochirish(ochirishId);
      if (ochirishId === tahrirId) formaRejimi();
      korsat();
      bildirish("Talaba ro‘yxatdan o‘chirildi.");
      qidiruv.focus();
    } catch {
      bildirish("Yozuvni o‘chirib bo‘lmadi. Brauzer xotirasi sozlamalarini tekshiring.", true);
    }
  }
  ochirishId = null;
});
window.addEventListener("storage", hodisa => {
  if (hodisa.key === null || hodisa.key === TalabalarOmbori.kalit) yuklash();
});
yuklash();
