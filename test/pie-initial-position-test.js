var tape = require("tape"),
  d3VoronoiMapInitialPositionPie = require("../build/initial-position-policies/pie"),
  d3VoronoiMap = require("../build/d3-voronoi-map");

tape("initial-position-policies/pie() should set the expected defaults", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie();

  test.equal(initialPositionPie.startAngle(), 0);
  test.end();
});

tape("initial-position-policies/pie().startAngle(...) should set the expected start angle", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie();

  test.equal(initialPositionPie.startAngle(Math.PI), initialPositionPie);
  test.equal(initialPositionPie.startAngle(), Math.PI);
  test.end();
});

tape("initial-position-policies/pie()(...) default test", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie(),
    voronoiMap = d3VoronoiMap.voronoiMap(),
    data = [{
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }];
  var expectedInitCoords = [
    [0.5 + .25, 0.5],
    [0.5, 0.5 + .25],
    [0.5 - .25, 0.5],
    [0.5, 0.5 - 0.25]
  ]
  var initCoords;

  data.forEach(function (d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
  })
  test.end();
});

tape("initial-position-policies/pie()(...) should depends on startAngle", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie().startAngle(Math.PI / 2),
    voronoiMap = d3VoronoiMap.voronoiMap(),
    data = [{
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }];
  var expectedInitCoords = [
    [0.5, 0.5 + .25],
    [0.5 - .25, 0.5],
    [0.5, 0.5 - 0.25],
    [0.5 + .25, 0.5]
  ]
  var initCoords;

  data.forEach(function (d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
  })
  test.end();
});

tape("initial-position-policies/pie(...) should depends on clipping polygon", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie(),
    voronoiMap = d3VoronoiMap.voronoiMap().size([2, 3]),
    data = [{
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }],
    expectedInitCoords = [
      [1 + .5, 1.5],
      [1, 1.5 + .5],
      [1 - .5, 1.5],
      [1, 1.5 - .5]
    ];
  var initCoords;

  data.forEach(function (d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
  })
  test.end();
});

tape("initial-position-policies/pie(...) should depends on startAngle", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie(),
    voronoiMap = d3VoronoiMap.voronoiMap().size([2, 3]),
    data = [{
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }],
    expectedInitCoords = [
      [1 + .5, 1.5],
      [1, 1.5 + .5],
      [1 - .5, 1.5],
      [1, 1.5 - .5]
    ];
  var initCoords;

  data.forEach(function (d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
  })
  test.end();
});

tape("initial-position-policies/pie(...) should handle irregular polygon", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie(),
    voronoiMap = d3VoronoiMap.voronoiMap().clip([
      [1, 0],
      [3, 0],
      [4, 1],
      [2, 4],
      [0, 1]
    ]), // diamond shape, centroïd at [2, 1.518518], innner radius is 1.376478
    halfInnerRadius = 1.376478 / 2,
    data = [{
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }],
    expectedInitCoords = [
      [2 + halfInnerRadius, 1.518518],
      [2, 1.518518 + halfInnerRadius],
      [2 - halfInnerRadius, 1.518518],
      [2, 1.518518 - halfInnerRadius]
    ]
  var initCoords;

  data.forEach(function (d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
  })
  test.end();
});

tape("initial-position-policies/pie(...) should depend on number of data", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie(),
    voronoiMap = d3VoronoiMap.voronoiMap(),
    data = [{
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }],
    expectedInitCoords = [
      [0.5 + 0.25 * Math.cos(2 * Math.PI / 3 * 0), 0.5 + 0.25 * Math.sin(2 * Math.PI / 3 * 0)],
      [0.5 + 0.25 * Math.cos(2 * Math.PI / 3 * 1), 0.5 + 0.25 * Math.sin(2 * Math.PI / 3 * 1)],
      [0.5 + 0.25 * Math.cos(2 * Math.PI / 3 * 2), 0.5 + 0.25 * Math.sin(2 * Math.PI / 3 * 2)]
    ];
  var initCoords;

  data.forEach(function (d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
  })
  test.end();
});

tape("initial-position-policies/pie(...) should handle data of length 1", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie(),
    voronoiMap = d3VoronoiMap.voronoiMap(),
    data = [{
      weight: 1
    }],
    expectedInitCoords = [
      [0.5 + .25, 0.5]
    ];
  var initCoords;

  initCoords = initialPositionPie(data[0], 0, data, voronoiMap);
  test.ok(initCoords[0] > expectedInitCoords[0][0] - 1E-3);
  test.ok(initCoords[0] < expectedInitCoords[0][0] + 1E-3);
  test.ok(initCoords[1] > expectedInitCoords[0][1] - 1E-3);
  test.ok(initCoords[1] < expectedInitCoords[0][1] + 1E-3);
  test.end();
});

tape("initial-position-policies/pie(...) should handle clipping polygon updates", function (test) {
  var initialPositionPie = d3VoronoiMapInitialPositionPie(),
    voronoiMap = d3VoronoiMap.voronoiMap(),
    data = [{
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }, {
      weight: 1
    }],
    expectedInitCoords = [
      [0.5 + .25, 0.5],
      [0.5, 0.5 + .25],
      [0.5 - .25, 0.5],
      [0.5, 0.5 - 0.25]
    ];
  var initCoords;

  data.forEach(function (d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
  })

  voronoiMap.size([2, 2]);
  expectedInitCoords = [
    [1 + .5, 1],
    [1, 1 + .5],
    [1 - .5, 1],
    [1, 1 - 0.5]
  ]
  data.forEach(function (d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
  })
  test.end();
});