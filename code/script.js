// create_buttons()
// reset_buttons()



  var data = d3.csv("../poring_family_facts.csv")
    .then(function(data) {
      main(data);
    });



  function main(inData) {

    var nestedData = d3.nest()
      .key(function(d) {
        return d.viz_group;
      })
      .key(function(d) {
        return d.name;
      })
      .rollup(function(leaves) {
        return {
          "length": leaves.length,
          "values": leaves
        }
      })
      .entries(inData)
      .map(function(d) {
        return {
          group: d.key,
          mob_types: d.values
        };
      });

    nestedData.forEach(function(d) {
      d.group_size = d.mob_types.length
    });

    // console.log(nestedData);

    const statsdia = new StatsDiagram({
      element: document.querySelector('#statsDiagram-container'),
      data: nestedData
    });

    const damagedia = new DamageDiagram({
      element: document.querySelector('#damageDiagram-container'),
      data: nestedData
    });

    const propsdia = new PropsDiagram({
      element: document.querySelector('#propsDiagram-container'),
      data: nestedData
    });

    const distdia = new DistDiagram({
      element: document.querySelector('#distDiagram-container'),
      data: inData,
      button_element: document.querySelector('body')
    });

    const facts_elem = new FactsBox({
      element: document.querySelector('#mobFacts-container')
    });

    const selector = new PoringSelector({
      element: document.querySelector('#selector-container'),
      data: nestedData,
      graphs : {statsDiagram: statsdia,
                damageDiagram: damagedia,
                propsDiagram: propsdia,
                 distDiagram: distdia ,
                 factsBox: facts_elem}
    });




    //createStatsDiagram("#statsDia_svg");
    //createPropsDiagram("#propsDia_svg");
    //createDamageDiagram("#damageDia_svg");
    //createDistDiagram("#distDia_svg",inData);
    //createSelector(nestedData, "#selector_svg", {statsDiagram: statsdia});
    //handle_buttons(inData);

  };
