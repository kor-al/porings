
  
  // d3.csv("../poring_family_facts.csv")
  // .then(function(data) {
  //     main(data);
  //   });

  Promise.all([
    d3.csv("../poring_family.csv"),
    d3.json("../facts.json"),
]).then(function(files) {
  main(files[0], files[1]);
})


  function main(inData, factsData) {

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
      element: document.querySelector('#statsDiagram-container')
    });

    const damagedia = new DamageDiagram({
      element: document.querySelector('#damageDiagram-container')
    });

    const propsdia = new PropsDiagram({
      element: document.querySelector('#propsDiagram-container')
    });

    const distdia = new DistDiagram({
      element: document.querySelector('#distDiagram-container'),
      data: inData,
      button_element: document.querySelector('#dist-buttons')
    });

    const facts_elem = new FactsBox({
      element: document.querySelector('#mobFacts-container'),
      facts_data: factsData
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

  };
