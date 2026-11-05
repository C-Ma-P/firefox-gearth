# Open in Google Earth

A tiny Firefox extension for opening selected locations directly in Google Earth Web.

## Usage

1. Select a location, address, or set of coordinates on any webpage.
2. Right-click.
3. Choose **Open in Google Earth**.
4. If a Google Earth Web tab already exists, the extension reuses it.
5. Otherwise it opens a new Google Earth tab.

Examples:

- `Cumberland Gap`
- `Mount Ararat`
- `1600 Pennsylvania Ave, Washington, DC`
- `37.7, -122.2`
- `37°25'19.07"N, 122°05'06.24"W`

No geocoding API, API key, or Google Maps intermediary is used. The selection is passed directly to Google Earth Web's search route.

## Existing-tab selection

The rule is deliberately deterministic:

1. Use the leftmost reusable Google Earth tab in the window where the command was invoked.
2. If that window has no Earth tab, use the Earth tab with the lowest window ID, then lowest tab index, then lowest tab ID.
3. Normal and private-browsing tabs are never mixed.
4. If the selected Earth tab closes during the operation, open a new Earth tab in the source window.

Only Google Earth Web app URLs (`/web/...` and the current versioned `/static/multi-threaded/versions/...` app route) are eligible for reuse.

The extension intentionally does not automate Google's internal search UI. Reusing a tab is done with Firefox's documented Tabs API and a normal navigation to the Google Earth search URL.

## Development

Open:

`about:debugging#/runtime/this-firefox`

Choose **Load Temporary Add-on…** and select `manifest.json`.

## Signing

For an unlisted permanently installable XPI:

```bash
npx web-ext@latest sign --channel=unlisted
```

with your Mozilla Add-ons API credentials in the environment.

## Permissions

- `contextMenus`: adds the right-click action.
- `tabs`: lets the extension identify an already-open Google Earth tab so it can reuse it.

The extension does not inject scripts into Google Earth or into the page where you selected the location.
