function tourEvent(id) {
  console.log("Event: "+id);
  document.body.dispatchEvent(new Event(id));
}

function startTour() {

  let tour = new Shepherd.Tour({
    defaults: {
      classes: 'shepherd-theme-arrows',
      scrollTo: true
    }
  });
  tour.addStep({
    title: "Objekte",
    text: 'Hier findest du alle <b>Objekte</b> deines Projektes.<br>Mit einem Doppelklick auf <b>Fräsbereich</b>, oder mit Klick auf den Pfeil daneben, gelangst du eine Ebene tiefer.<br><br><em>Wähle die Bildebene durch klicken aus.</em>',
    attachTo: '#layers right',
    buttons: [{
      text: "Abbrechen",
      action: tour.cancel
    }],
    advanceOn: 'body image-selected'
  });
  tour.addStep({
    title: "Einstellungen",
    text: 'Hier findest du alle Einstellungen zu dem ausgewählten Objekt. Klicke auf "Datei auswählen".',
    attachTo: '#settings left',
    advanceOn: 'body image-loaded',
    buttons: [{
      text: "Überspringen",
      action: tour.next
    }]
  });
  tour.addStep({
    title: "Vorschau",
    text: 'Hier siehst du in Echtzeit wie dein Bild aussehen wird. Du kannst die Objekte auswählen, verschieben und anpassen.<br>Halte beim Anpassen "Shift" gedrückt, um die Proportionen beizubehalten.',
    attachTo: '#svgMachine top',
    buttons: [
      {
        text: 'Weiter',
        action: () => {
          app.selectedTool = app.tools.select;
          tour.next();
        }
      }
    ]
  });
  tour.addStep({
    title: "Projektansicht",
    text: "Hiermit kannst du die Vorschau vergrößern/verkleinern, verschieben und zentrieren.\nFalls dein Computer Multitouch unterstützt, kannst du dies auch damit machen.",
    attachTo: '#corner-tools left',
    buttons: [
      {
        text: 'Weiter',
        action: tour.next
      }
    ]
  });
  tour.addStep({
    title: "Werkzeuge",
    text: 'Mit dem Mauswerkzeug kannst du, wie schon erwähnt, Objekte in dem Vorschaubereich auswählen und anpassen.\nMit den weiteren Tools (Icons mit +) kannst du weitere Objekte zu deinem Projekt hinzufügen.\nProbiere es aus, indem du das Rechteck-Werkzeug auswählst. (4. Icon von oben)',
    attachTo: '#tools right',
    advanceOn: 'body rect-selected',
    buttons: [{
      text: "Überspringen",
      action: () => {
        app.sublayers_open = true;
        setTimeout(() => tour.show("switchItems"), 100);
      }
    }]
  });
  tour.addStep({
    title: "Objekt hinzufügen",
    text: 'Füge das Rechteck hinzu, indem du klickst, hälst und es mit der Maus aufspannst.\nDanach kannst du im Einstellungsbereich weiter Einstellungen ändern.',
    attachTo: "#svgMachine top",
    advanceOn: 'body rect-added',
    when: {
      show: function() {
        app.sublayers_open = true;
      }
    }
  });
  tour.addStep("switchItems", {
    title: "Objekte anordnen",
    text: 'Über die drei Balken kannst du die Ebenen anordnen und vertauschen. Das oberste Objekt wird auch als oberste Ebene gerendert.',
    attachTo: "#layerList right",
    buttons: [{
      text: "Weiter",
      action: () => {
        app.sidepanel = 1;
        tour.next();
      }
    }]
  });
  tour.addStep({
    title: "Layouts",
    text: "Layouts bieten die Möglichkeit, vorgefertigte Vorlagen zu verwenden. Du kannst bereits vorhandene Auswählen, oder neue aus deinen eigenen Projekten erstellen.",
    attachTo: "#layers right",
    buttons: [{
      text: "Tour beenden",
      action: () => {
        tour.next();
        app.sublayers_open = false;
        app.sidepanel = 0;
        app.selectedLayer = null;
      }
    }]
  })
  tour.start();

}
