const tape = require('tape'),
  d3VoronoiMapInitialWeightHalfAverageArea = require('../build/initial-weight-policies/half-average-area'),
  d3VoronoiMap = require('../build/d3-voronoi-map');

tape('initial-weight-policies/half-average-area(...)', function(test) {
  test.test('initial-weight-policies/half-average-area(...) should depends on clipping polygon', function(test) {
    const initialWeightHalfAverageArea = d3VoronoiMapInitialWeightHalfAverageArea(),
      data = [
        {
          weight: 1
        }
      ],
      voronoiMapSimulation = d3VoronoiMap
        .voronoiMapSimulation(data)
        .size([2, 3])
        .stop();

    test.equal(initialWeightHalfAverageArea(data[0], 0, data, voronoiMapSimulation), 3);
    test.end();
  });

  test.test('initial-weight-policies/half-average-area(...) should depends on number of data', function(test) {
    const initialWeightHalfAverageArea = d3VoronoiMapInitialWeightHalfAverageArea(),
      data = [
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

    test.equal(initialWeightHalfAverageArea(data[0], 0, data, voronoiMapSimulation), 1.5);
    test.end();
  });
});
