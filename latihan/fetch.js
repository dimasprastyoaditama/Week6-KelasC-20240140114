/**
 * Uji coba fetch 5 produk dari dummyjson, hasilnya dicetak ke console.
 * Jalankan: `node latihan/fetch.js` (Node 18+) atau tempel ke console browser.
 * @returns {Promise<void>}
 */
async function testFetchAPI() {
  const testUrl = "https://dummyjson.com/products?limit=5&select=title,price";
  try {
    const response = await fetch(testUrl);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    data.products.forEach((p) => console.log(`${p.title} — $${p.price}`));
  } catch (error) {
    console.error("Test fetch error:", error);
  }
}

testFetchAPI();