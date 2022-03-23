import { createRequire } from "module";
develop();
async function develop() {
    const require = createRequire(import.meta.url);
    const fs = require("fs");
    const { createGzip } = require('zlib');
    const { pipeline } = require('stream');
    const browserSync = require('browser-sync').create();
    const sass = require("sass");
    const chokidar = require('chokidar');
    const { minify } = require("terser");

    serve();
    function serve() {
        browserSync.init({
            server: {
                baseDir: './web-component/',
                port: 3000,
            },
            startPath: '/test-site/index.html',
            ghostMode: false,
            open: false
        });
        chokidar.watch(`./web-component/test-site/`, { ignoreInitial: true }).on('all', async (event, path) => {
            console.log(event, path);
            browserSync.reload();
        });
        chokidar.watch([`./web-component/src/scss/`, `./web-component/src/js/`], { ignoreInitial: false }).on('all', async (event, path) => {
            console.log(event, path);
            const { css: scss } = sass.compile(`./web-component/src/scss/kortjs.scss`, { style: "compressed" });
            const kortjs = fs.readFileSync(`./web-component/src/js/kortjs.js`, "utf8").replace(`{sass-placeholder}`, scss);
            fs.writeFileSync(`./web-component/dist/kortjs.js`, kortjs, "utf8");
            browserSync.reload();
        });
    }

    process.once("SIGINT", build);
    async function build() {
        console.log("Building...");
        const { css: scss } = sass.compile(`./web-component/src/scss/kortjs.scss`, { style: "compressed" });
        const kortjs = fs.readFileSync(`./web-component/src/js/kortjs.js`, "utf8").replace(`{sass-placeholder}`, scss);
        const minifiedKortjs = await minify(kortjs);
        fs.writeFileSync(`./web-component/dist/kortjs.min.js`, minifiedKortjs.code, "utf8");

        const gzip = createGzip();
        const source = fs.createReadStream(`./web-component/dist/kortjs.min.js`);
        const destination = fs.createWriteStream(`./web-component/dist/kortjs.min.js.gz`);
        const gzipPromise = new Promise((resolve, reject) => {
            pipeline(source, gzip, destination, (err) => {
                if (err) {
                    console.error('An error occurred:', err);
                    reject(false);
                } else {
                    const { size } = fs.statSync(`./web-component/dist/kortjs.min.js.gz`);
                    console.log("Size of minified component: ", size / 1024);
                    fs.unlinkSync(`./web-component/dist/kortjs.min.js.gz`);
                    resolve(true);
                }
            });
        });
        if (await gzipPromise) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    }
}