function startTour() {

  let tour = new Shepherd.Tour({
    defaults: {
      classes: 'shepherd-theme-dark',
      scrollTo: true
    }
  });
  tour.addStep({
    title: "Ebenen",
    text: 'Hier findest du alle Objekte deines Projektes. Wähle eines aus durch klicken.',
    attachTo: '#layers right',
    buttons: false,
    advanceOn: 'body layer-selected'
  });
  tour.addStep({
    title: "Einstellungen",
    text: 'Hier findest du alle Einstellungen zu dem ausgewählten Objekt.',
    attachTo: '#settings left',
    buttons: [
      {
        text: 'Weiter',
        action: tour.next
      }
    ]
  });
  tour.addStep({
    title: "Vorschau",
    text: 'Hier siehst du in Echtzeit wie dein Bild aussehen wird. Du kannst die Objekte auswählen, verschieben und anpassen.',
    attachTo: '#svgMachine top',
    buttons: [
      {
        text: 'Weiter',
        action: tour.next
      }
    ]
  });
  tour.addStep({
    title: "Werkzeuge",
    text: 'Wähle ein Werkzeug aus, um es zu benutzen.',
    attachTo: '#toolbar right',
    buttons: [
      {
        text: 'Weiter',
        action: tour.next
      }
    ]
  })
  tour.start();

}
