// Reads every file in data/products/ and data/posts/ and returns them as
// one JSON response. This lets the admin UI show products and blog posts
// as a proper list of individual items (one file each) — much clearer to
// browse and edit than one giant file — while the storefront can still
// fetch "all products" / "all posts" in a single request.
//
// Needs netlify.toml's [functions] included_files to bundle the data/
// folder with this function (plain fs.readdir/readFile, no dependency).

const fs = require("fs");
const path = require("path");

function readFolder(folder) {
  const dir = path.join(__dirname, "..", "..", folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")));
}

exports.handler = async () => {
  try {
    const products = readFolder("data/products");
    const posts = readFolder("data/posts").sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ products, posts }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
