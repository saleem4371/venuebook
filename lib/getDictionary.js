const dictionaries = {
  en: () => import("../locales/en.json").then((m) => m.default),
  hi: () => import("../locales/hi.json").then((m) => m.default),
};

export async function getDictionary(locale) {
  const loader = dictionaries[locale] || dictionaries.en;
  return loader();
}