const MENU_ID = "open-in-google-earth";
const MAX_QUERY_LENGTH = 500;

browser.runtime.onInstalled.addListener(async () => {
  await browser.contextMenus.removeAll();

  browser.contextMenus.create({
    id: MENU_ID,
    title: "Open in Google Earth",
    contexts: ["selection"],
  });
});

browser.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  const query = normalizeSelection(info.selectionText ?? "");
  if (!query || query.length > MAX_QUERY_LENGTH) {
    return;
  }

  const url = earthSearchUrl(query);
  await browser.tabs.create({ url });
});

function normalizeSelection(text) {
  return text.replace(/\s+/g, " ").trim();
}

function earthSearchUrl(query) {
  // Google Earth Web accepts place names, addresses, decimal coordinates,
  // and DMS coordinates through its /web/search/<query> route.
  //
  // encodeURIComponent keeps punctuation such as degree symbols, quotes,
  // commas, and cardinal letters safe in the URL.
  return `https://earth.google.com/web/search/${encodeURIComponent(query)}`;
}
