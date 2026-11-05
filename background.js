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

browser.contextMenus.onClicked.addListener(async (info, sourceTab) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  const query = normalizeSelection(info.selectionText ?? "");
  if (!query || query.length > MAX_QUERY_LENGTH) {
    return;
  }

  await openInGoogleEarth(query, sourceTab);
});

async function openInGoogleEarth(query, sourceTab) {
  const searchUrl = earthSearchUrl(query);

  let tabs;
  try {
    tabs = await browser.tabs.query({});
  } catch (error) {
    console.warn("Open in Google Earth: could not enumerate tabs", error);
    await createEarthTab(searchUrl, sourceTab);
    return;
  }

  const candidates = tabs
    .filter(isReusableEarthTab)
    // Never jump between normal and private browsing contexts.
    .filter(tab => sourceTab?.incognito === undefined || tab.incognito === sourceTab.incognito);

  const target = chooseEarthTab(candidates, sourceTab?.windowId);

  if (!target?.id) {
    await createEarthTab(searchUrl, sourceTab);
    return;
  }

  try {
    // Reuse the existing tab. This is deliberately a normal browser
    // navigation rather than automation of Google's private Earth UI.
    await browser.tabs.update(target.id, {
      url: searchUrl,
      active: true,
    });
  } catch (error) {
    // The chosen tab may have closed between query() and update().
    console.warn("Open in Google Earth: reusable tab disappeared", error);
    await createEarthTab(searchUrl, sourceTab);
    return;
  }

  if (
    Number.isInteger(target.windowId) &&
    target.windowId !== sourceTab?.windowId
  ) {
    try {
      await browser.windows.update(target.windowId, { focused: true });
    } catch (error) {
      // The tab navigation already succeeded. A focus failure is not a
      // reason to open a duplicate Earth tab.
      console.warn("Open in Google Earth: could not focus Earth window", error);
    }
  }
}

function isReusableEarthTab(tab) {
  if (!tab?.url) {
    return false;
  }

  try {
    const url = new URL(tab.url);
    if (url.protocol !== "https:" || url.hostname !== "earth.google.com") {
      return false;
    }

    // /web/... is the public Google Earth Web entry/search route.
    // The versioned /static/... route is the actual Earth web app in
    // current deployments. Limiting the match to these avoids hijacking
    // unrelated earth.google.com pages.
    return (
      url.pathname === "/web" ||
      url.pathname.startsWith("/web/") ||
      url.pathname.startsWith("/static/multi-threaded/versions/")
    );
  } catch {
    return false;
  }
}

function chooseEarthTab(tabs, sourceWindowId) {
  if (!tabs.length) {
    return null;
  }

  // First preference: the leftmost Earth tab in the window where the
  // command was invoked.
  if (Number.isInteger(sourceWindowId)) {
    const sameWindow = tabs
      .filter(tab => tab.windowId === sourceWindowId)
      .sort(compareTabs);

    if (sameWindow.length) {
      return sameWindow[0];
    }
  }

  // Otherwise use a stable browser-session ordering:
  // lowest window ID, then leftmost tab, then lowest tab ID.
  return [...tabs].sort(compareTabs)[0];
}

function compareTabs(a, b) {
  return (
    numeric(a.windowId) - numeric(b.windowId) ||
    numeric(a.index) - numeric(b.index) ||
    numeric(a.id) - numeric(b.id)
  );
}

function numeric(value) {
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

async function createEarthTab(url, sourceTab) {
  const createProperties = {
    url,
    active: true,
  };

  if (Number.isInteger(sourceTab?.windowId)) {
    createProperties.windowId = sourceTab.windowId;
  }

  await browser.tabs.create(createProperties);
}

function normalizeSelection(text) {
  return text.replace(/\s+/g, " ").trim();
}

function earthSearchUrl(query) {
  return `https://earth.google.com/web/search/${encodeURIComponent(query)}`;
}
