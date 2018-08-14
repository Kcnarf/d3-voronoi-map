import {
  polygonContains as d3PolygonContains,
  polygonCentroid as d3PolygonCentroid
} from 'd3-polygon';


export default function () {
  //begin: internals
  var startAngle = 0;
  var clippingPolygon,
    dataArray,
    dataArrayLength,
    clippingPolygonCentroid,
    halfIncircleRadius,
    angleBetweenData;
  //end: internals

  ///////////////////////
  ///////// API /////////
  ///////////////////////

  function _pie(d, i, arr, voronoiMapSimulation) {
    var shouldUpdateInternals = false;

    if (clippingPolygon !== voronoiMapSimulation.clip()) {
      clippingPolygon = voronoiMapSimulation.clip();
      shouldUpdateInternals |= true;
    }
    if (dataArray !== arr) {
      dataArray = arr;
      shouldUpdateInternals |= true;
    }

    if (shouldUpdateInternals) {
      updateInternals();
    }

    // add some randomness to prevent colinear/cocircular points
    // substract -0.5 so that the average jitter is still zero
    return [
      clippingPolygonCentroid[0] + Math.cos(startAngle + i * angleBetweenData) * halfIncircleRadius + (voronoiMapSimulation.prng()() - 0.5) * 1E-3,
      clippingPolygonCentroid[1] + Math.sin(startAngle + i * angleBetweenData) * halfIncircleRadius + (voronoiMapSimulation.prng()() - 0.5) * 1E-3
    ];
  };

  _pie.startAngle = function (_) {
    if (!arguments.length) {
      return startAngle;
    }

    startAngle = _;
    return _pie;
  };

  ///////////////////////
  /////// Private ///////
  ///////////////////////

  function updateInternals() {
    clippingPolygonCentroid = d3PolygonCentroid(clippingPolygon);
    halfIncircleRadius = computeMinDistFromEdges(clippingPolygonCentroid, clippingPolygon) / 2;
    dataArrayLength = dataArray.length;
    angleBetweenData = 2 * Math.PI / dataArrayLength;
  };

  function computeMinDistFromEdges(vertex, clippingPolygon) {
    var minDistFromEdges = Infinity,
      edgeIndex = 0,
      edgeVertex0 = clippingPolygon[clippingPolygon.length - 1],
      edgeVertex1 = clippingPolygon[edgeIndex];
    var distFromCurrentEdge;

    while (edgeIndex < clippingPolygon.length) {
      distFromCurrentEdge = vDistance(vertex, edgeVertex0, edgeVertex1);
      if (distFromCurrentEdge < minDistFromEdges) {
        minDistFromEdges = distFromCurrentEdge;
      }
      edgeIndex++;
      edgeVertex0 = edgeVertex1;
      edgeVertex1 = clippingPolygon[edgeIndex];
    }

    return minDistFromEdges;
  }

  //from https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  function vDistance(vertex, edgeVertex0, edgeVertex1) {
    var x = vertex[0],
      y = vertex[1],
      x1 = edgeVertex0[0],
      y1 = edgeVertex0[1],
      x2 = edgeVertex1[0],
      y2 = edgeVertex1[1];
    var A = x - x1,
      B = y - y1,
      C = x2 - x1,
      D = y2 - y1;
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;

    if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

    var xx, yy;

    if (param < 0) { // this should not arise as clippingpolygon is convex
      xx = x1;
      yy = y1;
    } else if (param > 1) { // this should not arise as clippingpolygon is convex
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  return _pie;
}