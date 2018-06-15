import {
  polygonArea as d3PolygonArea
} from 'd3-polygon';

export default function (d, i, arr, voronoiMap) {
  var siteCount = arr.length,
    totalArea = d3PolygonArea(voronoiMap.clip());

  return totalArea / siteCount / 2; // half of the average area of the the clipping polygon
};