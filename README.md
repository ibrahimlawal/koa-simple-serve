# koa-simple-serve
Koa simple middleware for serving static files saved in a specific folder

```js
var koa = require("koa"),
    serve = require("koa-simple-serve"),
    app = new koa();

// files loaded from ./assets will be cached
app.use(serve("/assets", path.join(__dirname, "assets")));
// files loaded from ../web will not be cached
app.use(serve("/web", path.join(__dirname, "..", "web"), { cache: false }));
app.listen(8000);
```
## Options

**cache** _(defaults to: **true**)_:
If set to false, the files will be loaded from disk everytime they are requested, else, they will be saved in memory against the next request.

**defaultfile** _(defaults to: **index.html**)_:
Files that serve as the index for your folders.
