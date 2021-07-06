Promise.all([
    d3.json("data/ftv_eu.geojson"),
    d3.csv("data/owid_incid.csv")
  ]).then(showData);
  
  function showData(data) {
    const graphCfg = {
      target: `#eu-graph01`,
      title: `Nombre de cas Covid-19 par pays en Europe`,
      subtitle: `en pourcentage de la population ayant reçu au moins une injection, au [[autoDate]]`,
      caption: `Source. <a href='https://www.data.gouv.fr/fr/organizations/sante-publique-france/' target='_blank'>Santé publique France</a>`,
    }
  
    // Tri des données
  
    // données carto
    let dataMap = data[0];
  
    // données taux de vaccination
    let dataVacc = data[1];
  
    // création d'un container pour le tri des données de vaccination
    let dataContainer = {
      new_cases_smoothed_per_million: {},
      date: {}
    };
  
    // répartition des données d'incidence dans le container
    for (let d of dataVacc) {
  
      let code_pays = d.iso_code;
  
      dataContainer.new_cases_smoothed_per_million[code_pays] = d.new_cases_smoothed_per_million;
      dataContainer.date[code_pays] = d.date;
  
    }
  
    // répartition des données d'incidence dans les properties des polygones de la carte
    dataMap.features = dataMap.features.map((d) => {
  
      let code_pays = d.properties.iso_a3;
  
      d.properties.new_cases_smoothed_per_million = +dataContainer.new_cases_smoothed_per_million[code_pays]; // ATTENTION STRING A TRANSPOSER EN FLOAT
      d.properties.date = new Date(dataContainer.date[code_pays]); // ATTENTION À TRANSPOSER EN FORMAT DATE
  
      return d;
  
    });
  
    //---------------------------------------------------------------------------------------
  
    // Création du canevas SVG
  
    const width = 500;
    const height = 300;
    const marginH = 80;
    const marginV = 20;
    const leg = 20;
  
    const viewBox = {
      width: width + marginH * 2,
      height: height + leg + marginV * 2
    };
  
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
  
    // Date à afficher dans le titre
    // ATTENTION CETTE DATE DOIT FORCÉMENT ÊTRE PRISE DANS LE DATASET DU TAUX D'INCIDENCE
    const formatTimeToTitle = d3.timeFormat("%d %b %Y");
    const actualDate = new Date(dataVacc[0].date);
    const dateToTitle = formatTimeToTitle(actualDate);
  
    // Écriture titraille graphique
  
    // Définition du padding à appliquer aux titres, sous-titres, source
    // pour une titraille toujours alignée avec le graphique
    const paddingTxt = `0 ${marginH / viewBox.width * 100}%`
  
    // Écriture du titre
    d3.select(graphCfg.target)
      .select('.grph-title')
      .html(graphCfg.title)
      .style("padding", paddingTxt);
  
    // Écriture du sous-titre
    d3.select(graphCfg.target)
      .select('.grph-subtitle')
      .html(graphCfg.subtitle.replace(/\[\[\s*autoDate\s*\]\]/, `${dateToTitle}`))
      .style("padding", paddingTxt);
  
    // Écriture de la source
    d3.select(graphCfg.target)
      .select('.grph-caption')
      .html(graphCfg.caption)
      .style("padding", paddingTxt);
  
    //---------------------------------------------------------------------------------------
  
    // Création de l'échelle de couleur
  
    // échelle de couleur
    const seqScale = d3.scaleLinear()
      .domain([0, 0.5, 2.5, 5, 10, 50, 100, 500, 1000, 4000])
      .range(['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d', '#011615']);
  
  
    //---------------------------------------------------------------------------------------
  
    // Projection carte
  
    // définition de la projection de la carte (en geoNaturalEarth1)
    const projection = d3.geoNaturalEarth1()
      .center([15, 54])
      //.scale([width / (1.3 * Math.PI)])
      .translate([width / 2, height / 2])
      .scale([width/1.1]);
  
    // création d'un générateur géographique de formes
    const path = d3.geoPath().projection(projection);
  
    // création d'un groupe g par polygone
    const polygons = svgPlot
      .selectAll("g")
      .data(dataMap.features)
      .join("g")
    // projection des polygones géographiques
    polygons
      .append("path")
      .attr("d", (d) => path(d))
      .attr("stroke", "#ffffff")
      .attr("fill", (d) => d.properties.new_cases_smoothed_per_million ? seqScale(d.properties.new_cases_smoothed_per_million) : "#eee")
      .style("stroke-width", "0.5px");
  
  
  
    //---------------------------------------------------------------------------------------
  
    // Legende ---- fonctionne avec l'API d3-legend
    // https://d3-legend.susielu.com/
  
    // paramètres de la legende à l'aide de la variable legCells définie avec l'échelled de couleur
    const legend = d3
      .legendColor()
      .shapeWidth(width / 10)
      .shapeHeight(10)
      .cells([0, 0.5, 2.5, 5, 10, 50, 100, 500, 1000, 4000])
      .orient("horizontal")
      .labelAlign("middle")
      .scale(seqScale);
  
    // projection de la légende
    svgLegend.call(legend)
      .selectAll("text")
      .attr("fill", "grey")
      .attr("font-size", "12px");
  
    //---------------------------------------------------------------------------------------
  
    // Animation carte
  
    // Animation carte
  
    // création d'un groupe g qui contiendra le tooltip de la légende
    const tooltip = svgPlot.append("g")
      .attr("transform", `translate(${0}, ${height / 1.4})`);
  
    // condition pour que l'animation ne fonctionne que sur desktop
    // voir script device_detector pour la fonction deviceType()
    if (deviceType() == "desktop") {
      polygons.on("mouseover", function (d) {
        // lors du survol avec la souris l'opacité des barres passe à 1
        d3.select(this)
          .attr("opacity", 0.8)
          .style('cursor', 'default');

        tooltip
            .append('text')
            .text(d.properties.name_fr)
  
     
  
      });
  
      // efface le contenu du groupe g lorsque la souris ne survole plus le polygone
      polygons.on("mouseout", function () {
  
        d3.select(this).attr("opacity", 1); // rétablit l'opacité à 1
  
        tooltip.selectAll("text").remove();
        tooltip.selectAll("rect").remove();
  
      });
    }
  
  }
  