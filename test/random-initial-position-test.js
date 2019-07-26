var tape = require('tape'),
  d3VoronoiMapInitialPositionRandom = require('../build/initial-position-policies/random'),
  d3VoronoiMap = require('../build/d3-voronoi-map');

tape('initial-position-policies/pie()(...) default test', function(test) {
  const initialPositionRandom = d3VoronoiMapInitialPositionRandom(),
    data = [
      {
        weight: 1
      }
    ],
    voronoiMapSimulation = d3VoronoiMap.voronoiMapSimulation(data).stop(),
    initCoords = initialPositionRandom(data[0], 0, data, voronoiMapSimulation);

  test.ok(initCoords[0] > 0);
  test.ok(initCoords[0] < 1);
  test.ok(initCoords[1] > 0);
  test.ok(initCoords[1] < 1);

  test.end();
});

tape('initial-position-policies/pie(...) and clipping polygon', function(test) {
  test.test('initial-position-policies/pie(...) should depends on clipping polygon', function(test) {
    const initialPositionRandom = d3VoronoiMapInitialPositionRandom(),
      data = [
        {
          weight: 1
        }
      ],
      voronoiMapSimulation = d3VoronoiMap
        .voronoiMapSimulation(data)
        .extent([[1, 1], [2, 2]])
        .stop(),
      initCoords = initialPositionRandom(data[0], 0, data, voronoiMapSimulation);

    test.ok(initCoords[0] > 1);
    test.ok(initCoords[0] < 2);
    test.ok(initCoords[1] > 1);
    test.ok(initCoords[1] < 2);

    test.end();
  });

  test.test('initial-position-policies/randomPolicy()(...) should handle clipping polygon updates', function(test) {
    const initialPositionRandom = d3VoronoiMapInitialPositionRandom(),
      data = [
        {
          weight: 1
        }
      ],
      voronoiMapSimulation = d3VoronoiMap
        .voronoiMapSimulation(data)
        .extent([[1, 1], [2, 2]])
        .stop();
    let initCoords = initialPositionRandom(data[0], 0, data, voronoiMapSimulation);

    test.ok(initCoords[0] > 1);
    test.ok(initCoords[0] < 2);
    test.ok(initCoords[1] > 1);
    test.ok(initCoords[1] < 2);

    voronoiMapSimulation.extent([[2, 2], [3, 3]]);
    initCoords = initialPositionRandom(data[0], 0, data, voronoiMapSimulation);

    test.ok(initCoords[0] > 2);
    test.ok(initCoords[0] < 3);
    test.ok(initCoords[1] > 2);
    test.ok(initCoords[1] < 3);

    test.end();
  });
});

tape('initial-position-policies/randomPolicy()(...) should use expected prng', function(test) {
  const myprng = function() {
    // not a prng, but do the trick for the test!
    return 0.5;
  };
  const initialPositionRandom = d3VoronoiMapInitialPositionRandom(),
    data = [
      {
        weight: 1
      }
    ],
    voronoiMapSimulation = d3VoronoiMap
      .voronoiMapSimulation(data)
      .prng(myprng)
      .stop(),
    initCoords = initialPositionRandom(data[0], 0, data, voronoiMapSimulation);

  test.equal(initCoords[0], 0.5);
  test.equal(initCoords[1], 0.5);
  test.end();
});
