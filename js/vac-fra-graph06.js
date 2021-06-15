Promise.all([
  d3.json("data/ftv_reg.geojson"),
  d3.csv("data/incid_dep.csv"),
]).then(showData);

function showData(data) {
  const graphCfg = {
    target: `#vac-fra-graph06`,
    title: `Taux de vaccination par région`,
    subtitle: ``,
    caption: `Source. <a href='https://www.data.gouv.fr/fr/organizations/sante-publique-france/' target='_blank'>Santé publique France</a>`,
  }

  // Tri des données

  // données carto
  let dataMap = data[0];

  // données incidence
  let dataIncid = data[1];

  //---------------------------------------------------------------------------------------

  // Création du canevas SVG

  const width = 500;
  const height = 500;
  const marginH = 80;
  const marginV = 20;
  const leg = 20;

  const viewBox = {
    width: width + marginH * 2,
    height: height + leg + marginV * 2
  }

  // création du canevas pour le Graphique
  const svg = d3
    .select(graphCfg.target)
    .select('.grph-content')
    .insert('svg', ':first-child')
    .attr("viewBox", [0, 0, viewBox.width, viewBox.height])
    .attr("preserveAspectRatio", "xMinYMid");

  // création d'un groupe g pour la Légende
  const svgLegend = svg
    .append("g")
    .attr("transform", `translate(${marginH}, ${marginV})`);

  // création d'un groupe g pour le Graphique
  const svgPlot = svg
    .append("g")
    .attr("transform", `translate(${marginH}, ${marginV + leg})`);

  //---------------------------------------------------------------------------------------

  // Écriture titraille graphique

  // Définition du padding à appliquer aux titres, sous-titres, source
  // pour une titraille toujours alignée avec le graphique
  const paddingTxt = `0 ${ marginH / viewBox.width * 100 }%`

  // Écriture du titre
  d3.select(graphCfg.target)
    .select('.grph-title')
    .html(graphCfg.title)
    .style("padding", paddingTxt)

  // Écriture du sous-titre
  d3.select(graphCfg.target)
    .select('.grph-subtitle')
    .html(graphCfg.subtitle.replace(/\[\[\s*startDate\s*\]\]/, `${ graphCfg?.startDate?.day === 1 ? graphCfg?.startDate?.day + 'er' : graphCfg?.startDate?.day } ${ commonGraph.locale.months[graphCfg?.startDate?.month - 1] } ${ graphCfg?.startDate?.year }`))
    .style("padding", paddingTxt)

  // Écriture de la source
  d3.select(graphCfg.target)
    .select('.grph-caption')
    .html(graphCfg.caption)
    .style("padding", paddingTxt)

  //---------------------------------------------------------------------------------------

  // Création de l'échelle de couleur

  // échelle de couleur

  //---------------------------------------------------------------------------------------

  // Projection carte

  // définition de la projection de la carte (en geoMercator)
  const projection = d3
    .geoMercator()
    .center([2.2, 47.366021])
    .scale(1800)
    .translate([width / 2, height / 2]);

  // création d'un générateur géographique de formes
  const path = d3.geoPath().projection(projection);

  // projection des polygones géographiques
  const polygons = svgPlot
    .selectAll("path")
    .data(dataMap.features)
    .join("path")
    .attr("d", (d) => path(d))
    .attr("stroke", "#ffffff")
    .attr("fill", "grey");

  //---------------------------------------------------------------------------------------

  // Legende ---- fonctionne avec l'API d3-legend
  // https://d3-legend.susielu.com/

  //---------------------------------------------------------------------------------------

  // Animation carte
}
