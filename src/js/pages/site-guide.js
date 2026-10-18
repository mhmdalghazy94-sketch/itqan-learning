const search = document.querySelector("#site-guide-query");
const entries = [...document.querySelectorAll("[data-guide-results] li")];
const count = document.querySelector("#guide-count");
const empty = document.querySelector("[data-guide-empty]");

if (!search || entries.length === 0 || !count || !empty) {
  throw new Error("تعذر تهيئة البحث في دليل الموقع.");
}

function filterGuide() {
  const query = search.value.trim().toLocaleLowerCase("ar");
  let visibleCount = 0;
  for (const entry of entries) {
    const searchableText = `${entry.dataset.search} ${entry.textContent}`.toLocaleLowerCase("ar");
    const matches = searchableText.includes(query);
    entry.hidden = !matches;
    if (matches) visibleCount += 1;
  }
  count.textContent = `عدد النتائج: ${visibleCount}`;
  empty.hidden = visibleCount !== 0;
}

search.addEventListener("input", filterGuide);
filterGuide();
