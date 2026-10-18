import { renderFooter } from "../components/footer.js";
import { renderHeader } from "../components/header.js";

const header = document.querySelector("#site-header");
const footer = document.querySelector("#site-footer");
if (!header || !footer) {
  throw new Error("تعذر تهيئة رأس أو تذييل صفحة المعلومات.");
}

renderHeader(header, { basePath: "../../", currentPage: document.body.dataset.currentPage || "" });
renderFooter(footer, { basePath: "../../" });
