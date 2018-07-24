import {
  polygonContains as d3PolygonContains,
  polygonCentroid as d3PolygonCentroid
} from 'd3-polygon';

//begin: memoization for repeated usages
var _clippingPolygon,
  _clippingPolygonCentroid,
  _incircleRadius,
  _halfIncircleRadius;
//end: memoization for repeated usages

export default function (d, i, arr, voronoiMap) {
  var arrLength = arr.length;
  if (_clippingPolygon !== voronoiMap.clip()) {
    _clippingPolygon = voronoiMap.clip();
    _clippingPolygonCentroid = d3PolygonCentroid(_clippingPolygon);
    _incircleRadius = computeMinDistFromEdges(_clippingPolygonCentroid, _clippingPolygon);
    _halfIncircleRadius = _incircleRadius / 2;
  }

  return [
    _clippingPolygonCentroid[0] + Math.cos(i * 2 * Math.PI / arrLength) * _halfIncircleRadius + Math.random() * 1E-3, //add some randomness to prevent colinearity between PI-separated points
    _clippingPolygonCentroid[1] + Math.sin(i * 2 * Math.PI / arrLength) * _halfIncircleRadius + Math.random() * 1E-3 //add some randomness to prevent colinearity between PI-separated points
  ];
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