// This file is a helper for the sapper export
// https://github.com/sveltejs/sapper/issues/1419#issuecomment-676562717
// sapper only crawls through the index.svelte component for the links to export routes
// since we don't have links to all routes on our homepage (only at other routes), we need a workaround
// an element with links to all routes needs to be injected into the index.svelte before running export (and removed after completed)
// this script ADDS these routes

const 
  fs = require("fs")
  path = require("path");

let routesElement = `\n<div id="ROUTES" style="position: fixed; left: -100000vw;">\n`;

console.log("[Verto] Adding route declarations...");

mapRoutes("../src/routes")
function mapRoutes (dir) {
  for(const element of fs.readdirSync(path.join(__dirname, dir))) {
    if(element.match(/.svelte$/)) routesElement += `  <a href="${ dir.replace("../src/routes", "") + "/" + element.replace(".svelte", "") }">${ dir.replace("../src/routes", "") + "/" + element.replace(".svelte", "") }</a>\n`;
    else if(fs.lstatSync(path.join(__dirname, dir + "/" + element)).isDirectory()) mapRoutes(dir + "/" + element);
  }
}

routesElement += "</div>";

fs.appendFileSync(path.join(__dirname, "../src/routes/index.svelte"), routesElement);
console.log("[Verto] Added route declarations...")