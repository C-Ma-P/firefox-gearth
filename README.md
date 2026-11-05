# Open in Google Earth

A tiny Firefox extension for opening selected locations directly in Google Earth Web.

## Usage

1. Select a location, address, or set of coordinates on any webpage.
2. Right-click.
3. Choose **Open in Google Earth**.
4. Google Earth opens in a new tab and searches the selected text.

Examples:

- `Cumberland Gap`
- `Mount Ararat`
- `1600 Pennsylvania Ave, Washington, DC`
- `37.7, -122.2`
- `37°25'19.07"N, 122°05'06.24"W`

No geocoding API, API key, or Google Maps intermediary is used. The selection is passed directly to Google Earth Web's search route.

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

The extension does not request access to page contents. The only selected text it receives is the selection supplied by Firefox when you explicitly click the context-menu item.
