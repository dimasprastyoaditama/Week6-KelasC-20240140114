// latihan simulasi cicilan (logika yang sama dengan public/js/form.js)
const harga = 8000000;
const dpPersen = 20;
const tenor = 12;
const bungaPerBulan = 1.0;

const pokok = harga - harga * (dpPersen / 100);
const total = pokok + pokok * (bungaPerBulan / 100) * tenor;
console.log("Cicilan per bulan:", Math.round(total / tenor));
