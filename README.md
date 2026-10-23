# Week 6 — Katalog & Simulasi Cicilan

Dua halaman web statis (HTML + CSS + JS native, tanpa library) yang terhubung lewat nav bar sticky.
Tugas: JavaScript DOM, Event Handling, dan Fetch API.

## Halaman

### Katalog (`public/index.html`) — Fetch API
Katalog produk yang datanya diambil dari [dummyjson.com/products](https://dummyjson.com/products).
- Menampilkan nama, harga (USD + estimasi Rupiah), kategori, rating, dan stok
- **Loading** (spinner) saat data diambil
- **Error handling** + tombol **Coba Lagi** jika fetch gagal
- Cari produk berdasarkan nama, filter kategori, dan urutkan (harga / rating)
- Badge "Stok Menipis" untuk produk dengan stok di bawah 10
- Tombol **Simulasikan Cicilan** pada tiap kartu, membawa nama & harga produk ke halaman form

### Simulasi Cicilan (`public/form.html`) — DOM & Event Handling
Form untuk menghitung cicilan produk.
1. Isi **nama produk** dan **harga** (pratinjau Rupiah muncul saat mengetik)
2. Geser slider **DP** (0–50%), nilainya tampil langsung
3. Pilih **tenor** (3 / 6 / 12 / 24 bulan) dan centang persetujuan
4. Klik **Hitung Cicilan**, rincian dan pesan umpan balik muncul di bawah form
5. Klik **Reset** untuk mengosongkan form

**Event yang dipakai:** `input` (validasi, pratinjau harga, slider), `change` (tenor, checkbox), `submit` (hitung), `click` (reset, coba lagi).

**Validasi** (pesan error muncul langsung di bawah input):

| Field | Aturan |
|---|---|
| Nama Produk | wajib, 3–60 karakter, harus mengandung huruf |
| Harga | wajib, angka bulat, Rp 100.000 – Rp 500.000.000 |
| Tenor | wajib dipilih |
| Persetujuan | wajib dicentang |

**Rumus:** bunga flat. `cicilan = (pokok + pokok × bunga/bulan × tenor) / tenor`, dengan `pokok = harga − DP`.

## Struktur Folder

```
PAW-ANTARA-WEEK6/
├── public/
│   ├── index.html      # halaman Katalog
│   ├── form.html       # halaman Simulasi Cicilan
│   ├── css/
│   │   ├── index.css   # style utama, dipakai kedua halaman (warna, font, nav, header, footer)
│   │   └── form.css    # style khusus form (dimuat setelah index.css)
│   └── js/
│       ├── index.js    # fetch, cari, filter, dan urutkan produk
│       └── form.js     # validasi dan perhitungan cicilan
├── latihan/
│   ├── fetch.js        # script uji coba fetch API
│   └── test.js         # script latihan
└── README.md
```

## Cara Menjalankan

Buka `public/index.html` di browser. Tidak perlu install apa pun, tapi halaman Katalog butuh koneksi internet untuk mengambil data produk.

> Catatan: fitur "Simulasikan Cicilan" memakai query string, jadi tetap berfungsi saat dibuka langsung dari file (`file://`) maupun lewat Live Server.

## Kustomisasi

- **Ubah bunga/tenor:** edit objek `bungaPerBulan` di `public/js/form.js`, lalu sesuaikan `<option>` pada `<select id="tenor">` di `public/form.html`.
- **Ubah batas validasi:** edit objek `rules` di `public/js/form.js`.
- **Ubah kurs USD→IDR:** edit konstanta `USD_TO_IDR` di `public/js/index.js`.