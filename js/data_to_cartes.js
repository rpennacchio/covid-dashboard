d3.csv('data/data_to_cartes.csv').then(data => {
  
    // Traitement des données
  
    // Sélection des variables nécessaires pour le graphique
    const tidyData = data.map(d => {
      return {
        date: new Date(d.date), // ATTENTION À TRANSPOSER EN FORMAT DATE
        new_cases: +d.conf_j1, // ATTENTION STRING A TRANSPOSER EN FLOAT
        new_cases_evol: d.conf_j1_evol,
        hosp_tot: +d.hosp, // ATTENTION STRING A TRANSPOSER EN FLOAT
        hosp_tot_evol: d.hosp_evol,
        dc_tot: +d.dc_tot, // ATTENTION STRING A TRANSPOSER EN FLOAT
        dc_tot_evol: d.dc_tot_evol,
        vacc_nb: +d.n_cum_complet, // ATTENTION STRING A TRANSPOSER EN FLOAT
        vacc_nb_evol: d.n_cum_complet_evol,
        vacc_percent: +d.couv_complet, // ATTENTION STRING A TRANSPOSER EN FLOAT
        vacc_percent_evol: d.couv_complet_evol
      }
    });

});