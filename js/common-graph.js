const commonGraph = {
  locale: {
    dateTime: '%A %e %B %Y à %X',
    date: '%d/%m/%Y',
    time: '%H:%M:%S',
    periods: ['AM', 'PM'],
    days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  },
  size: {
    svg: {
      width: 500,
      height: 200,
    },
    margin: {
      horizontal: 80,
      vertical: 20,
    },
    legend: {
      height: 40,
      font: 14,
    },
    tooltip: {
      font: 10,
    },
  },
}

// Mise en français des dates.
d3.timeFormatDefaultLocale(commonGraph.locale)

// Détection du mobile.
if ('isMobileDevice' in window) {
  document.body.classList.add(window.isMobileDevice ? 'mobile' : 'desktop')

  commonGraph.isMobile = window.isMobileDevice
// } else {
//   const isMobile = (!!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|Mobi/i) && 'ontouchstart' in document.documentElement)
}
