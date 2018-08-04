import {
  polygonContains as d3PolygonContains
} from 'd3-polygon';
import SeedRandomHelper from './seed-random-helper';

export default function () {

  //begin: internals
  var clippingPolygon,
    extent,
    minX, maxX,
    minY, maxY,
    dx, dy;
  //end: internals

  ///////////////////////
  ///////// API /////////
  ///////////////////////

  function _random(d, i, arr, voronoiMap) {
    var shouldUpdateInternals = false;
    var x, y;

    if (clippingPolygon !== voronoiMap.clip()) {
      clippingPolygon = voronoiMap.clip();
      extent = voronoiMap.extent();
      shouldUpdateInternals = true;
    }

    if (shouldUpdateInternals) {
      updateInternals();
    }

    x = minX + dx * SeedRandomHelper.random();
    y = minY + dy * SeedRandomHelper.random();
    while (!d3PolygonContains(clippingPolygon, [x, y])) {
      x = minX + dx * SeedRandomHelper.random();
      y = minY + dy * SeedRandomHelper.random();
    }
    return [x, y];
  };

  ///////////////////////
  /////// Private ///////
  ///////////////////////

  function updateInternals() {
    minX = extent[0][0];
    maxX = extent[1][0];
    minY = extent[0][1];
    maxY = extent[1][1];
    dx = maxX - minX;
    dy = maxY - minY;
  };

  return _random;
};