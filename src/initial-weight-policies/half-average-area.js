import {
  polygonArea as d3PolygonArea
} from 'd3-polygon';

export default function (d, i, arr, voronoiMapSimulation) {
  var siteCount = arr.length,
    totalArea = d3PolygonArea(voronoiMapSimulation.clip());

  return totalArea / siteCount / 2; // half of the average area of the the clipping polygon
};