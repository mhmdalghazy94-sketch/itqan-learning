export async function getPlatforms(dataUrl = "./data/platforms.json") {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`تعذر تحميل المنصات (HTTP ${response.status}).`);
  }

  const platforms = await response.json();
  if (!Array.isArray(platforms)) {
    throw new TypeError("تنسيق بيانات المنصات غير صالح.");
  }

  return platforms;
}
