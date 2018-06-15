var tape = require("tape"),
  d3VoronoiMap = require("../build/d3-voronoi-map");

tape("voronoiMap(...) should set the expected defaults", function (test) {
  var voronoiMap = d3VoronoiMap.voronoiMap(),
    datum = {
      weight: 1
    };

  test.equal(voronoiMap.weight()(datum), 1);
  test.equal(voronoiMap.convergenceRatio(), 0.01);
  test.equal(voronoiMap.maxIterationCount(), 50);
  test.equal(voronoiMap.minWeightRatio(), 0.01);
  test.deepEqual(voronoiMap.clip(), [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0]
  ]);
  test.deepEqual(voronoiMap.extent(), [
    [0, 0],
    [1, 1]
  ]);
  test.deepEqual(voronoiMap.size(), [1, 1]);
  test.end();
});

tape("voronoiMap.weight(...) should set the specified weight-accessor", function (test) {
  var voronoiMap = d3VoronoiMap.voronoiMap(),
    datum = {
      weight: 1,
      weightPrime: 2
    },
    newAccessor = function (d) {
      return d.weightPrime;
    };

  test.equal(voronoiMap.weight(newAccessor), voronoiMap);
  test.equal(voronoiMap.weight(), newAccessor);
  test.equal(voronoiMap.weight()(datum), 2);
  test.end();
});

tape("voronoiMap.clip(...) should set the adequate convex, hole-free, counterclockwise clipping polygon, extent and size", function (test) {
  var voronoiMap = d3VoronoiMap.voronoiMap(),
    newClip = [
      [1, 1],
      [1, 3],
      [3, 1],
      [3, 3]
    ]; //self-intersecting polygon

  test.equal(voronoiMap.clip(newClip), voronoiMap);
  test.deepEqual(voronoiMap.clip(), [
    [3, 3],
    [3, 1],
    [1, 1],
    [1, 3]
  ]);
  test.deepEqual(voronoiMap.extent(), [
    [1, 1],
    [3, 3]
  ]);
  test.deepEqual(voronoiMap.size(), [2, 2]);
  test.end();
});

tape('voronoiMap.extent(...) should set adequate extent, clipping polygon and size', function (test) {
  var voronoiMap = d3VoronoiMap.voronoiMap(),
    newExtent = [
      [1, 1],
      [3, 3]
    ];

  test.equal(voronoiMap.extent(newExtent), voronoiMap);
  test.deepEqual(voronoiMap.clip(), [
    [1, 1],
    [1, 3],
    [3, 3],
    [3, 1]
  ]);
  test.deepEqual(voronoiMap.extent(), [
    [1, 1],
    [3, 3]
  ]);
  test.deepEqual(voronoiMap.size(), [2, 2]);
  test.end();
});

tape('voronoiMap.size(...) should set adequate size, clipping polygon and extent', function (test) {
  var voronoiMap = d3VoronoiMap.voronoiMap(),
    newSize = [2, 3];

  test.equal(voronoiMap.size(newSize), voronoiMap);
  test.deepEqual(voronoiMap.clip(), [
    [0, 0],
    [0, 3],
    [2, 3],
    [2, 0]
  ]);
  test.deepEqual(voronoiMap.extent(), [
    [0, 0],
    [2, 3]
  ]);
  test.deepEqual(voronoiMap.size(), [2, 3]);
  test.end();
});

tape("voronoiMap.convergenceRatio(...) should set the specified convergence treshold", function (test) {
  var voronoiMap = d3VoronoiMap.voronoiMap();

  test.equal(voronoiMap.convergenceRatio(0.001), voronoiMap);
  test.equal(voronoiMap.convergenceRatio(), 0.001);
  test.end();
});

tape("voronoiMap.maxIterationCount(...) should set the specified allowed number of iterations", function (test) {
  var voronoiMap = d3VoronoiMap.voronoiMap();

  test.equal(voronoiMap.maxIterationCount(100), voronoiMap);
  test.equal(voronoiMap.maxIterationCount(), 100);
  test.end();
});

tape("voronoiMap.minWeightRatio(...) should set the specified ratio", function (test) {
  var voronoiMap = d3VoronoiMap.voronoiMap();

  test.equal(voronoiMap.minWeightRatio(0.001), voronoiMap);
  test.equal(voronoiMap.minWeightRatio(), 0.001);
  test.end();
});

tape("voronoiMap.initialPosition(...)", function (test) {
  test.test("voronoiMap.initialPosition(...) should set the specified callback", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap();
    var datum = {
      weight: 1,
      precomputedX: 0.3,
      precomputedY: 0.7
    };
    var newAccessor = function (d, i, arr, clippingPolygon) {
      return [d.precomputedX, d.precomputedY];
    };

    test.equal(voronoiMap.initialPosition(newAccessor), voronoiMap);
    test.equal(voronoiMap.initialPosition(), newAccessor);
    test.deepEqual(voronoiMap.initialPosition()(datum), [0.3, 0.7]);
    test.end();
  });

  test.test("voronoiMap.initialPosition(...) should fallback to a random position if specified callback retruns a position ouside the clipping polygon", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap(),
      data = [{
        weight: 1,
        precomputedX: 2,
        precomputedX: 3
      }],
      newAccessor = function (d, i, arr, clippingPolygon) {
        return [d.precomputedX, d.precomputedY];
      };
    res = voronoiMap.maxIterationCount(0).initialPosition(newAccessor)(data),
      initX = res.polygons[0].site.originalObject.x,
      initY = res.polygons[0].site.originalObject.y;

    test.notEqual(initX, 2);
    test.ok(initX > 0 && initX < 1);
    test.notEqual(initY, 3);
    test.ok(initY > 0 && initY < 1);
    test.end();
  });

  test.test("voronoiMap.initialPosition(...) should fallback to a random position if specified callback retruns unexpected results", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap(),
      data = [{
        weight: 1,
        precomputedX: 2,
        precomputedY: 2
      }];
    var newAccessor, res, initX, initY;

    newAccessor = function (d, i, arr, clippingPolygon) {
      return [d.precomputedX, NaN];
    }; // NaN
    res = voronoiMap.maxIterationCount(0).initialPosition(newAccessor)(data),
      initX = res.polygons[0].site.originalObject.x,
      initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    newAccessor = function (d, i, arr, clippingPolygon) {
      return [undefined, d.precomputedY];
    }; // undefined
    res = voronoiMap.maxIterationCount(0).initialPosition(newAccessor)(data),
      initX = res.polygons[0].site.originalObject.x,
      initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    newAccessor = function (d, i, arr, clippingPolygon) {
      return [d.precomputedX, null];
    }; // null
    res = voronoiMap.maxIterationCount(0).initialPosition(newAccessor)(data),
      initX = res.polygons[0].site.originalObject.x,
      initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    newAccessor = function (d, i, arr, clippingPolygon) {
      return ["foo", d.precomputedY]
    }; // not a number
    res = voronoiMap.maxIterationCount(0).initialPosition(newAccessor)(data),
      initX = res.polygons[0].site.originalObject.x,
      initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    newAccessor = function (d, i, arr, clippingPolygon) {
      return d.precomputedY;
    }; // not an array
    res = voronoiMap.maxIterationCount(0).initialPosition(newAccessor)(data),
      initX = res.polygons[0].site.originalObject.x,
      initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    test.end();
  });
});

tape("voronoiMap.(...) should compute Voronoï map", function (test) {
  test.test("basic use case", function (test) {
    var voronoiMap = d3VoronoiMap.voronoiMap().maxIterationCount(1),
      data = [{
        weight: 1
      }, {
        weight: 1
      }],
      res = voronoiMap(data);

    test.equal(res.polygons.length, 2);
    test.equal(res.iterationCount, 1);
    test.ok(res.convergenceRatio);
    test.end();
  });
});