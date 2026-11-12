"use strict";

const TalabalarOmbori = (() => {
  const kalit = "talabalar";
  const holatlar = ["Faol", "Nofaol"];
  const davomatlar = ["Qayd etilmagan", "Qatnashdi", "Qatnashmadi", "Sababli"];

  function tekshir(qiymatlar) {
    const fio = String(qiymatlar.fio ?? "").trim();
    const guruh = String(qiymatlar.guruh ?? "").trim();
    const fan = String(qiymatlar.fan ?? "").trim();
    const ballMatni = String(qiymatlar.baho ?? "").trim();
    const baho = Number(ballMatni);
    const { holat, davomat } = qiymatlar;

    if (!fio || fio.length > 120) throw new Error("F.I.O. 1–120 belgidan iborat bo‘lishi kerak.");
    if (!guruh || guruh.length > 30) throw new Error("Guruh nomi 1–30 belgidan iborat bo‘lishi kerak.");
    if (!fan || fan.length > 80) throw new Error("Fan nomi 1–80 belgidan iborat bo‘lishi kerak.");
    if (!/^\d+$/.test(ballMatni) || !Number.isInteger(baho) || baho < 0 || baho > 100) {
      throw new Error("Ball 0 dan 100 gacha butun son bo‘lishi kerak.");
    }
    if (!holatlar.includes(holat)) throw new Error("Ro‘yxatdan holatni tanlang.");
    if (!davomatlar.includes(davomat)) throw new Error("Ro‘yxatdan davomatni tanlang.");

    return { fio, guruh, fan, baho, holat, davomat };
  }

  function oqish() {
    const yozuvlar = JSON.parse(localStorage.getItem(kalit) ?? "[]");
    if (!Array.isArray(yozuvlar)) throw new Error("Saqlangan ma’lumot formati yaroqsiz.");
    return yozuvlar.map(yozuv => ({
      fan: "Veb tizimlar",
      holat: "Faol",
      davomat: "Qayd etilmagan",
      qaydVaqti: new Date(yozuv.id).toISOString(),
      ...yozuv
    }));
  }

  function saqlash(qiymatlar, id) {
    const tekshirilgan = tekshir(qiymatlar);
    const yozuvlar = oqish();
    if (id === null) {
      const yangiId = yozuvlar.reduce((keyingi, talaba) => Math.max(keyingi, talaba.id + 1), Date.now());
      yozuvlar.push({ id: yangiId, ...tekshirilgan, qaydVaqti: new Date().toISOString() });
    } else {
      const indeks = yozuvlar.findIndex(talaba => talaba.id === id);
      if (indeks === -1) throw new Error("Tahrirlanayotgan yozuv topilmadi.");
      yozuvlar[indeks] = { ...yozuvlar[indeks], ...tekshirilgan };
    }
    localStorage.setItem(kalit, JSON.stringify(yozuvlar));
    return yozuvlar;
  }

  function ochirish(id) {
    const yozuvlar = oqish().filter(talaba => talaba.id !== id);
    localStorage.setItem(kalit, JSON.stringify(yozuvlar));
    return yozuvlar;
  }

  return { kalit, oqish, saqlash, ochirish };
})();
