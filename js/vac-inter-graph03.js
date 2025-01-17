d3.csv("data/owid_top10_vac_world.csv").then(showData);

function showData(data) {
  const graphCfg = {
    target: `#vac-inter-graph03`,
    title: `Les 10 pays du monde qui vaccinent le plus`,
    subtitle: `en pourcentage de la population ayant reçu au moins une injection, au [[autoDate]]`,
    caption: `Source. <a href='https://www.data.gouv.fr/fr/organizations/sante-publique-france/' target='_blank'>Santé publique France</a>, <a href='https://data.drees.solidarites-sante.gouv.fr/explore/dataset/707_bases-administratives-sae/information/' target='_blank'>Drees</a>`,
  }

  // Traitement des données

  // Sélection des variables nécessaires pour le graphique
  const tempData = data.map((d) => {
    let newData = {
      date: new Date(d.date), // ATTENTION À TRANSPOSER EN FORMAT DATE
      tx_vacc: +d.people_vaccinated_per_hundred, // ATTENTION STRING A TRANSPOSER EN FLOAT
      pays: d.name_fr,
    };

    return newData;
  });

  // Tri des variables dans l'ordre décroissant
  const tidyData = tempData.sort((a, b) => d3.ascending(a.tx_vacc, b.tx_vacc));

  //---------------------------------------------------------------------------------------

  // Création du canevas SVG

  const width = 500;
  const height = 500;
  const marginH = 80;
  const marginV = 20;

  const viewBox = {
    width: width + marginH * 2,
    height: height + marginV * 2
  }

  // variables d'ajustement du graphique pour les noms des régions
  const marginHratio = marginH * 2.5; // uniquement utilisée pour la création de svgPlot
  const widthRatio = width - marginHratio; // uniquement utilisée pour l'échelle scaleX

  // création du canevas pour le Graphique
  const svg = d3
    .select(graphCfg.target)
    .select('.grph-content')
    .insert('svg', ':first-child')
    .attr("viewBox", [0, 0, viewBox.width, viewBox.height])
    .attr("preserveAspectRatio", "xMinYMid");

  // création d'un groupe g pour le Graphique
  const svgPlot = svg
    .append("g")
    .attr("transform", `translate(${marginH + marginHratio}, ${marginV})`);

  //---------------------------------------------------------------------------------------

  // Écriture titraille graphique

  // Définition du padding à appliquer aux titres, sous-titres, source
  // pour une titraille toujours alignée avec le graphique
  const paddingTxt = `0 ${ marginH / viewBox.width * 100 }%`

  // Écriture du titre
  d3.select(graphCfg.target)
    .select('.grph-title')
    .html(graphCfg.title)
    .style("padding", paddingTxt);

  // Date à afficher dans le titre
  // ATTENTION CETTE DATE DOIT FORCÉMENT ÊTRE PRISE DANS LE DATASET DU TAUX D'INCIDENCE
  const formatTimeToTitle = d3.timeFormat("%d %b %Y");
  const dateMax = d3.max(tidyData, d => d.date);
  const actualDate = new Date(dateMax);
  const dateToTitle = formatTimeToTitle(actualDate);

  // Écriture du sous-titre
  d3.select(graphCfg.target)
    .select('.grph-subtitle')
    .html(graphCfg.subtitle.replace(/\[\[\s*autoDate\s*\]\]/, `${ dateToTitle }`))
    .style("padding", paddingTxt);

  // Écriture de la source
  d3.select(graphCfg.target)
    .select('.grph-caption')
    .html(graphCfg.caption)
    .style("padding", paddingTxt);

  //---------------------------------------------------------------------------------------

  // Création des échelles

  // échelle linéaire pour l'axe des X
  const scaleX = d3
    .scaleLinear()
    .domain([0, 100]) // graphique en pourcentages, donc minimum à 0 et max à 100
    .range([0, widthRatio]);

  // échelle pour l'épaisseur des barres des barres et les placement sur l'axe Y
  const scaleY = d3
    .scaleBand()
    .domain(d3.range(tidyData.length))
    .range([height, 0])
    .padding(0.2);

  //---------------------------------------------------------------------------------------

  // Création des axes

  // Axe des X
  const xAxis = (g) =>
    g
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisLeft(scaleX).ticks(0))
      .call((g) => g.select(".domain").remove()); // supprime la ligne de l'axe

  // Axe des Y
  const yAxis = (g) =>
    g
      .attr("transform", `translate(0, 0)`)
      .call(
        d3
          .axisLeft(scaleY)
          .tickFormat((i) => tidyData[i].pays)
          .tickSizeOuter(0)
      )
      .call((g) => g.select(".domain").remove()) // supprime la ligne de l'axe
      .selectAll("text")
      .style("font-size", scaleY.bandwidth() * 0.4 + "px")
      .style("fill", "grey"); // couleur du texte

  //---------------------------------------------------------------------------------------

  // Création du Bar Chart

  const rectFill = svgPlot
    .append("g")
    .selectAll("rect")
    .data(tidyData)
    .join("rect")
    .attr("y", (d, i) => scaleY(i))
    .attr("x", scaleX(0))
    .attr("width", (d) => scaleX(d.tx_vacc))
    .attr("height", scaleY.bandwidth()) // width des barres avec l'échelle d'épaiseur
    .attr("fill", d => d.pays === 'France' ? '#D55E00' : '#0072B2') // orange pour la France et bleu pour les autres pays
    .attr("opacity", 0.6);

  const rectFrame = svgPlot
    .append("g")
    .selectAll("rect")
    .data(tidyData)
    .join("rect")
    .attr("y", (d, i) => scaleY(i))
    .attr("x", (d) => scaleX(0))
    .attr("width", (d) => scaleX(100))
    .attr("height", scaleY.bandwidth()) // width des barres avec l'échelle d'épaiseur
    .attr("fill", "transparent")
    .attr("stroke-width", "2px")
    .attr("stroke", "grey")
    .attr("opacity", 1);

  //---------------------------------------------------------------------------------------

  // Création des labels

  const text = svgPlot
    .selectAll("text")
    .data(tidyData)
    .join("text")
    .attr("y", (d, i) => {
      return scaleY(i) + scaleY.bandwidth() / 1.5;
    })
    // écriture à l'intérieur ou à l'extérieur des barres
    .attr("x", (d) =>
      scaleX(d.tx_vacc) >= 50 ? scaleX(d.tx_vacc) - 50 : scaleX(d.tx_vacc) + 4
    )
    .text((d) => Math.round(d.tx_vacc) + "%")
    // en blanc si à l'intérieur des barres, en gris si à l'extérieur
    .attr("fill", (d) => (scaleX(d.tx_vacc) >= 50 ? "#ffffff" : "grey"))
    .attr("font-size", scaleY.bandwidth() * 0.4 + "px");

  //---------------------------------------------------------------------------------------

  // Placement des axes

  // Placement X
  svgPlot.append("g").call(xAxis);

  // Placement Y
  svgPlot.append("g").call(yAxis).attr("color", "transparent"); // les ticks de l'axe X sont transparents
}
