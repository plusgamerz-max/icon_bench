# Contributing to Icon Bench

Thanks for helping. The project is plain HTML, CSS and JavaScript with no build step, so you can edit a file and refresh the page.

## Ground rules

- **No dependencies and no build tools.** Keep it runnable by opening `index.html`.
- **Old-browser friendly JavaScript.** Use `var` and `function`, not modules or arrow functions, so it keeps working on older Windows browsers.
- **Keep files focused:**
  - `js/app.js`: model, canvas drawing, inspector, undo, shape tools.
  - `js/ui.js`: menus, zoom, splitters, colour picker, import and export.
  - `js/path-panel.js`: the path point list and path menus.
  - `css/style.css`: all styling. Colours live in the `:root` variables.
- **Share state through `window.IB`.** Add a new line to the API block near the end of `app.js` instead of reaching into private variables.

## How the code fits together

- The model is `IB.S`: canvas size, default style (`root`), and `shapes`, a list of `{tag, a}` where `a` holds the SVG attributes.
- Every change calls `IB.update()` to redraw, refresh the code pane and inspector, and `IB.commit()` to save an undo step.
- New shape types go in the `GEO` table (attribute names), the `handles()` function (drag points) and `move()` in `app.js`.
- New popup menus use `IB.menu(x, y, items)` from `ui.js`.

## Before you open a pull request

1. Open `index.html` and try your change with each shape tool, undo and redo, and the code pane.
2. Check the layout with the side panels resized small and large.
3. Keep the pull request small and describe what you changed and why.

## Reporting bugs

Open an issue with your browser and version, the SVG code that triggers the problem, and the steps to reproduce it.
