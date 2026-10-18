export async function getCategories(dataUrl = "./data/categories.json") {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`تعذر تحميل المجالات التعليمية (HTTP ${response.status}).`);
  }

  const categories = await response.json();
  if (!Array.isArray(categories)) {
    throw new TypeError("تنسيق بيانات المجالات التعليمية غير صالح.");
  }

  return categories;
}
