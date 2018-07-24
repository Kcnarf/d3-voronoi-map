var tape = require("tape"),
  d3VoronoiMap = require("../build/d3-voronoi-map"),
  pieInitialPosition = require("../build/initial-position-policies/pie");

tape("initial-position-policies/pie(...)", function (test) {
  test.test("initial-position-policies/pie(...) default test", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap(),
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
      initCoords = pieInitialPosition(d, i, data, voronoiMap);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
    })
    test.end();
  });

  test.test("initial-position-policies/pie(...) should depends on clipping polygon", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap().size([2, 3]),
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
      [1 + .5, 1.5],
      [1, 1.5 + .5],
      [1 - .5, 1.5],
      [1, 1.5 - .5]
    ]
    var initCoords;

    data.forEach(function (d, i) {
      initCoords = pieInitialPosition(d, i, data, voronoiMap);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
    })
    test.end();
  });

  test.test("initial-position-policies/pie(...) should handle irregular polygon", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap().clip([
        [1, 0],
        [3, 0],
        [4, 1],
        [2, 4],
        [0, 1]
      ]), // diamond shape, centroïd at [2, 1.518518], innner radius is 1.376478
      halfInnerRadius = 1.376478 / 2
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
      [2 + halfInnerRadius, 1.518518],
      [2, 1.518518 + halfInnerRadius],
      [2 - halfInnerRadius, 1.518518],
      [2, 1.518518 - halfInnerRadius]
    ]
    var initCoords;

    data.forEach(function (d, i) {
      initCoords = pieInitialPosition(d, i, data, voronoiMap);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
    })
    test.end();
  });

  test.test("initial-position-policies/pie(...) should depend on number of data", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap(),
      data = [{
        weight: 1
      }, {
        weight: 1
      }, {
        weight: 1
      }];
    var expectedInitCoords = [
      [0.5 + 0.25 * Math.cos(2 * Math.PI / 3 * 0), 0.5 + 0.25 * Math.sin(2 * Math.PI / 3 * 0)],
      [0.5 + 0.25 * Math.cos(2 * Math.PI / 3 * 1), 0.5 + 0.25 * Math.sin(2 * Math.PI / 3 * 1)],
      [0.5 + 0.25 * Math.cos(2 * Math.PI / 3 * 2), 0.5 + 0.25 * Math.sin(2 * Math.PI / 3 * 2)]
    ]
    var initCoords;

    data.forEach(function (d, i) {
      initCoords = pieInitialPosition(d, i, data, voronoiMap);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
    })
    test.end();
  });

  test.test("initial-position-policies/pie(...) should handle data of length 1", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap(),
      data = [{
        weight: 1
      }];
    var expectedInitCoords = [
      [0.5 + .25, 0.5]
    ]
    var initCoords;

    initCoords = pieInitialPosition(data[0], 0, data, voronoiMap);
    test.ok(initCoords[0] > expectedInitCoords[0][0] - 1E-3);
    test.ok(initCoords[0] < expectedInitCoords[0][0] + 1E-3);
    test.ok(initCoords[1] > expectedInitCoords[0][1] - 1E-3);
    test.ok(initCoords[1] < expectedInitCoords[0][1] + 1E-3);
    test.end();
  });

  test.test("initial-position-policies/pie(...) should handle clipping polygon updates", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap(),
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
      initCoords = pieInitialPosition(d, i, data, voronoiMap);
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
      initCoords = pieInitialPosition(d, i, data, voronoiMap);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1E-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1E-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1E-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1E-3);
    })
    test.end();
  });

});