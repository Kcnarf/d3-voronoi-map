import {
  polygonContains as d3PolygonContains
} from 'd3-polygon';

export default function (d, i, arr, voronoiMapSimulation) {
  var clippingPolygon = voronoiMapSimulation.clip(),
    extent = voronoiMapSimulation.extent(),
    minX = extent[0][0],
    maxX = extent[1][0],
    minY = extent[0][1],
    maxY = extent[1][1],
    dx = maxX - minX,
    dy = maxY - minY;
  var x, y;

  x = minX + dx * Math.random();
  y = minY + dy * Math.random();
  while (!d3PolygonContains(clippingPolygon, [x, y])) {
    x = minX + dx * Math.random();
    y = minY + dy * Math.random();
  }
  return [x, y];
};