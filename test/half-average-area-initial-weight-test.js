var tape = require("tape"),
    d3WeightedVoronoi = require("d3-weighted-voronoi"),
    halfAverageAreaInitialWeight = require("../build/half-average-area-initial-weight");

tape("halfAverageAreaInitialWeight(...)", function(test) {
  test.test("halfAverageAreaInitialWeight(...) should depends on clipping polygon", function(test) {
    var weightedVoronoi = d3WeightedVoronoi.weightedVoronoi().size([2,3]),
        data = [{weight: 1}];

    test.equal(halfAverageAreaInitialWeight(data[0], 0, data, weightedVoronoi), 3);
    test.end();
  });

  test.test("halfAverageAreaInitialWeight(...) should depends on number of data", function(test) {
    var weightedVoronoi = d3WeightedVoronoi.weightedVoronoi(),
        data = [{weight: 1}, {weight: 1}];

        test.equal(halfAverageAreaInitialWeight(data[0], 0, data, weightedVoronoi), 0.25);
    test.end();
  });

});