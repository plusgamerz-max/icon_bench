# Icon Bench

A small, offline SVG icon editor. Drag shapes on a pixel grid, fine-tune every number in a properties panel, or edit the raw SVG like HTML. No build step, no dependencies.

## Run it

Open `index.html` in a modern browser (Chrome, Edge, Firefox). It works from a plain file, so there is nothing to install. It does not support Internet Explorer.

## Features

- **Shapes:** line, rect, circle, ellipse, polyline, polygon and path.
- **Canvas:** pixel grid with snapping (1, 0.5, 0.25 or off), zoom with the buttons, `+` / `-` / `0`, or Ctrl + mouse wheel.
- **Properties panel:** number fields for every shape, colour picker for stroke and fill, and canvas-wide defaults that every shape inherits.
- **Path points:** a list of every point with its command (`M L H V C S Q T A Z`, absolute or relative) and editable numbers. Use **+ Add point** to pick a type from a popup.
- **Right-click** a path point (on the canvas or in the list) to insert, change type, duplicate, move, close the path or delete. Right-click a shape for duplicate, order and delete.
- **Resizable panels:** drag the thin bars between the panels, like in VS Code.
- **Code pane:** synced both ways with the canvas.
- **Import and export:** SVG files (also by drag and drop), PNG at 128 or 512 px, and copy as code.
- **Reorder points:** drag the grip (three bars) on a point row to change the order of path, polyline and polygon points.
- **View mode (H):** nothing can be selected, you can only drag to move around the canvas and zoom.
- **Library:** Save stores the current icon in your browser (local storage). Library opens a browser with search and a large preview (light and dark, several sizes). Double-click an icon to open it in the editor.
- **Any viewBox:** icons whose viewBox does not start at `0 0` (for example Material Symbols, `0 -960 960 960`) are shown correctly.
- **Rotate (T):** drag on the canvas to turn the selected shape around its center, or drag the orange dot to pick another pivot. Shift snaps to 15°. The sidebar also has exact angle and pivot fields, and the right-click menu has quick angles. Rotation is baked into the coordinates (rects and ellipses become paths).
- **Library selection:** single-click previews an icon, double-click selects or unselects it. With a selection you can Select all, Unselect all, Download selected or Remove selected. One icon downloads as `.svg`, two or more come in one `.zip`. **Download all** follows the same rule.
- **Undo and redo:** Ctrl+Z and Ctrl+Y.

## Shortcuts

| Key | Action |
| --- | --- |
| V L R C E Y G P | Select, line, rect, circle, ellipse, polyline, polygon, path |
| H | View mode (look around only) |
| T | Rotate mode |
| Enter / double-click | Finish a path, polyline or polygon |
| Arrow keys | Nudge the selection (Shift for 4 steps) |
| Ctrl+D | Duplicate |
| Delete | Remove the selection |

## Files

```
index.html          page layout
css/style.css       glass theme
js/app.js           model, canvas, inspector, undo, shape tools
js/ui.js            menus, zoom, splitters, colour picker, import/export
js/path-panel.js    path and polygon point lists, reordering, path menus
js/rotate.js        rotate mode, pivot, rotate menu
js/zip.js           tiny zip writer for multi-icon downloads
js/icons.js         toolbar and layer icons
js/library.js       save icons in the browser and browse them
```

`app.js` exposes a small API on `window.IB` that the other two files use.

## Limits

Groups (`<g>`), text, gradients, transforms and other SVG elements are not edited. Unsupported elements are ignored when you paste or import code, and a warning is shown. Dragging a path point rewrites that path with absolute coordinates.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
