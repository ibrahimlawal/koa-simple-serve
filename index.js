const fs = require("fs");
const mime = require("mime-types");
const directoryExists = require("directory-exists");
const loadedPaths = {};
const defaultOptions = { cache: true, defaultfile: "index.html" };

function redirectWithSlash(ctx) {
    ctx.status = 301;
    ctx.set("Location", ctx.path + "/");
}

function getRealPath(ctx, pathroot, defaultfile) {
    var realpath = ctx.path.substr(pathroot.length);
    if (realpath.endsWith("/")) realpath = realpath + defaultfile;
    return realpath;
}

function loadFile(pathroot, folder, realpath, cache) {
    var filebody = cache ? loadedPaths[pathroot][realpath] : "";
    if (!cache || !loadedPaths[pathroot].hasOwnProperty(realpath)) {
        var fileloc = folder + realpath;
        filebody = fs.existsSync(fileloc) ? fs.readFileSync(fileloc) : null;
        if (cache) loadedPaths[pathroot][realpath] = filebody;
    }
    return filebody;
}

module.exports = (pathroot, folder, sentOptions) => {
    // apply options
    const options = defaultOptions;
    Object.assign(options, sentOptions);

    // only create an object for cacheing if this supports cache
    if (options.cache) loadedPaths[pathroot] = {};

    return (ctx, next) => {
        // only handle GETs and paths that start with the specified root
        if (ctx.method !== "GET" || !ctx.path.startsWith(pathroot)) {
            return next();
        }

        // redirect to url ending with '/'
        if (ctx.path === pathroot) {
            redirectWithSlash(ctx);
            return;
        }

        // figure out the correct filepath, adding the defaultfilename
        // at the end for folders
        var realpath = getRealPath(ctx, pathroot, options.defaultfile);
        if (directoryExists.sync(folder + realpath)) {
            redirectWithSlash(ctx);
            return;
        }

        // load and send the file with proper mimetypes
        ctx.body = loadFile(pathroot, folder, realpath, options.cache);
        ctx.status = ctx.body === null ? 404 : 200;
        ctx.set("Content-Type", mime.lookup(realpath.split("/").pop()));
        return;
    };
};
