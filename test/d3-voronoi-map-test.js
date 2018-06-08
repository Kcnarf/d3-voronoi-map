var tape = require("tape"),
  d3VoronoiMap = require("../build/d3-voronoi-map");

tape("voronoiMapSimulation(...) should set the expected defaults", function (test) {
  const datum = {
      weight: 1
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

  test.equal(voronoiMapSimulation.weight()(datum), 1);
  test.equal(voronoiMapSimulation.convergenceRatio(), 0.01);
  test.equal(voronoiMapSimulation.maxIterationCount(), 50);
  test.equal(voronoiMapSimulation.minWeightRatio(), 0.01);
  test.deepEqual(voronoiMapSimulation.clip(), [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0]
  ]);
  test.equal(voronoiMapSimulation.on('tick'), undefined);
  test.equal(voronoiMapSimulation.on('end'), undefined);
  test.end();
});

tape("voronoiMapSimulationSimulation.weight(...) should set the specified weight-accessor", function (test) {
  const datum = {
      weight: 1,
      weightPrime: 2
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    newAccessor = function (d) {
      return d.weightPrime;
    };

  test.equal(voronoiMapSimulation.weight(newAccessor), voronoiMapSimulation);
  test.equal(voronoiMapSimulation.weight(), newAccessor);
  test.equal(voronoiMapSimulation.weight()(datum), 2);
  test.end();
});

tape("voronoiMapSimulationSimulation.clip(...) should set the adequate convex, hole-free, counterclockwise clipping polygon", function (test) {
  const datum = {
      weight: 1
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    newClip = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ]; //self-intersecting polygon

  test.equal(voronoiMapSimulation.clip(newClip), voronoiMapSimulation);
  test.deepEqual(voronoiMapSimulation.clip(), [
    [1, 1],
    [1, 0],
    [0, 0],
    [0, 1]
  ]);
  test.end();
});

tape("voronoiMapSimulationSimulation.convergenceRatio(...) should set the specified convergence treshold", function (test) {
  const datum = {
      weight: 1
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

  test.equal(voronoiMapSimulation.convergenceRatio(0.001), voronoiMapSimulation);
  test.equal(voronoiMapSimulation.convergenceRatio(), 0.001);
  test.end();
});

tape("voronoiMapSimulationSimulation.maxIterationCount(...) should set the specified allowed number of iterations", function (test) {
  const datum = {
      weight: 1
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

  test.equal(voronoiMapSimulation.maxIterationCount(100), voronoiMapSimulation);
  test.equal(voronoiMapSimulation.maxIterationCount(), 100);
  test.end();
});

tape("voronoiMapSimulationSimulation.minWeightRatio(...) should set the specified ratio", function (test) {
  const datum = {
      weight: 1
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

  test.equal(voronoiMapSimulation.minWeightRatio(0.001), voronoiMapSimulation);
  test.equal(voronoiMapSimulation.minWeightRatio(), 0.001);
  test.end();
});

tape("voronoiMapSimulationSimulation.initialPosition(...)", function (test) {

  test.test("voronoiMapSimulationSimulation.initialPosition(...) should set the specified callback", function (test) {
    const datum = {
        weight: 1,
        precomputedX: 0.3,
        precomputedY: 0.7
      },
      newAccessor = function (d, i, arr, clippingPolygon) {
        return [d.precomputedX, d.precomputedY];
      },
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

    test.equal(voronoiMapSimulation.initialPosition(newAccessor), voronoiMapSimulation);
    test.equal(voronoiMapSimulation.initialPosition(), newAccessor);
    test.deepEqual(voronoiMapSimulation.initialPosition()(datum), [0.3, 0.7]);
    test.end();
  });

  test.test("voronoiMapSimulationSimulation.initialPosition(...) should fallback to a random position if specified callback retruns a position ouside the clipping polygon", function (test) {
    const datum = {
        weight: 1,
        precomputedX: 2,
        precomputedY: 3
      },
      newAccessor = function (d, i, arr, clippingPolygon) {
        return [d.precomputedX, d.precomputedY];
      },
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).initialPosition(newAccessor).stop();

    const res = voronoiMapSimulation.state(),
      initX = res.polygons[0].site.originalObject.x,
      initY = res.polygons[0].site.originalObject.y;

    test.notEqual(initX, 2);
    test.ok(initX > 0 && initX < 1);
    test.notEqual(initY, 3);
    test.ok(initY > 0 && initY < 1);
    test.end();
  });

  test.test("voronoiMapSimulationSimulation.initialPosition(...) should fallback to a random position if specified callback retruns unexpected results", function (test) {
    var datum = {
        weight: 1,
        precomputedX: 2,
        precomputedY: 2
      },
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();
    var newAccessor, res, initX, initY;

    newAccessor = function (d, i, arr, clippingPolygon) {
      return [d.precomputedX, NaN];
    }; // NaN
    res = voronoiMapSimulation.initialPosition(newAccessor).state();
    initX = res.polygons[0].site.originalObject.x;
    initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    newAccessor = function (d, i, arr, clippingPolygon) {
      return [undefined, d.precomputedY];
    }; // undefined
    res = voronoiMapSimulation.initialPosition(newAccessor).state();
    initX = res.polygons[0].site.originalObject.x;
    initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    newAccessor = function (d, i, arr, clippingPolygon) {
      return [d.precomputedX, null];
    }; // null
    res = voronoiMapSimulation.initialPosition(newAccessor).state();
    initX = res.polygons[0].site.originalObject.x;
    initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    newAccessor = function (d, i, arr, clippingPolygon) {
      return ["foo", d.precomputedY]
    }; // not a number
    res = voronoiMapSimulation.initialPosition(newAccessor).state();
    initX = res.polygons[0].site.originalObject.x;
    initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    newAccessor = function (d, i, arr, clippingPolygon) {
      return d.precomputedY;
    }; // not an array
    res = voronoiMapSimulation.initialPosition(newAccessor).state();
    initX = res.polygons[0].site.originalObject.x;
    initY = res.polygons[0].site.originalObject.y;
    test.ok(initX > 0 && initX < 1);
    test.ok(initY > 0 && initY < 1);

    test.end();
  });
});

tape("voronoiMapSimulationSimulation.state() should reflect inner state of the simulation", function (test) {
  test.test("basic use case", function (test) {
    const data = [{
        weight: 1
      }, {
        weight: 1
      }],
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data).maxIterationCount(2).stop();

    voronoiMapSimulation.tick();
    var res = voronoiMapSimulation.state();

    test.equal(res.polygons.length, 2);
    test.equal(res.iterationCount, 1);
    test.ok(res.convergenceRatio);
    test.equal(res.ended, false);

    voronoiMapSimulation.tick();
    var res = voronoiMapSimulation.state();

    test.equal(res.polygons.length, 2);
    test.equal(res.iterationCount, 2);
    test.ok(res.convergenceRatio);
    test.equal(res.ended, true);
    test.end();
  });

  tape("voronoiMapSimulationSimulation.on(...)", function (test) {
    test.test("voronoiMapSimulationSimulation.on('tick', ...) should set the specified callback", function (test) {
      const datum = {
          weight: 1
        },
        onTick = function () {
          return true;
        },
        voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).maxIterationCount(1).stop();

      test.equal(voronoiMapSimulation.on('tick', onTick), voronoiMapSimulation);
      test.equal(voronoiMapSimulation.on('tick'), onTick);
      test.end();
    });

    test.test("voronoiMapSimulationSimulation.on('end', ...) should set the specified callback", function (test) {
      const datum = {
          weight: 1
        },
        onEnd = function () {
          return true;
        },
        voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

      test.equal(voronoiMapSimulation.on('end', onEnd), voronoiMapSimulation);
      test.equal(voronoiMapSimulation.on('end'), onEnd);
      test.end()
    });
  });

  tape("voronoiMapSimulation simulation should send 'tick' and 'end' events, and execute respective callbacks", function (test) {
    var i = 0;
    const datum = {
        weight: 1
      },
      onTick = function () {
        i++;
      },
      onEnd = function () {
        test.equal(i, 1);
        //only one iteration because the only one datum fills the entire clipping polygon
        test.end()
      },
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).on('tick', onTick).on('end', onEnd);
  });
});