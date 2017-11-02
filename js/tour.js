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
    showCancelLink: true,
    buttons: [{
      text: "Abbrechen",
      action: tour.cancel
    }, {
      text: "Weiter",
      action: () => {
        app.selectedLayer = app.images[0];
        setTimeout(tour.next, 10);
      }
    }],
    advanceOn: 'body image-selected'
  });
  tour.addStep({
    title: "Einstellungen",
    text: 'Hier findest du alle <b>Einstellungen</b> zu dem ausgewählten Objekt.<br><br><em>Klicke auf <b>"Datei auswählen"</b></em>.',
    attachTo: '#settings left',
    advanceOn: 'body image-loaded',
    buttons: [{
      text: "Überspringen",
      action: tour.next
    }]
  });
  tour.addStep({
    title: "Vorschau",
    text: 'Hier siehst du in Echtzeit wie dein Bild aussehen wird. Du kannst die Objekte auswählen, verschieben und anpassen.<br><br>Halte beim Anpassen <b>"Shift"</b> gedrückt, um die Proportionen beizubehalten.',
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
    text: "Hiermit kannst du die <b>Vorschau</b> vergrößern/verkleinern, verschieben und zentrieren.<br>Falls dein Computer <b>Multitouch</b> unterstützt, kannst du dies auch damit machen.",
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
    text: 'Mit dem <b>Mauswerkzeug</b> kannst du, wie schon erwähnt, Objekte in dem Vorschaubereich auswählen und anpassen.<br>Mit den weiteren <b>Tools</b> <em>(Icons mit +)</em> kannst du weitere Objekte zu deinem Projekt hinzufügen.<br><br><em>Probiere es aus, indem du das Rechteck-Werkzeug auswählst. (4. Icon von oben)</em>',
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
    text: 'Füge das Rechteck hinzu, indem du klickst, hälst und es mit der Maus aufspannst.<br>Danach kannst du im <b>Einstellungsbereich</b> weiter Einstellungen ändern.',
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
    text: 'Über die drei Balken kannst du die <b>Ebenen anordnen und vertauschen</b>. Das oberste Objekt wird auch als oberste Ebene gerendert.',
    attachTo: "#layerList right",
    buttons: [{
      text: "Weiter",
      action: () => {
        app.sidepanel = 1;
        tour.next();
        app.selectedLayer = null;
      }
    }]
  });
  tour.addStep({
    title: "Layouts",
    text: "<b>Layouts</b> bieten die Möglichkeit, vorgefertigte <b>Vorlagen</b> zu verwenden. Du kannst bereits vorhandene Auswählen, oder neue aus deinen eigenen Projekten erstellen.",
    attachTo: "#layers right",
    buttons: [{
      text: "Weiter",
      action: () => {
        app.sublayers_open = false;
        app.sidepanel = 0;
        tour.next();
      }
    }]
  });
  tour.addStep({
    title: "Quick-Modus",
    text: "Du kannst in den <b>Quick-Modus</b> umschalten, wenn es mal schnellgehen soll.<br>Dabei stehen dir alle wichtigen Einstellungen auf einen Blick zur Verfügung.",
    attachTo: "#quickModeSwitch bottom",
    advanceOn: "body change-quickmode",
    buttons: [{
      text: "Tour beenden",
      action: () => {
        app.sublayers_open = false;
        app.sidepanel = 0;
        tour.next();
      }
    }]
  });
  tour.start();

}
