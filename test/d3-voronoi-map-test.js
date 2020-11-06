const tape = require('tape'),
  d3VoronoiMap = require('../build/d3-voronoi-map');

tape('voronoiMapSimulation(...) should set the expected defaults', function (test) {
  const datum = {
      weight: 1,
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
    [1, 0],
  ]);
  test.equal(voronoiMapSimulation.prng(), Math.random);
  test.equal(voronoiMapSimulation.on('tick'), undefined);
  test.equal(voronoiMapSimulation.on('end'), undefined);
  test.end();
});

tape('voronoiMapSimulation.weight(...) should set the specified weight-accessor', function (test) {
  const datum = {
      weight: 1,
      weightPrime: 2,
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

tape(
  'voronoiMapSimulation.clip(...) should set the adequate convex, hole-free, counterclockwise clipping polygon, extent and size',
  function (test) {
    const datum = {
        weight: 1,
      },
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
      newClip = [
        [1, 1],
        [1, 3],
        [3, 1],
        [3, 3],
      ]; //self-intersecting polygon

    test.equal(voronoiMapSimulation.clip(newClip), voronoiMapSimulation);
    test.deepEqual(voronoiMapSimulation.clip(), [
      [3, 3],
      [3, 1],
      [1, 1],
      [1, 3],
    ]);
    test.deepEqual(voronoiMapSimulation.extent(), [
      [1, 1],
      [3, 3],
    ]);
    test.deepEqual(voronoiMapSimulation.size(), [2, 2]);
    test.end();
  }
);

tape('voronoiMapSimulation.extent(...) should set adequate extent, clipping polygon and size', function (test) {
  const datum = {
      weight: 1,
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    newExtent = [
      [1, 1],
      [3, 3],
    ];

  test.equal(voronoiMapSimulation.extent(newExtent), voronoiMapSimulation);
  test.deepEqual(voronoiMapSimulation.clip(), [
    [1, 1],
    [1, 3],
    [3, 3],
    [3, 1],
  ]);
  test.deepEqual(voronoiMapSimulation.extent(), [
    [1, 1],
    [3, 3],
  ]);
  test.deepEqual(voronoiMapSimulation.size(), [2, 2]);
  test.end();
});

tape('voronoiMap.size(...) should set adequate size, clipping polygon and extent', function (test) {
  const datum = {
      weight: 1,
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop(),
    newSize = [2, 3];

  test.equal(voronoiMapSimulation.size(newSize), voronoiMapSimulation);
  test.deepEqual(voronoiMapSimulation.clip(), [
    [0, 0],
    [0, 3],
    [2, 3],
    [2, 0],
  ]);
  test.deepEqual(voronoiMapSimulation.extent(), [
    [0, 0],
    [2, 3],
  ]);
  test.deepEqual(voronoiMapSimulation.size(), [2, 3]);
  test.end();
});

tape('voronoiMapSimulation.convergenceRatio(...) should set the specified convergence treshold', function (test) {
  const datum = {
      weight: 1,
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

  test.equal(voronoiMapSimulation.convergenceRatio(0.001), voronoiMapSimulation);
  test.equal(voronoiMapSimulation.convergenceRatio(), 0.001);
  test.end();
});

tape('voronoiMapSimulation.maxIterationCount(...) should set the specified allowed number of iterations', function (
  test
) {
  const datum = {
      weight: 1,
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

  test.equal(voronoiMapSimulation.maxIterationCount(100), voronoiMapSimulation);
  test.equal(voronoiMapSimulation.maxIterationCount(), 100);
  test.end();
});

tape('voronoiMapSimulation.minWeightRatio(...) should set the specified ratio', function (test) {
  const datum = {
      weight: 1,
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

  test.equal(voronoiMapSimulation.minWeightRatio(0.001), voronoiMapSimulation);
  test.equal(voronoiMapSimulation.minWeightRatio(), 0.001);
  test.end();
});

tape('voronoiMapSimulation.prng(...) should set the specified pseudorandom number generator', function (test) {
  const datum = {
      weight: 1,
    },
    myprng = function () {
      return Math.random();
    },
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

  test.equal(voronoiMapSimulation.prng(myprng), voronoiMapSimulation);
  test.equal(voronoiMapSimulation.prng(), myprng);
  test.end();
});

tape('voronoiMapSimulation.initialPosition(...)', function (test) {
  test.test('voronoiMapSimulation.initialPosition(...) should set the specified callback', function (test) {
    const datum = {
        weight: 1,
        precomputedX: 0.3,
        precomputedY: 0.7,
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

  test.test(
    'voronoiMapSimulation.initialPosition(...) should fallback to a random position if specified callback returns a position ouside the clipping polygon',
    function (test) {
      const datum = {
          weight: 1,
          precomputedX: 2,
          precomputedY: 3,
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
    }
  );

  test.test(
    'voronoiMapSimulation.initialPosition(...) should fallback to a random position if specified callback returns unexpected results',
    function (test) {
      const datum = {
          weight: 1,
          precomputedX: 2,
          precomputedY: 2,
        },
        voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();
      let newAccessor, res, initX, initY;

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
        return ['foo', d.precomputedY];
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
    }
  );
});

tape('voronoiMapSimulation.state()', function (test) {
  test.test('should reflect inner state of the simulation', function (test) {
    // places sites in order to be sure that some ticks are required to obtain stabilization
    const data = [
        {
          weight: 1,
          initialPos: [0, 0],
        },
        {
          weight: 1,
          initialPos: [0.5, 0.5],
        },
      ],
      initialPositioner = function (d) {
        return d.initialPos;
      },
      voronoiMapSimulation = d3VoronoiMap
        .voronoiMapSimulation(data)
        .initialPosition(initialPositioner)
        .maxIterationCount(2)
        .stop();

    voronoiMapSimulation.tick();
    let res = voronoiMapSimulation.state();

    test.equal(res.iterationCount, 1);
    test.equal(res.polygons.length, 2);
    test.ok(res.convergenceRatio);
    test.equal(res.ended, false);

    voronoiMapSimulation.tick();
    res = voronoiMapSimulation.state();

    test.equal(res.iterationCount, 2);
    test.equal(res.polygons.length, 2);
    test.ok(res.convergenceRatio);
    test.equal(res.ended, true);
    test.end();
  });

  test.test('if called before any tick, should initialize the simulation with up-to-date config.', function (test) {
    // uses initial positions for repeatable results (overcoming initial random positioning policy)
    const data = [
        {
          initialWeight: 2,
          initialPos: [0.2, 0.2],
        },
        {
          initialWeight: 2,
          initialPos: [0.8, 0.8],
        },
      ],
      initialPositioner = function (d) {
        return d.initialPos;
      },
      initialWeigher = function (d) {
        return d.initialWeight;
      },
      voronoiMapSimulation = d3VoronoiMap
        .voronoiMapSimulation(data)
        .weight(initialWeigher)
        .initialPosition(initialPositioner)
        .stop();

    //voronoiMapSimulation.tick();
    let res = voronoiMapSimulation.state();

    test.equal(res.polygons.length, 2);
    test.equal(res.polygons[0].site.originalObject.data.weight, 2);
    // TODO check positioner
    test.equal(res.iterationCount, 0);
    test.ok(isNaN(res.convergenceRatio));
    test.equal(res.ended, false);
    test.end();
  });

  test.test('if called before any tick, should handle configuration with overweighted sites', function (test) {
    // uses initial positions for repeatable results (overcoming initial random positioning policy)
    const data = [
        {
          initialWeight: 1,
          initialPos: [0.2, 0.2],
        },
        {
          initialWeight: 4,
          initialPos: [0.8, 0.8],
        },
      ],
      initialPositioner = function (d) {
        return d.initialPos;
      },
      initialWeighter = function (d) {
        return d.initialWeight;
      },
      voronoiMapSimulation = d3VoronoiMap
        .voronoiMapSimulation(data)
        .initialPosition(initialPositioner)
        .initialWeight(initialWeighter)
        .stop();

    let res = voronoiMapSimulation.state();

    test.equal(res.polygons.length, 2);
    test.end();
  });
});

tape('voronoiMapSimulation.on(...)', function (test) {
  test.test("voronoiMapSimulation.on('tick', ...) should set the specified callback", function (test) {
    const datum = {
        weight: 1,
      },
      onTick = function () {
        return true;
      },
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).maxIterationCount(1).stop();

    test.equal(voronoiMapSimulation.on('tick', onTick), voronoiMapSimulation);
    test.equal(voronoiMapSimulation.on('tick'), onTick);
    test.end();
  });

  test.test("voronoiMapSimulation.on('end', ...) should set the specified callback", function (test) {
    const datum = {
        weight: 1,
      },
      onEnd = function () {
        return true;
      },
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).stop();

    test.equal(voronoiMapSimulation.on('end', onEnd), voronoiMapSimulation);
    test.equal(voronoiMapSimulation.on('end'), onEnd);
    test.end();
  });

  tape(
    "voronoiMapSimulation simulation should send 'tick' and 'end' events, and execute respective callbacks",
    function (test) {
      let i = 0;
      const datum = {
          weight: 1,
        },
        onTick = function () {
          i++;
        },
        onEnd = function () {
          test.equal(i, 1);
          //only one iteration because the only one datum fills the entire clipping polygon
          test.end();
        },
        voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation([datum]).on('tick', onTick).on('end', onEnd);
    }
  );
});

tape("Internal function 'handleOverweighted1(...)' shoul not loop indefinitly", function (test) {
  // cf. https://github.com/Kcnarf/d3-voronoi-map/issues/10
  const data = [
      {
        initialWeight: 1,
        initialPos: [0, 0],
      },
      {
        initialWeight: 4,
        initialPos: [0.43038567576932785, 0.5019115451839844],
      },
    ],
    initialPositioner = function (d) {
      return d.initialPos;
    },
    initialWeighter = function (d) {
      return d.initialWeight;
    },
    voronoiMapSimulation = d3VoronoiMap
      .voronoiMapSimulation(data)
      .initialPosition(initialPositioner)
      .initialWeight(initialWeighter)
      .stop();

  let res = voronoiMapSimulation.state();

  test.equal(res.polygons.length, 2);
  test.end();
});

tape.test('Package should provide available intitial position policies', function (test) {
  test.equal(typeof d3VoronoiMap.voronoiMapInitialPositionRandom, 'function');
  test.equal(typeof d3VoronoiMap.voronoiMapInitialPositionPie, 'function');
  test.end();
});

tape.test('Package should provide d3VoronoiMapError', function (test) {
  test.ok(d3VoronoiMap.d3VoronoiMapError);
  test.ok(new d3VoronoiMap.d3VoronoiMapError('test') instanceof Error);
  test.end();
});
