
const svgToImg = require("svg-to-img");

import {showOpenDialog, getDataURL} from "../helpers.js"
const {shell} = require('electron')
const fs = require("fs")

const cloudconvert = new (require('cloudconvert'))('VHA9eS4bo5IOoM30p1KiY0dvsZ98K243JH2B94eacRfqGg6L0bG1W7QqcNBD8ftF');

const DPI = 8;

export default {
  async exportAsImage({dispatch, commit, state, getters}) {

    let folder = await showOpenDialog({properties: ["openDirectory", "createDirectory"]});

    if (!folder) return;

    let svgs = state.layers
      .filter(o => o.isRendering())
      .map(l => {
        let paths = l.renderParams.map(p => p.path);

        let svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox="0 0 ${l.w} ${l.h}" width="${l.w * DPI}" height="${l.h * DPI}"><g fill='black'>`
        svg += paths.map(p => `<path d='${p}'></path>`).join("\n");
        svg += "</g></svg>";
        return {svg, title: l.title};

      })

      console.log(svgs)

    svgs.forEach(svg => {
      fs.writeFile(`${folder}/${svg.title}.svg`, svg.svg, () => {
        fs.createReadStream(`${folder}/${svg.title}.svg`)
          .pipe(cloudconvert.convert({
             "inputformat": "svg",
             "outputformat": "eps",
             "input": "upload"
          }))
          .pipe(fs.createWriteStream(`${folder}/${svg.title}.eps`));
      });
    })




    await Promise.all(svgs.map(svg => {
      svgToImg.from(svg.svg).toJpeg({
        path: `${folder}/${svg.title}.jpeg`
      })
    }))

    shell.showItemInFolder(`${folder}/${svgs[0].title}.jpeg`);

  }
}
