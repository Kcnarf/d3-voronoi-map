var tape = require("tape"),
  d3VoronoiMapInitialWeightHalfAverageArea = require("../build/initial-weight-policies/half-average-area"),
  d3VoronoiMap = require("../build/d3-voronoi-map");

tape("initial-weight-policies/half-average-area(...)", function (test) {
  test.test("initial-weight-policies/half-average-area(...) should depends on clipping polygon", function (test) {
    var initialWeightHalfAverageArea = d3VoronoiMapInitialWeightHalfAverageArea(),
      voronoiMap = d3VoronoiMap.voronoiMap().size([2, 3]),
      data = [{
        weight: 1
      }];

    test.equal(initialWeightHalfAverageArea(data[0], 0, data, voronoiMap), 3);
    test.end();
  });

  test.test("initial-weight-policies/half-average-area(...) should depends on number of data", function (test) {
    var initialWeightHalfAverageArea = d3VoronoiMapInitialWeightHalfAverageArea(),
      voronoiMap = d3VoronoiMap.voronoiMap(),
      data = [{
        weight: 1
      }, {
        weight: 1
      }];

    test.equal(initialWeightHalfAverageArea(data[0], 0, data, voronoiMap), 0.25);
    test.end();
  });

});