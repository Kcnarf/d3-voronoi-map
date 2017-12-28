(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-polygon'), require('d3-weighted-voronoi')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-polygon', 'd3-weighted-voronoi'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3,global.d3));
}(this, function (exports,d3Polygon,d3WeightedVoronoi) { 'use strict';

  function FlickeringMitigation () {
    /////// Inputs ///////
    this.growthChangesLength = DEFAULT_LENGTH;
    this.totalAvailableArea = NaN;
    
    //begin: internals
    this.lastAreaError = NaN;
    this.lastGrowth = NaN;
    this.growthChanges = [];
    this.growthChangeWeights = generateGrowthChangeWeights(this.growthChangesLength); //used to make recent changes weighter than older changes
    this.growthChangeWeightsSum = computeGrowthChangeWeightsSum(this.growthChangeWeights);
    //end: internals
  }

  var DEFAULT_LENGTH = 10;

  function direction(h0, h1) {
    return (h0 >= h1)? 1 : -1;
  }

  function generateGrowthChangeWeights(length) {
    var initialWeight = 3;   // a magic number
    var weightDecrement = 1; // a magic number
    var minWeight = 1;
    
    var weightedCount = initialWeight;
    var growthChangeWeights = [];
    
    for (var i=0; i<length; i++) {
      growthChangeWeights.push(weightedCount);
      weightedCount -= weightDecrement;
      if (weightedCount<minWeight) { weightedCount = minWeight; }
    }
    return growthChangeWeights;
  }

  function computeGrowthChangeWeightsSum (growthChangeWeights) {
    var growthChangeWeightsSum = 0;
    for (var i=0; i<growthChangeWeights.length; i++) {
      growthChangeWeightsSum += growthChangeWeights[i];
    }
    return growthChangeWeightsSum;
  }

  ///////////////////////
  ///////// API /////////
  ///////////////////////

  FlickeringMitigation.prototype.reset = function () {
    this.lastAreaError = NaN;
    this.lastGrowth = NaN;
    this.growthChanges = [];
    this.growthChangesLength = DEFAULT_LENGTH;
    this.growthChangeWeights = generateGrowthChangeWeights(this.growthChangesLength);
    this.growthChangeWeightsSum = computeGrowthChangeWeightsSum(this.growthChangeWeights);
    this.totalAvailableArea = NaN;
    
    return this;
  };

  FlickeringMitigation.prototype.clear = function () {
    this.lastAreaError = NaN;
    this.lastGrowth = NaN;
    this.growthChanges = [];
    
    return this;
  };

  FlickeringMitigation.prototype.length = function (_) {
    if (!arguments.length) { return this.growthChangesLength; }
    
    if (parseInt(_)>0) {
      this.growthChangesLength = Math.floor(parseInt(_));
      this.growthChangeWeights = generateGrowthChangeWeights(this.growthChangesLength);
      this.growthChangeWeightsSum = computeGrowthChangeWeightsSum(this.growthChangeWeights);
    } else {
      console.warn("FlickeringMitigation.length() accepts only positive integers; unable to handle "+_);
    }
    return this;
  };

  FlickeringMitigation.prototype.totalArea = function (_) {
    if (!arguments.length) { return this.totalAvailableArea; }
    
    if (parseFloat(_)>0) {
      this.totalAvailableArea = parseFloat(_);
    } else {
      console.warn("FlickeringMitigation.totalArea() accepts only positive numbers; unable to handle "+_);
    }
    return this;
  };

  FlickeringMitigation.prototype.add = function (areaError) {
    var secondToLastAreaError, secondToLastGrowth;

    secondToLastAreaError = this.lastAreaError;
    this.lastAreaError = areaError;
    if (!isNaN(secondToLastAreaError)) {
      secondToLastGrowth = this.lastGrowth;
      this.lastGrowth = direction(this.lastAreaError, secondToLastAreaError);
    }
    if (!isNaN(secondToLastGrowth)) {
      this.growthChanges.unshift(this.lastGrowth!=secondToLastGrowth);
    }

    if (this.growthChanges.length>this.growthChangesLength) {
      this.growthChanges.pop();
    }
    return this;
  };

  FlickeringMitigation.prototype.ratio = function () {
    var weightedChangeCount = 0;
    var ratio;

    if (this.growthChanges.length < this.growthChangesLength) { return 0; }
    if (this.lastAreaError > this.totalAvailableArea/10) { return 0; }

    for(var i=0; i<this.growthChangesLength; i++) {
      if (this.growthChanges[i]) {
        weightedChangeCount += this.growthChangeWeights[i];
      }
    }

    ratio = weightedChangeCount/this.growthChangeWeightsSum;

    if (ratio>0) {
      console.log("flickering mitigation ratio: "+Math.floor(ratio*1000)/1000);
    }

    return ratio;
  };

  function randomInitialPosition (d, i, arr, weightedVoronoi) {
    var clippingPolygon = weightedVoronoi.clip(),
        extent = weightedVoronoi.extent(),
        minX = extent[0][0],
        maxX = extent[1][0],
        minY = extent[0][1],
        maxY = extent[1][1],
        dx = maxX-minX,
        dy = maxY-minY;
    var x,y;
    
    x = minX+dx*Math.random();
    y = minY+dy*Math.random();
    while (!d3Polygon.polygonContains(clippingPolygon, [x, y])) { 
      x = minX+dx*Math.random();
      y = minY+dy*Math.random();
    }
    return [x, y];
  };

  function halfAverageAreaInitialWeight (d, i, arr, weightedVoronoi) {
    var siteCount = arr.length,
        totalArea = d3Polygon.polygonArea(weightedVoronoi.clip());
    
    return totalArea/siteCount/2;  // half of the average area of the the clipping polygon
  };

  function voronoiMap () {
    
    //begin: constants
    var DEFAULT_CONVERGENCE_RATIO = 0.01;
    var DEFAULT_MAX_ITERATION_COUNT = 50;
    var DEFAULT_MIN_WEIGHT_RATIO = 0.01;
    var DEFAULT_INITIAL_POSITION = randomInitialPosition;
    var DEFAULT_INITIAL_WEIGHT = halfAverageAreaInitialWeight;
    var epsilon = 1;
    //end: constants
    
    /////// Inputs ///////
    var weight = function (d) { return d.weight; };       // accessor to the weight
    var convergenceRatio = DEFAULT_CONVERGENCE_RATIO;     // targeted allowed error ratio; default 0.01 stops computation when cell areas error <= 1% clipping polygon's area
    var maxIterationCount = DEFAULT_MAX_ITERATION_COUNT;  // maximum allowed iteration; stops computation even if convergence is not reached; use a large amount for a sole converge-based computation stop
    var minWeightRatio = DEFAULT_MIN_WEIGHT_RATIO;        // used to compute the minimum allowed weight; default 0.01 means 1% of max weight; handle near-zero weights, and leaves enought space for cell hovering
    var initialPosition = DEFAULT_INITIAL_POSITION        // accessor to the initial position; defaults to a random position inside the clipping polygon
    var initialWeight = DEFAULT_INITIAL_WEIGHT            // accessor to the initial weight; defaults to the average area of the clipping polygon
    var tick = function (polygons, i) { return true; }    // hook called at each iteration's end (i = iteration count)
    
    //begin: internals
    var weightedVoronoi = d3WeightedVoronoi.weightedVoronoi();
    var siteCount,
        totalArea,
        areaErrorTreshold,
        flickeringMitigation = new FlickeringMitigation();
    //end: internals

    //begin: algorithm conf.
    var handleOverweightedVariant = 1;  // this option still exists 'cause for further experiments
    var handleOverweighted;
    //end: algorithm conf.
    
    //begin: utils
    function sqr(d) { return Math.pow(d,2); };

    function squaredDistance(s0, s1) {
      return sqr(s1.x - s0.x) + sqr(s1.y - s0.y);
    };
    //end: utils

    ///////////////////////
    ///////// API /////////
    ///////////////////////

    function _voronoiMap (data) {
      //begin: handle algorithm's variants
      setHandleOverweighted();
      //end: handle algorithm's variants

      siteCount = data.length;
      totalArea = Math.abs(d3Polygon.polygonArea(weightedVoronoi.clip())),
      areaErrorTreshold = convergenceRatio*totalArea;
      flickeringMitigation.clear().totalArea(totalArea);

      var iterationCount = 0,
          polygons = initialize(data),
          converged = false;
      var areaError;

      tick(polygons, iterationCount);

      while (!(converged || iterationCount>=maxIterationCount)) {
        polygons = adapt(polygons, flickeringMitigation.ratio());
        iterationCount++;
        areaError = computeAreaError(polygons);
        flickeringMitigation.add(areaError);
        converged = areaError < areaErrorTreshold;
        // console.log("error %: "+Math.round(areaError*100*1000/totalArea)/1000);
        tick(polygons, iterationCount);
      }
      
      return {
        polygons: polygons,
        iterationCount: iterationCount,
        convergenceRatio : areaError/totalArea
      };
    };

    _voronoiMap.weight = function (_) {
      if (!arguments.length) { return weight; }
      
      weight = _;
      return _voronoiMap;
    };
    
    _voronoiMap.convergenceRatio = function (_) {
      if (!arguments.length) { return convergenceRatio; }
      
      convergenceRatio = _;
      return _voronoiMap;
    };
    
    _voronoiMap.maxIterationCount = function (_) {
      if (!arguments.length) { return maxIterationCount; }
      
      maxIterationCount = _;
      return _voronoiMap;
    };
    
    _voronoiMap.minWeightRatio = function (_) {
      if (!arguments.length) { return minWeightRatio; }
      
      minWeightRatio = _;
      return _voronoiMap;
    };

    _voronoiMap.tick = function (_) {
      if (!arguments.length) { return tick; }
      
      tick = _;
      return _voronoiMap;
    };

    _voronoiMap.clip = function (_) {
      if (!arguments.length) { return weightedVoronoi.clip(); }
      
      weightedVoronoi.clip(_);
      return _voronoiMap;
    };
      
    _voronoiMap.initialPosition = function (_) {
      if (!arguments.length) { return initialPosition; }
      
      initialPosition = _;
      return _voronoiMap;
    };
      
    _voronoiMap.initialWeight = function (_) {
      if (!arguments.length) { return initialWeight; }
      
      initialWeight = _;
      return _voronoiMap;
    };

    ///////////////////////
    /////// Private ///////
    ///////////////////////

    function adapt(polygons, flickeringMitigationRatio) {
      var adaptedMapPoints;
      
      adaptPositions(polygons, flickeringMitigationRatio);
      adaptedMapPoints = polygons.map(function(p) { return p.site.originalObject; });
      polygons = weightedVoronoi(adaptedMapPoints);
      if (polygons.length<siteCount) {
        console.log("at least 1 site has no area, which is not supposed to arise");
        debugger;
      }
      
      adaptWeights(polygons, flickeringMitigationRatio);
      adaptedMapPoints = polygons.map(function(p) { return p.site.originalObject; });
      polygons = weightedVoronoi(adaptedMapPoints);
      if (polygons.length<siteCount) {
        console.log("at least 1 site has no area, which is not supposed to arise");
        debugger;
      }
      
      return polygons;
    };

    function adaptPositions(polygons, flickeringMitigationRatio) {
      var newMapPoints = [],
          flickeringInfluence = 0.5;
      var flickeringMitigation, d, polygon, mapPoint, centroid, dx, dy;
      
      flickeringMitigation = flickeringInfluence*flickeringMitigationRatio;
      d = 1-flickeringMitigation  // in [0.5, 1]
      for(var i=0; i<siteCount; i++) {
        polygon = polygons[i];
        mapPoint = polygon.site.originalObject;
        centroid = d3Polygon.polygonCentroid(polygon);
        
        dx = centroid[0] - mapPoint.x;
        dy = centroid[1] - mapPoint.y;
        
        //begin: handle excessive change;
        dx *= d;
        dy *= d;
        //end: handle excessive change;
        
        mapPoint.x += dx;
        mapPoint.y += dy;
        
        newMapPoints.push(mapPoint);
      }
      
      handleOverweighted(newMapPoints);
    };
    
    function adaptWeights(polygons, flickeringMitigationRatio) {
      var newMapPoints = [],
          flickeringInfluence = 0.1;
      var flickeringMitigation, polygon, mapPoint, currentArea, adaptRatio, adaptedWeight;
      
      flickeringMitigation = flickeringInfluence*flickeringMitigationRatio;
      for(var i=0; i<siteCount; i++) {
        polygon = polygons[i];
        mapPoint = polygon.site.originalObject;
        currentArea = d3Polygon.polygonArea(polygon);
        adaptRatio = mapPoint.targetedArea/currentArea;
        
        //begin: handle excessive change;
        adaptRatio = Math.max(adaptRatio, (1-flickeringInfluence)+flickeringMitigation); // in [(1-flickeringInfluence), 1]
        adaptRatio = Math.min(adaptRatio, (1+flickeringInfluence)-flickeringMitigation); // in [1, (1+flickeringInfluence)]
        //end: handle excessive change;
        
        adaptedWeight = mapPoint.weight*adaptRatio;
        adaptedWeight = Math.max(adaptedWeight, epsilon);
        
        mapPoint.weight = adaptedWeight;
        
        newMapPoints.push(mapPoint);
      }
      
      handleOverweighted(newMapPoints);
    };
    
    // heuristics: lower heavy weights
    function handleOverweighted0(mapPoints) {
      var fixCount = 0;
      var fixApplied, tpi, tpj, weightest, lightest, sqrD, adaptedWeight;
      do {
        fixApplied = false;
        for(var i=0; i<siteCount; i++) {
          tpi = mapPoints[i];
          for(var j=i+1; j<siteCount; j++) {
            tpj = mapPoints[j];
            if (tpi.weight > tpj.weight) {
              weightest = tpi;
              lightest = tpj;
            } else {
              weightest = tpj;
              lightest = tpi;
            }
            sqrD = squaredDistance(tpi, tpj);
            if (sqrD < weightest.weight-lightest.weight) {
              // adaptedWeight = sqrD - epsilon; // as in ArlindNocaj/Voronoi-Treemap-Library
              // adaptedWeight = sqrD + lightest.weight - epsilon; // works, but below heuristics performs better (less flickering)
              adaptedWeight = sqrD + lightest.weight/2;
              adaptedWeight = Math.max(adaptedWeight, epsilon);
              weightest.weight = adaptedWeight;
              fixApplied = true;
              fixCount++;
              break;
            }
          }
          if (fixApplied) { break; }
        }
      } while (fixApplied)
      
      /*
      if (fixCount>0) {
        console.log("# fix: "+fixCount);
      }
      */
    }
    
    // heuristics: increase light weights
    function handleOverweighted1(mapPoints) {
      var fixCount = 0;
      var fixApplied, tpi, tpj, weightest, lightest, sqrD, overweight;
      do {
        fixApplied = false;
        for(var i=0; i<siteCount; i++) {
          tpi = mapPoints[i];
          for(var j=i+1; j<siteCount; j++) {
            tpj = mapPoints[j];
            if (tpi.weight > tpj.weight) {
              weightest = tpi;
              lightest = tpj;
            } else {
              weightest = tpj;
              lightest = tpi;
            }
            sqrD = squaredDistance(tpi, tpj);
            if (sqrD < weightest.weight-lightest.weight) {
              overweight = weightest.weight - lightest.weight - sqrD
              lightest.weight += overweight + epsilon;
              fixApplied = true;
              fixCount++;
              break;
            }
          }
          if (fixApplied) { break; }
        }
      } while (fixApplied)
      
      /*
      if (fixCount>0) {
        console.log("# fix: "+fixCount);
      }
      */
    }
    
    function computeAreaError(polygons) {
      //convergence based on summation of all sites current areas
      var areaErrorSum = 0;
      var polygon, mapPoint, currentArea;
      for(var i=0; i<siteCount; i++) {
        polygon = polygons[i];
        mapPoint = polygon.site.originalObject;
        currentArea = d3Polygon.polygonArea(polygon);
        areaErrorSum += Math.abs(mapPoint.targetedArea-currentArea);;
      }
      return areaErrorSum;
    };
    
    function setHandleOverweighted() {
      switch (handleOverweightedVariant) {
        case 0:
          handleOverweighted = handleOverweighted0;
          break;
        case 1:
          handleOverweighted = handleOverweighted1;
          break;
        default:
          console.log("Variant of 'handleOverweighted' is unknown")
      }
    };
    
    function initialize(data) {
      var maxWeight = data.reduce(function(max, d){ return Math.max(max, weight(d)); }, -Infinity),
          minAllowedWeight = maxWeight*minWeightRatio
      var weights, mapPoints;
      
      //begin: extract weights
      weights = data.map(function(d, i, arr){
        return {
          index: i,
          weight: Math.max(weight(d), minAllowedWeight),
          initialPosition: initialPosition(d, i, arr, weightedVoronoi),
          initialWeight: initialWeight(d, i, arr, weightedVoronoi),
          originalData: d
        };
      });
      //end: extract weights
      
      // create map-related points
      // (with targetedArea, initial position and initialWeight)
      mapPoints = createMapPoints(weights);
      return weightedVoronoi(mapPoints);
    };
    
    function createMapPoints(basePoints) {
      var totalWeight = basePoints.reduce(function(acc, bp){ return acc+=bp.weight; }, 0);
      var position;
      
      return basePoints.map(function(bp, i, bps) {
        initialPosition = bp.initialPosition;
        
        if (!d3Polygon.polygonContains(weightedVoronoi.clip(), initialPosition)) {
          initialPosition = randomInitialPosition(bp, i, bps, weightedVoronoi);
        }

        return {
          index: bp.index,
          targetedArea: totalArea*bp.weight/totalWeight,
          data: bp,
          x: initialPosition[0],
          y: initialPosition[1],
          weight: bp.initialWeight  // ArlindNocaj/Voronoi-Treemap-Library uses an epsilonesque initial weight; using heavier initial weights allows faster weight adjustements, hane faster stabilization
        }
      })
    };

    return _voronoiMap;
  }

  exports.voronoiMap = voronoiMap;

  Object.defineProperty(exports, '__esModule', { value: true });

}));