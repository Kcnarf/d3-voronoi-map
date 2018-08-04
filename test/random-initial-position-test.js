var tape = require("tape"),
  d3VoronoiMapInitialPositionRandom = require("../build/initial-position-policies/random"),
  seedRandomHelper = require("../build/initial-position-policies/seed-random-helper"),
  d3VoronoiMap = require("../build/d3-voronoi-map");

tape("initial-position-policies/pie()(...) default test", function (test) {
  var initialPositionRandom = d3VoronoiMapInitialPositionRandom(),
    voronoiMap = d3VoronoiMap.voronoiMap(),
    data = [{
      weight: 1
    }],
    initCoords = initialPositionRandom(data[0], 0, data, voronoiMap);

  test.ok(initCoords[0] > 0);
  test.ok(initCoords[0] < 1);
  test.ok(initCoords[1] > 0);
  test.ok(initCoords[1] < 1);

  test.end();
});

tape("initial-position-policies/random(...) should have the same result when seed is set", function (test) {

  seedRandomHelper.seed(10);
  test.equal(Math.round(seedRandomHelper.random() * 10000), 2323);
  test.equal(Math.round(seedRandomHelper.random() * 10000), 7631);

  var initialPositionRandom = d3VoronoiMapInitialPositionRandom();
  var voronoiMap = d3VoronoiMap.voronoiMap();
  var data = [{weight: 1}];
  var initCoords = initialPositionRandom(data[0], 0, data, voronoiMap);

  test.equal(Math.round(initCoords[0] * 10000), 4528);
  test.equal(Math.round(initCoords[1] * 10000), 8814);

  test.end();
});

tape("initial-position-policies/pie(...) should depends on clipping polygon", function (test) {
  var initialPositionRandom = d3VoronoiMapInitialPositionRandom(),
    voronoiMap = d3VoronoiMap.voronoiMap().extent([
      [1, 1],
      [2, 2]
    ]),
    data = [{
      weight: 1
    }],
    initCoords = initialPositionRandom(data[0], 0, data, voronoiMap);

  test.ok(initCoords[0] > 1);
  test.ok(initCoords[0] < 2);
  test.ok(initCoords[1] > 1);
  test.ok(initCoords[1] < 2);

  test.end();
});