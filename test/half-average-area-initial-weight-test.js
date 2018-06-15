var tape = require("tape"),
  d3VoronoiMap = require("../build/d3-voronoi-map"),
  halfAverageAreaInitialWeight = require("../build/initial-weight-policies/half-average-area");

tape("initial-weight-policies/half-average-area(...)", function (test) {
  test.test("initial-weight-policies/half-average-area(...) should depends on clipping polygon", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap().size([2, 3]),
      data = [{
        weight: 1
      }];

    test.equal(halfAverageAreaInitialWeight(data[0], 0, data, voronoiMap), 3);
    test.end();
  });

  test.test("initial-weight-policies/half-average-area(...) should depends on number of data", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap(),
      data = [{
        weight: 1
      }, {
        weight: 1
      }];

    test.equal(halfAverageAreaInitialWeight(data[0], 0, data, voronoiMap), 0.25);
    test.end();
  });

});