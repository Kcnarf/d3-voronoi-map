var tape = require("tape"),
  d3VoronoiMapInitialPositionRandom = require("../build/initial-position-policies/random"),
  d3VoronoiMap = require("../build/d3-voronoi-map");

tape("initial-position-policies/pie()(...) default test", function (test) {
  var initialPositionRandom = d3VoronoiMapInitialPositionRandom(),
    data = [{
      weight: 1
    }],
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data),
    initCoords = initialPositionRandom(data[0], 0, data, voronoiMapSimulation);

  test.ok(initCoords[0] > 0);
  test.ok(initCoords[0] < 1);
  test.ok(initCoords[1] > 0);
  test.ok(initCoords[1] < 1);

  test.end();
});

tape("initial-position-policies/pie(...) should depends on clipping polygon", function (test) {
  var initialPositionRandom = d3VoronoiMapInitialPositionRandom(),
    data = [{
      weight: 1
    }],
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data).extent([
      [1, 1],
      [2, 2]
    ]),
    initCoords = initialPositionRandom(data[0], 0, data, voronoiMapSimulation);

  test.ok(initCoords[0] > 1);
  test.ok(initCoords[0] < 2);
  test.ok(initCoords[1] > 1);
  test.ok(initCoords[1] < 2);

  test.end();
});