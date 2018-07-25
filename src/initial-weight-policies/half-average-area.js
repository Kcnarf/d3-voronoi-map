import {
  polygonArea as d3PolygonArea
} from 'd3-polygon';

export default function () {
  //begin: internals
  var clippingPolygon,
    dataArray,
    siteCount,
    totalArea,
    halfAverageArea;
  //end: internals

  ///////////////////////
  ///////// API /////////
  ///////////////////////
  function _halfAverageArea(d, i, arr, voronoiMapSimulation) {
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

    return halfAverageArea;
  };

  ///////////////////////
  /////// Private ///////
  ///////////////////////

  function updateInternals() {
    siteCount = dataArray.length;
    totalArea = d3PolygonArea(clippingPolygon);
    halfAverageArea = totalArea / siteCount / 2; // half of the average area of the the clipping polygon
  }

  return _halfAverageArea;
};