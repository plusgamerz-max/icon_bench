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
- **Undo and redo:** Ctrl+Z and Ctrl+Y.

## Shortcuts

| Key | Action |
| --- | --- |
| V L R C E Y G P | Select, line, rect, circle, ellipse, polyline, polygon, path |
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
js/path-panel.js    path point list and path menus
```

`app.js` exposes a small API on `window.IB` that the other two files use.

## Limits

Groups (`<g>`), text, gradients, transforms and other SVG elements are not edited. Unsupported elements are ignored when you paste or import code, and a warning is shown. Dragging a path point rewrites that path with absolute coordinates.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
