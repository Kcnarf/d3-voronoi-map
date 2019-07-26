const tape = require('tape'),
  d3VoronoiMapInitialPositionPie = require('../build/initial-position-policies/pie'),
  d3VoronoiMap = require('../build/d3-voronoi-map');

tape('initial-position-policies/piePolicy() should set the expected defaults', function(test) {
  const initialPositionPie = d3VoronoiMapInitialPositionPie();

  test.equal(initialPositionPie.startAngle(), 0);
  test.end();
});

tape('initial-position-policies/piePolicy().startAngle(...) should set the expected start angle', function(test) {
  const initialPositionPie = d3VoronoiMapInitialPositionPie();

  test.equal(initialPositionPie.startAngle(Math.PI), initialPositionPie);
  test.equal(initialPositionPie.startAngle(), Math.PI);
  test.end();
});

tape('initial-position-policies/piePolicy()(...) default test', function(test) {
  const initialPositionPie = d3VoronoiMapInitialPositionPie(),
    data = [
      {
        weight: 1
      },
      {
        weight: 1
      },
      {
        weight: 1
      },
      {
        weight: 1
      }
    ],
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data).stop();
  let expectedInitCoords = [[0.5 + 0.25, 0.5], [0.5, 0.5 + 0.25], [0.5 - 0.25, 0.5], [0.5, 0.5 - 0.25]];
  let initCoords;

  data.forEach(function(d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMapSimulation);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1e-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1e-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1e-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1e-3);
  });
  test.end();
});

tape('initial-position-policies/piePolicy()(...) should depends on startAngle', function(test) {
  const initialPositionPie = d3VoronoiMapInitialPositionPie().startAngle(Math.PI / 2),
    data = [
      {
        weight: 1
      },
      {
        weight: 1
      },
      {
        weight: 1
      },
      {
        weight: 1
      }
    ],
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data).stop();
  const expectedInitCoords = [[0.5, 0.5 + 0.25], [0.5 - 0.25, 0.5], [0.5, 0.5 - 0.25], [0.5 + 0.25, 0.5]];
  let initCoords;

  data.forEach(function(d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMapSimulation);
    test.ok(initCoords[0] > expectedInitCoords[i][0] - 1e-3);
    test.ok(initCoords[0] < expectedInitCoords[i][0] + 1e-3);
    test.ok(initCoords[1] > expectedInitCoords[i][1] - 1e-3);
    test.ok(initCoords[1] < expectedInitCoords[i][1] + 1e-3);
  });
  test.end();
});

tape('initial-position-policies/piePolicy()(...) and clipping polygon', function(test) {
  test.test('initial-position-policies/piePolicy()(...) should depends on clipping polygon', function(test) {
    const initialPositionPie = d3VoronoiMapInitialPositionPie(),
      data = [
        {
          weight: 1
        },
        {
          weight: 1
        },
        {
          weight: 1
        },
        {
          weight: 1
        }
      ],
      voronoiMapSimulation = d3VoronoiMap
        .voronoiMapSimulation(data)
        .size([2, 3])
        .stop();
    const expectedInitCoords = [[1 + 0.5, 1.5], [1, 1.5 + 0.5], [1 - 0.5, 1.5], [1, 1.5 - 0.5]];
    let initCoords;

    data.forEach(function(d, i) {
      initCoords = initialPositionPie(d, i, data, voronoiMapSimulation);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1e-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1e-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1e-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1e-3);
    });
    test.end();
  });

  test.test('initial-position-policies/piePolicy()(...) should handle irregular polygon', function(test) {
    const initialPositionPie = d3VoronoiMapInitialPositionPie(),
      data = [
        {
          weight: 1
        },
        {
          weight: 1
        },
        {
          weight: 1
        },
        {
          weight: 1
        }
      ],
      voronoiMapSimulation = d3VoronoiMap
        .voronoiMapSimulation(data)
        .clip([[1, 0], [3, 0], [4, 1], [2, 4], [0, 1]])
        .stop(), // diamond shape, centroïd at [2, 1.518518], innner radius is 1.376478
      halfInnerRadius = 1.376478 / 2;
    const expectedInitCoords = [
      [2 + halfInnerRadius, 1.518518],
      [2, 1.518518 + halfInnerRadius],
      [2 - halfInnerRadius, 1.518518],
      [2, 1.518518 - halfInnerRadius]
    ];
    let initCoords;

    data.forEach(function(d, i) {
      initCoords = initialPositionPie(d, i, data, voronoiMapSimulation);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1e-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1e-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1e-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1e-3);
    });
    test.end();
  });

  test.test('initial-position-policies/piePolicy()(...) should handle clipping polygon updates', function(test) {
    const initialPositionPie = d3VoronoiMapInitialPositionPie(),
      data = [
        {
          weight: 1
        },
        {
          weight: 1
        },
        {
          weight: 1
        },
        {
          weight: 1
        }
      ],
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data).stop();
    let expectedInitCoords = [[0.5 + 0.25, 0.5], [0.5, 0.5 + 0.25], [0.5 - 0.25, 0.5], [0.5, 0.5 - 0.25]];
    let initCoords;

    data.forEach(function(d, i) {
      initCoords = initialPositionPie(d, i, data, voronoiMapSimulation);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1e-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1e-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1e-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1e-3);
    });

    voronoiMapSimulation.size([2, 2]);
    expectedInitCoords = [[1 + 0.5, 1], [1, 1 + 0.5], [1 - 0.5, 1], [1, 1 - 0.5]];
    data.forEach(function(d, i) {
      initCoords = initialPositionPie(d, i, data, voronoiMapSimulation);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1e-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1e-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1e-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1e-3);
    });
    test.end();
  });
});

tape('initial-position-policies/piePolicy()(...) and data', function(test) {
  test.test('initial-position-policies/piePolicy()(...) should depend on number of data', function(test) {
    const initialPositionPie = d3VoronoiMapInitialPositionPie(),
      data = [
        {
          weight: 1
        },
        {
          weight: 1
        },
        {
          weight: 1
        }
      ],
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data).stop();
    const expectedInitCoords = [
      [0.5 + 0.25 * Math.cos(((2 * Math.PI) / 3) * 0), 0.5 + 0.25 * Math.sin(((2 * Math.PI) / 3) * 0)],
      [0.5 + 0.25 * Math.cos(((2 * Math.PI) / 3) * 1), 0.5 + 0.25 * Math.sin(((2 * Math.PI) / 3) * 1)],
      [0.5 + 0.25 * Math.cos(((2 * Math.PI) / 3) * 2), 0.5 + 0.25 * Math.sin(((2 * Math.PI) / 3) * 2)]
    ];
    let initCoords;

    data.forEach(function(d, i) {
      initCoords = initialPositionPie(d, i, data, voronoiMapSimulation);
      test.ok(initCoords[0] > expectedInitCoords[i][0] - 1e-3);
      test.ok(initCoords[0] < expectedInitCoords[i][0] + 1e-3);
      test.ok(initCoords[1] > expectedInitCoords[i][1] - 1e-3);
      test.ok(initCoords[1] < expectedInitCoords[i][1] + 1e-3);
    });
    test.end();
  });

  test.test('initial-position-policies/piePolicy()(...) should handle data of length 1', function(test) {
    const initialPositionPie = d3VoronoiMapInitialPositionPie(),
      data = [
        {
          weight: 1
        }
      ],
      expectedInitCoords = [[0.5 + 0.25, 0.5]],
      voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data).stop();
    let initCoords;

    initCoords = initialPositionPie(data[0], 0, data, voronoiMapSimulation);
    test.ok(initCoords[0] > expectedInitCoords[0][0] - 1e-3);
    test.ok(initCoords[0] < expectedInitCoords[0][0] + 1e-3);
    test.ok(initCoords[1] > expectedInitCoords[0][1] - 1e-3);
    test.ok(initCoords[1] < expectedInitCoords[0][1] + 1e-3);
    test.end();
  });
});

tape('initial-position-policies/piePolicy()(...) should use expected prng', function(test) {
  const myprng = function() {
      // not a prng, but do the trick for the test!
      return 0.5;
    },
    initialPositionPie = d3VoronoiMapInitialPositionPie(),
    data = [
      {
        weight: 1
      }
    ],
    expectedInitCoords = [[0.5 + 0.25, 0.5]], // from src code
    voronoiMapSimulation = d3VoronoiMap
      .voronoiMapSimulation(data)
      .prng(myprng)
      .stop();
  const prngDelta = (voronoiMapSimulation.prng()() - 0.5) * 1e-3; // from src code
  let initCoords;

  data.forEach(function(d, i) {
    initCoords = initialPositionPie(d, i, data, voronoiMapSimulation);
    test.equal(initCoords[0], expectedInitCoords[i][0] + prngDelta);
    test.equal(initCoords[1], expectedInitCoords[i][1] + prngDelta);
  });
  test.end();
});
