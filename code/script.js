// create_buttons()
// reset_buttons()



  var data = d3.csv("https://raw.githubusercontent.com/kor-al/porings/master/poring_family.csv")
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

    console.log(nestedData);

    const statsdia = new StatsDiagram({
      element: document.querySelector('#statsDiagram-container'),
      data: nestedData
    });

    const damagedia = new DamageDiagram({
      element: document.querySelector('#damageDiagram-container'),
      data: nestedData
    });

    const selector = new PoringSelector({
      element: document.querySelector('#selector-container'),
      data: nestedData,
      graphs : {statsDiagram: statsdia,
                damageDiagram: damagedia }
    });


    //createStatsDiagram("#statsDia_svg");
    //createPropsDiagram("#propsDia_svg");
    //createDamageDiagram("#damageDia_svg");
    //createDistDiagram("#distDia_svg",inData);
    //createSelector(nestedData, "#selector_svg", {statsDiagram: statsdia});
    //handle_buttons(inData);

  };
