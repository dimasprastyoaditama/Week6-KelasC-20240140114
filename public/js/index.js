/**
 * @file index.js — halaman Katalog.
 * Mengambil produk dari dummyjson API pakai Fetch API (tanpa library),
 * lalu menampilkannya sebagai kartu yang bisa dicari, difilter, dan diurutkan.
 */

/**
 * Data produk dari dummyjson (hanya field yang dipakai di halaman ini).
 * @typedef {Object} Product
 * @property {number} id - ID produk.
 * @property {string} title - Nama produk.
 * @property {string} category - Kategori produk.
 * @property {string} [brand] - Merek, bisa kosong.
 * @property {number} price - Harga dalam USD.
 * @property {number} rating - Rating 0–5.
 * @property {number} stock - Jumlah stok.
 * @property {string} thumbnail - URL gambar thumbnail.
 */

/** Endpoint daftar produk sesuai instruksi tugas (default 30 produk). */
const API_URL = "https://dummyjson.com/products";

/** Kurs perkiraan USD → Rupiah (hanya untuk estimasi tampilan). */
const USD_TO_IDR = 16000;

const statusEl = document.getElementById("status");
const statusText = document.getElementById("statusText");
const spinnerEl = document.getElementById("spinner");
const retryBtn = document.getElementById("retryBtn");
const resultInfo = document.getElementById("resultInfo");
const gridEl = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

/**
 * Semua produk hasil fetch, disimpan supaya bisa difilter tanpa fetch ulang.
 * @type {Product[]}
 */
let allProducts = [];

/**
 * Format angka USD jadi teks dengan 2 angka desimal.
 * @param {number} usd - Harga dalam USD.
 * @returns {string} Contoh: `9.5` → `"$9.50"`.
 */
function formatUSD(usd) {
  return `$${usd.toFixed(2)}`;
}

/**
 * Format harga USD menjadi estimasi Rupiah.
 * @param {number} usd - Harga dalam USD.
 * @returns {string} Contoh: `"≈ Rp 160.000"`.
 */
function formatIDR(usd) {
  const idr = Math.round(usd * USD_TO_IDR);
  return "≈ " + idr.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

/**
 * Tampilkan status loading.
 * @returns {void}
 */
function showLoading() {
  statusEl.hidden = false;
  statusEl.classList.remove("error");
  spinnerEl.hidden = false;
  retryBtn.hidden = true;
  statusText.textContent = "Memuat produk...";
  resultInfo.textContent = "";
  gridEl.replaceChildren();
}

/**
 * Tampilkan pesan error beserta tombol "Coba Lagi".
 * @param {string} message - Pesan yang ditampilkan.
 * @returns {void}
 */
function showError(message) {
  statusEl.hidden = false;
  statusEl.classList.add("error");
  spinnerEl.hidden = true;
  retryBtn.hidden = false;
  statusText.textContent = message;
}

/**
 * Buat satu elemen kartu produk lewat DOM API
 * (pakai textContent, bukan innerHTML, supaya aman dari injeksi HTML).
 * @param {Product} product - Produk yang mau dibuatkan kartu.
 * @returns {HTMLElement} Elemen kartu.
 */
function createCard(product) {
  const isLowStock = product.stock < 10;

  const card = document.createElement("article");
  card.className = "card";

  const badge = document.createElement("span");
  badge.className = "stock-badge" + (isLowStock ? " low" : "");
  badge.textContent = isLowStock ? "Stok Menipis" : "Tersedia";

  const thumbWrap = document.createElement("div");
  thumbWrap.className = "thumb-wrap";
  const img = document.createElement("img");
  img.src = product.thumbnail;
  img.alt = product.title;
  img.loading = "lazy";
  thumbWrap.appendChild(img);

  const body = document.createElement("div");
  body.className = "body";

  const category = document.createElement("div");
  category.className = "category";
  category.textContent = product.category;

  const title = document.createElement("h3");
  title.textContent = product.title;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${product.brand || "-"} · stok: ${product.stock}`;

  const footerRow = document.createElement("div");
  footerRow.className = "footer-row";

  const price = document.createElement("div");
  price.className = "price-tag";
  price.textContent = formatUSD(product.price);
  const idr = document.createElement("span");
  idr.className = "idr";
  idr.textContent = formatIDR(product.price);
  price.appendChild(idr);

  const rating = document.createElement("div");
  rating.className = "rating";
  rating.textContent = `★ ${product.rating.toFixed(2)}`;

  footerRow.append(price, rating);

  // link ke halaman form, nama & harga produk dibawa lewat query string
  const params = new URLSearchParams({
    produk: product.title,
    harga: Math.round(product.price * USD_TO_IDR),
  });
  const cta = document.createElement("a");
  cta.className = "cta";
  cta.href = `form.html?${params.toString()}`;
  cta.textContent = "Simulasikan Cicilan";

  body.append(category, title, meta, footerRow, cta);
  card.append(badge, thumbWrap, body);
  return card;
}

/**
 * Tampilkan daftar produk sebagai kartu di grid.
 * Kalau daftar kosong, tampilkan pesan "Produk tidak ditemukan.".
 * @param {Product[]} products - Produk yang mau ditampilkan.
 * @returns {void}
 */
function renderProducts(products) {
  gridEl.replaceChildren();
  resultInfo.textContent = `Menampilkan ${products.length} dari ${allProducts.length} produk`;

  if (products.length === 0) {
    statusEl.hidden = false;
    statusEl.classList.remove("error");
    spinnerEl.hidden = true;
    retryBtn.hidden = true;
    statusText.textContent = "Produk tidak ditemukan.";
    return;
  }

  statusEl.hidden = true;

  const fragment = document.createDocumentFragment();
  products.forEach((product) => fragment.appendChild(createCard(product)));
  gridEl.appendChild(fragment);
}

/**
 * Isi dropdown kategori dengan kategori unik (urut abjad) dari daftar produk.
 * @param {Product[]} products - Sumber kategori.
 * @returns {void}
 */
function populateCategoryOptions(products) {
  const categories = [...new Set(products.map((p) => p.category))].sort();

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

/**
 * Filter, urutkan, lalu render ulang {@link allProducts}
 * berdasarkan kata kunci, kategori, dan opsi urutan yang dipilih.
 * @returns {void}
 */
function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sort = sortSelect.value;

  const result = allProducts.filter((product) => {
    const matchKeyword = product.title.toLowerCase().includes(keyword);
    const matchCategory = category ? product.category === category : true;
    return matchKeyword && matchCategory;
  });

  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  if (sort === "rating-desc") result.sort((a, b) => b.rating - a.rating);

  renderProducts(result);
}

/**
 * Ambil produk dari {@link API_URL}, isi dropdown kategori, lalu render semua produk.
 * Kalau gagal, pesan error + tombol "Coba Lagi" ditampilkan.
 * @returns {Promise<void>}
 */
async function fetchProducts() {
  showLoading();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server membalas dengan status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.products)) {
      throw new Error("Format data dari API tidak sesuai");
    }

    allProducts = data.products;

    // hindari opsi kategori dobel kalau fetch diulang lewat tombol "Coba Lagi"
    categorySelect.length = 1;
    populateCategoryOptions(allProducts);
    applyFilters();
  } catch (error) {
    showError(`Gagal memuat data: ${error.message}`);
    console.error("Fetch error:", error);
  }
}

// event listener untuk pencarian, filter kategori, dan urutan
searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);
retryBtn.addEventListener("click", fetchProducts);

// jalankan fetch saat halaman pertama kali dibuka
document.addEventListener("DOMContentLoaded", fetchProducts);
