/**
 * @file form.js — halaman Simulasi Cicilan.
 * Validasi input (nama, harga, tenor, persetujuan), lalu hitung cicilan
 * dan tampilkan hasilnya secara dinamis lewat DOM.
 */

/**
 * Bunga flat per bulan untuk tiap tenor (dalam persen).
 * Key-nya harus sama dengan `value` di `<select id="tenor">`.
 * @type {Object<string, number>}
 */
const bungaPerBulan = {
  3: 0,
  6: 0.8,
  12: 1.0,
  24: 1.2,
};

const form = document.getElementById("form");
const hargaInput = document.getElementById("harga");
const hargaPreview = document.getElementById("harga-preview");
const dpInput = document.getElementById("dp");
const dpOutput = document.getElementById("dp-output");
const resetBtn = document.getElementById("resetBtn");
const resultEl = document.getElementById("result");
const feedbackEl = document.getElementById("feedback");
const resultList = document.getElementById("resultList");

/**
 * Format angka ke Rupiah.
 * @param {number} n - Angka yang diformat.
 * @returns {string} Contoh: `25000` → `"Rp 25.000"`.
 */
function rupiah(n) {
  return Math.round(n).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

/**
 * Aturan validasi per input. Key-nya sama dengan `id` input di form.
 * Tiap aturan menerima elemen input dan mengembalikan pesan error,
 * atau string kosong `""` kalau valid.
 * @type {Object<string, function(HTMLInputElement): string>}
 */
const rules = {
  nama: (el) => {
    const v = el.value.trim();
    if (!v) return "Nama produk wajib diisi.";
    if (v.length < 3) return `Nama produk minimal 3 karakter (sekarang ${v.length}).`;
    if (v.length > 60) return `Nama produk maksimal 60 karakter (sekarang ${v.length}).`;
    if (!/\p{L}/u.test(v)) return "Nama produk harus mengandung huruf.";
    return "";
  },
  harga: (el) => {
    if (!el.value) return "Harga wajib diisi.";
    const n = Number(el.value);
    if (!Number.isInteger(n)) return "Harga harus angka bulat, tanpa koma.";
    if (n < 100000) return "Harga minimal Rp 100.000.";
    if (n > 500000000) return "Harga maksimal Rp 500.000.000.";
    return "";
  },
  tenor: (el) => (el.value ? "" : "Pilih salah satu tenor."),
  setuju: (el) => (el.checked ? "" : "Centang dulu untuk melanjutkan."),
};

/**
 * Validasi satu input: tampilkan pesan error di bawahnya dan set `aria-invalid`.
 * @param {string} id - `id` input, harus ada di {@link rules}.
 * @returns {boolean} `true` kalau valid.
 */
function validate(id) {
  const input = document.getElementById(id);
  const msg = rules[id](input);
  document.getElementById(`${id}-error`).textContent = msg;
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}

/**
 * Hitung simulasi cicilan dengan bunga flat.
 * @param {number} harga - Harga produk (Rp).
 * @param {number} dpPersen - Persentase DP (0–50).
 * @param {number} tenor - Lama cicilan dalam bulan.
 * @returns {{dp:number, pokok:number, bunga:number, total:number, cicilan:number}}
 */
function hitungCicilan(harga, dpPersen, tenor) {
  const dp = harga * (dpPersen / 100);
  const pokok = harga - dp;
  const bunga = pokok * (bungaPerBulan[tenor] / 100) * tenor;
  const total = pokok + bunga;
  return { dp, pokok, bunga, total, cicilan: total / tenor };
}

/**
 * Tambah satu baris (label + nilai) ke daftar hasil.
 * @param {string} label - Nama baris.
 * @param {string} value - Nilai baris.
 * @param {boolean} [isTotal=false] - Beri gaya khusus untuk baris utama.
 * @returns {void}
 */
function addRow(label, value, isTotal = false) {
  const row = document.createElement("div");
  row.className = "row" + (isTotal ? " total" : "");
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = value;
  row.append(dt, dd);
  resultList.appendChild(row);
}

/**
 * Sembunyikan kotak hasil dan kosongkan isinya.
 * @returns {void}
 */
function clearResult() {
  resultEl.hidden = true;
  feedbackEl.textContent = "";
  resultList.replaceChildren();
}

// ---------- event: input ----------

// validasi langsung saat mengetik, supaya error ketahuan tanpa menunggu submit
["nama", "harga"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => validate(id));
});

// pratinjau harga dalam format Rupiah saat mengetik
hargaInput.addEventListener("input", () => {
  const n = Number(hargaInput.value);
  hargaPreview.textContent = hargaInput.value && n > 0 ? `= ${rupiah(n)}` : "";
});

// tampilkan nilai slider DP secara langsung
dpInput.addEventListener("input", () => {
  dpOutput.textContent = `${dpInput.value}%`;
});

// ---------- event: change ----------
document.getElementById("tenor").addEventListener("change", () => validate("tenor"));
document.getElementById("setuju").addEventListener("change", () => validate("setuju"));

// ---------- event: submit ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const invalid = Object.keys(rules).filter((id) => !validate(id));
  if (invalid.length) {
    document.getElementById(invalid[0]).focus();
    clearResult();
    return;
  }

  const nama = document.getElementById("nama").value.trim();
  const harga = Number(hargaInput.value);
  const dpPersen = Number(dpInput.value);
  const tenor = Number(document.getElementById("tenor").value);
  const hasil = hitungCicilan(harga, dpPersen, tenor);

  resultList.replaceChildren();
  addRow("Produk", nama);
  addRow("Harga", rupiah(harga));
  addRow(`DP (${dpPersen}%)`, rupiah(hasil.dp));
  addRow("Pokok pinjaman", rupiah(hasil.pokok));
  addRow("Total bunga", rupiah(hasil.bunga));
  addRow("Total bayar cicilan", rupiah(hasil.total));
  addRow(`Cicilan / bulan × ${tenor}`, rupiah(hasil.cicilan), true);

  // umpan balik dinamis sesuai hasil perhitungan
  feedbackEl.classList.toggle("warn", hasil.bunga > 0);
  feedbackEl.textContent = hasil.bunga === 0
    ? `Mantap! Cicilan ${nama} ${tenor} bulan tanpa bunga.`
    : `Cicilan ${nama} selama ${tenor} bulan dikenai total bunga ${rupiah(hasil.bunga)}.`;

  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// ---------- event: click (reset) ----------
resetBtn.addEventListener("click", () => {
  form.reset();
  dpOutput.textContent = `${dpInput.value}%`;
  hargaPreview.textContent = "";
  Object.keys(rules).forEach((id) => {
    document.getElementById(`${id}-error`).textContent = "";
    document.getElementById(id).removeAttribute("aria-invalid");
  });
  clearResult();
  document.getElementById("nama").focus();
});

// ---------- prefill dari halaman Katalog ----------
// contoh: form.html?produk=Laptop&harga=8000000
const params = new URLSearchParams(window.location.search);
if (params.has("produk")) {
  document.getElementById("nama").value = params.get("produk");
}
if (params.has("harga")) {
  hargaInput.value = params.get("harga");
  hargaInput.dispatchEvent(new Event("input"));
}
