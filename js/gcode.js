
function editGcodeSnippet(id) {
  $("body").append("<div id='gcode-config' class='popup'>"+
    "<div class='popup-content'>"+
      "<p>Verwende '$W' für die Breite und '$H' für die Höhe der Arbeitsfläche.</p>"+
      "<textarea id='gcode-snippet'>"+store.get(id)+"</textarea>"+
    "</div><div class='popup-buttons'>"+
      "<input type='button' value='Speichern' onclick='saveGcodeSnippet(\""+id+"\")'/>"+
    "</div></div>");
}

function saveGcodeSnippet(id) {
  store.set(id, document.getElementById("gcode-snippet").value);
  document.getElementById("gcode-config").remove();
  workerFunc(() => true);
}


function saveGCode(file, callback) {

  for (var layer of app.layers) {
    if (layer.gcode) {
      let gcode = layer.gcode.gcode.slice();
      app.texts
        .filter(e => e.gcode && e.$.x > layer.$.x && e.$.y > layer.$.y && e.$.x < layer.$.x+layer.$.w && e.$.y < layer.$.y+layer.$.h)
        .forEach(e => gcode = gcode.concat(e.gcode));
      fs.writeFile(file + "/" + layer.$.title+".gcode", gcode.join('\n'), (err) => {
        if (err) throw err;
      });
    }
  }
  var svg = $("#svg").clone()[0];
  svg.setAttribute("viewBox", "0 0 " + app.machine.$.w + " " + app.machine.$.h);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.childNodes[1].attributes.removeNamedItem("transform");
  if (svg.childNodes[1].childNodes.length>2) svg.childNodes[1].removeChild(svg.childNodes[1].childNodes[2]);
  if (svg.childNodes[1].childNodes.length>3) svg.childNodes[1].removeChild(svg.childNodes[1].childNodes[3]);
  if (svg.childNodes[1].childNodes.length>4) svg.childNodes[1].removeChild(svg.childNodes[1].childNodes[4]);
  if (svg.childNodes[1].childNodes.length>5) svg.childNodes[1].removeChild(svg.childNodes[1].childNodes[5]);
  fs.writeFile(file + "/screenshot.svg", svg.outerHTML, (err) => {
    if (err) throw err;
  });

}

function showAutoLevelingDialog() {
  let leveling = store.get("auto-leveling");
  console.log("Leveling:", leveling);
  $("body").append("<div id='auto-leveling' class='popup'>"+
    "<div class='popup-content'>"+
      "<input type='button' value='Neue Leveling-Datei laden' onclick='loadLevelingFile()'/>"+
      "<div>Data...</div>"+
    "</div><div class='popup-buttons'>"+
      "<input type='button' value='Fertig' onclick='document.getElementById(\"auto-leveling\").remove()' />"+
  "</div></div>");
}

function loadLevelingFile() {
  dialog.showOpenDialog({filters: [{name: "Json", extensions: ['json']}]}, files => {
    if (files && files[0])
      fs.readFile(files[0], (err, data) => {
        if (err) throw err;
        store.set("auto-leveling", data);
        console.log("Leveling loaded:", data);
      });
    else console.log("No File selected");
  });
}
