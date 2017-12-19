var tape = require("tape"),
    d3VoronoiMap = require('../build/d3-voronoi-map');

tape("voronoiMap(...) should set the expected defaults", function(test) {
  var voronoiMap = d3VoronoiMap.voronoiMap(),
      datum = {weight: 1};

  test.equal(voronoiMap.weight()(datum), 1);
  test.equal(voronoiMap.convergenceRatio(), 0.01);
  test.equal(voronoiMap.maxIterationCount(), 50);
  test.equal(voronoiMap.minWeightRatio(), 0.01);
  test.deepEqual(voronoiMap.clip(), [[0,0], [0,1], [1,1], [1,0]]);
  test.end();
});

tape("voronoiMap.weight(...) should set the specified weight-accessor", function(test) {
  var voronoiMap = d3VoronoiMap.voronoiMap(),
      datum = {weight: 1, weightPrime: 2};

  test.equal(voronoiMap.weight(function(d){ return d.weightPrime; }), voronoiMap);
  test.equal(voronoiMap.weight()(datum), 2);
  test.end();
});
  
tape("voronoiMap.clip(...) should set the adequate convex, hole-free, counterclockwise clipping polygon", function(test) {
  var voronoiMap = d3VoronoiMap.voronoiMap(),
      newClip = [[0,0], [0,1], [1,0], [1,1]];   //self-intersecting polygon

  test.equal(voronoiMap.clip(newClip), voronoiMap);
  test.deepEqual(voronoiMap.clip(), [[1,1], [1,0], [0,0], [0,1]]);
  test.end();
});

tape("voronoiMap.convergenceRatio(...) should set the specified convergence treshold", function(test) {
  var voronoiMap = d3VoronoiMap.voronoiMap();

  test.equal(voronoiMap.convergenceRatio(0.001), voronoiMap);
  test.equal(voronoiMap.convergenceRatio(), 0.001);
  test.end();
});

tape("voronoiMap.maxIterationCount(...) should set the specified allowed number of iterations", function(test) {
  var voronoiMap = d3VoronoiMap.voronoiMap();

  test.equal(voronoiMap.maxIterationCount(100), voronoiMap);
  test.equal(voronoiMap.maxIterationCount(), 100);
  test.end();
});

tape("voronoiMap.minWeightRatio(...) should set the specified ratio", function(test) {
  var voronoiMap = d3VoronoiMap.voronoiMap();

  test.equal(voronoiMap.minWeightRatio(0.001), voronoiMap);
  test.equal(voronoiMap.minWeightRatio(), 0.001);
  test.end();
});

tape("voronoiMap.(...) should compute Voronoï map", function(test) {
  test.test("basic use case", function(test) {
    var voronoiMap = d3VoronoiMap.voronoiMap().maxIterationCount(1),
        data = [{weight: 1}, {weight: 1}],
        res = voronoiMap(data);

    test.equal(res.polygons.length, 2);
    test.equal(res.iterationCount, 1);
    test.ok(res.convergenceRatio);
    test.end();
  });
});