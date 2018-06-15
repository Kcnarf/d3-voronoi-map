# d3-voronoi-map

This D3 plugin produces a _Voronoï map_ (i.e. one-level treemap). Given a convex polygon and weighted data, it tesselates/partitions the polygon in several inner cells, such that the area of a cell represents the weight of the underlying datum.

Because a picture is worth a thousand words:

![square](./img/square.png)
![hexagon](./img/hexagon.png)
![diamond](./img/diamond.png)
![circle](./img/circle.png)

Available for **d3 v4** and **d3 v5**.

If you're interested on multi-level treemap, which handle nested/hierarchical data, take a look at the [d3-voronoi-treemap](https://github.com/Kcnarf/d3-voronoi-treemap) plugin.

## Context

D3 already provides a [d3-treemap](https://github.com/d3/d3-hierarchy/blob/master/README.md#treemap) module which produces a rectangular treemap. Such treemaps could be distorted to fit shapes that are not rectangles (cf. [Distorded Treemap - d3-shaped treemap](http://bl.ocks.org/Kcnarf/976b2e854965eea17a7754517043b91f)).

This plugin allows to compute a map with a unique look-and-feel, where inner areas are not strictly aligned each others, and where the outer shape can be any hole-free convex polygons (squares, rectangles, pentagon, hexagon, ... any regular convex polygon, and also any non regular hole-free convex polygon).

The drawback is that the computation of a Voronoï map is based on a iteration/looping process. Hence, it requires _some times_, depending on the number and type of data/weights, the desired representativeness of cell areas.

## Examples

- [The Individual Costs of Being Obese in the U.S. (2010)](https://bl.ocks.org/kcnarf/e649c8723eff3fd64a23f75901910930), a remake of [HowMuch.net's post](https://howmuch.net/articles/obesity-costs-visualized)

## Installing

Load `https://rawgit.com/Kcnarf/d3-voronoi-map/master/build/d3-voronoi-map.js` (or its `d3-voronoi-map.min.js` version) to make it available in AMD, CommonJS, or vanilla environments. In vanilla, you must load the [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi) plugin prior to this one, and a d3 global is exported:

```html
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://raw.githack.com/Kcnarf/d3-weighted-voronoi/master/build/d3-weighted-voronoi.js"></script>
<script src="https://raw.githack.com/Kcnarf/d3-voronoi-map/master/build/d3-voronoi-map.js"></script>
<script>
  var voronoiMap = d3.voronoiMap();
</script>
```

## TL;DR;

In your javascript, in order to define the tessellation:

```javascript
var voronoiMap = d3.voronoiMap()
  .weight(function(d){ return weightScale(d); }         // set the weight accessor
  .clip([[0,0], [0,height], [width, height], [width,0]])  // set the clipping polygon

var res = voronoiMap(data);                         // compute the weighted Voronoi tessellation; returns {polygons, iterationCount, convergenceRatio}
var cells = res.polygons
```

Then, later in your javascript, in order to draw cells:

```javascript
d3.selectAll('path')
  .data(cells)
  .enter()
  .append('path')
  .attr('d', function(d) {
    return cellLiner(d) + 'z';
  })
  .style('fill', function(d) {
    return fillScale(d.site.originalObject);
  });
```

## Reference

- based on [Computing Voronoï Treemaps - Faster, Simpler, and Resolution-independent ](https://www.uni-konstanz.de/mmsp/pubsys/publishedFiles/NoBr12a.pdf)
- [https://github.com/ArlindNocaj/power-voronoi-diagram](https://github.com/ArlindNocaj/power-voronoi-diagram) for a Java implementation

## API

<a name="voronoiMap" href="#voronoiMap">#</a> d3.<b>voronoiMap</b>()

Creates a new voronoiMap with the default accessors and configuration values ([_weight_](#voronoiMap_weight), [_clip_](#voronoiMap_clip), [_convergenceRatio_](#voronoiMap_convergenceRatio), [_maxIterationCount_](#voronoiMap_maxIterationCount), [_minWeightRatio_](#voronoiMap_minWeightRatio), [_initialPosition_](#voronoiMap_initialPosition), and [_initialWeight_](#voronoiMap_initialWeight)).

<a name="_voronoiMap" href="#_voronoiMap">#</a> <i>voronoiMap</i>(<i>data</i>)

Computes the **Voronoï map** for the specified _data_ weights.

Returns a _hash_ where _hash.polygons_ is a sparse array of polygons clipped to the [_clip_](#voronoiMap_clip)-ping polygon, one for each cell (each unique input point) in the diagram. Each polygon is represented as an array of points \[_x_, _y_\] where _x_ and _y_ are the point coordinates, a _site_ field that refers to its site (ie. with x, y and weight retrieved from the original data), and a _site.originalObject_ field that refers to the corresponding element in _data_. Polygons are open: they do not contain a closing point that duplicates the first point; a triangle, for example, is an array of three points. Polygons are also counterclockwise (assuming the origin ⟨0,0⟩ is in the top-left corner). Furthermore, _hash.iterationCount_ is the number of iterations required to compute the resulting map, and _hash.convergenceRatio_ is the final convergence ratio (ie. cell area errors / area of the [_clip_](#voronoiMap_clip)-ping polygon).

<a name="voronoiMap_weight" href="#voronoiMap_weight">#</a> <i>voronoiMap</i>.<b>weight</b>([<i>weight</i>])

If _weight_-accessor is specified, sets the _weight_ accessor. If _weight_ is not specified, returns the current _weight_ accessor, which defaults to:

```js
function weight(d) {
  return d.weight;
}
```

<a name="voronoiMap_clip" href="#voronoiMap_clip">#</a> <i>voronoiMap</i>.<b>clip</b>([<i>clip</i>])

If _clip_ is specified, sets the clipping polygon, compute the adequate [_extent_](#voronoiMap_extent) and [_size_](#voronoiMap_size), and returns this layout. _clip_ defines a hole-free convex polygon, and is specified as an array of 2D points \[x, y\], which must be _(i)_ open (no duplication of the first D2 point) and _(ii)_ counterclockwise (assuming the origin ⟨0,0⟩ is in the top-left corner). If _clip_ is not specified, returns the current clipping polygon, which defaults to:

```js
[[0, 0], [0, 1], [1, 1], [1, 0]];
```

<a name="voronoiMap_extent" href="#voronoiMap_extent">#</a> <i>voronoiMap</i>.<b>extent</b>([<i>extent</i>])

If _extent_ is specified, it is a convenient way to define the clipping polygon as a rectangle. It sets the extent, computes the adequate [_clip_](#voronoiMap_clip)ping polygon and [_size_](#voronoiMap_size), and returns this layout. _extent_ must be a two-element array of 2D points \[x, y\], which defines the clipping polygon as a rectangle with the top-left and bottom-right corners respectively set to the first and second points (assuming the origin ⟨0,0⟩ is in the top-left corner on the screen). If _extent_ is not specified, returns the current extent, which is `[[minX, minY], [maxX, maxY]]` of current clipping polygon, and defaults to:

```js
[[0, 0], [1, 1]];
```

<a name="voronoiMap_size" href="#voronoiMap_size">#</a> <i>voronoiMap</i>.<b>size</b>([<i>size</i>])

If _size_ is specified, it is a convenient way to define the clipping polygon as a rectangle. It sets the size, computes the adequate [_clip_](#voronoiMap_clip)ping polygon and [_extent_](#voronoiMap_extent), and returns this layout. _size_ must be a two-element array of numbers `[width, height]`, which defines the clipping polygon as a rectangle with the top-left corner set to `[0, 0]`and the bottom-right corner set to `[width, height]`(assuming the origin ⟨0,0⟩ is in the top-left corner on the screen). If _size_ is not specified, returns the current size, which is `[maxX-minX, maxY-minY]` of current clipping polygon, and defaults to:

```js
[1, 1];
```

<a name="voronoiMap_convergenceRatio" href="#voronoiMap_convergenceRatio">#</a> <i>voronoiMap</i>.<b>convergenceRatio</b>([<i>convergenceRatio</i>])

If _convergenceRatio_ is specified, sets the convergence ratio, which stops computation when `(cell area errors / clipping polygon area) <= convergenceRatio`. If _convergenceRatio_ is not specified, returns the current _convergenceRatio_ , which defaults to:

```js
var convergenceRation = 0.01; // stops computation when cell area error <= 1% clipping polygon's area
```

The smaller the _convergenceRatio_, the more representative is the map, the longer the computation takes time.

<a name="voronoiMap_maxIterationCount" href="#voronoiMap_maxIterationCount">#</a> <i>voronoiMap</i>.<b>maxIterationCount</b>([<i>maxIterationCount</i>])

If _maxIterationCount_ is specified, sets the maximum allowed number of iterations, which stops computation when it is reached, even if the [_convergenceRatio_](#voronoiMap_convergenceRatio) is not reached. If _maxIterationCount_ is not specified, returns the current _maxIterationCount_ , which defaults to:

```js
var maxIterationCount = 50;
```

If you want to wait until computation stops _only_ when the [_convergenceRatio_](#voronoiMap_convergenceRatio) is reached, just set the _maxIterationCount_ to a large amount. Be warned that computation may take a huge amount of time, due to flickering behaviours in later iterations.

<a name="voronoiMap_minWeightRatio" href="#voronoiMap_minWeightRatio">#</a> <i>voronoiMap</i>.<b>minWeightRatio</b>([<i>minWeightRatio</i>])

If _minWeightRatio_ is specified, sets the minimum weight ratio, which allows to compute the minimum allowed weight (_= maxWeight \* minWeightRatio_). If _minWeightRatio_ is not specified, returns the current _minWeightRatio_ , which defaults to:

```js
var minWeightRatio = 0.01; // 1% of maxWeight
```

_minWeightRatio_ allows to mitigate flickerring behaviour (caused by too small weights), and enhances user interaction by not computing near-empty cells.

<a name="voronoiMap_initialPosition" href="#voronoiMap_initialPosition">#</a> <i>voronoiMap</i>.<b>initialPosition</b>([<i>initialPosition</i>])

If _initialPosition_ is specified, sets the initial coordinate accessor. The accessor is a callback wich is passed the datum, its index, the array it comes from, and the current d3-voronoi-map. The accessor must provide an array of two numbers `[x, y]` inside the clipping polygon, otherwise a random initial position is used instead. If _initialPosition_ is not specified, returns the current accessor, which defaults to a random position inside the clipping polygon:

```js
function randomInitialPosition(d, i, arr, voronoiMap) {
  var clippingPolygon = voronoiMap.clip(),
    extent = voronoiMap.extent(),
    minX = extent[0][0],
    maxX = extent[1][0],
    minY = extent[0][1],
    maxY = extent[1][1],
    dx = maxX - minX,
    dy = maxY - minY;
  var x, y;

  x = minX + dx * Math.random();
  y = minY + dy * Math.random();
  while (!polygonContains(clippingPolygon, [x, y])) {
    x = minX + dx * Math.random();
    y = minY + dy * Math.random();
  }
  return [x, y];
}
```

Above is a quite complex accessor that uses the current d3-voronoi-map's API to ensure that sites are positioned inside the clipping polygon, but the accessor may be simpler (-:

```js
function precomputedInitialPosition(d, i, arr, voronoiMap) {
  return [d.precomputedX, d.precomputedY];
}
```

Considering the same set of data, severall Voronoï map computations lead to disctinct final arrangements, due to the default random initial position of sites. If _initialPosition_ is a callback producing repeatable results, then several computations produce the same final arrangement. This is useful if you want the same arrangement for distinct page loads/reloads.

<a name="voronoiMap_initialWeight" href="#voronoiMap_initialWeight">#</a> <i>voronoiMap</i>.<b>initialWeight</b>([<i>initialWeight</i>])

If _initialWeight_ is specified, sets the initial weight accessor. The accessor is a callback wich is passed the datum, its index, the array it comes from, and the current d3-voronoi-map. The accessor must provide a positive amount. If _initialWeight_ is not specified, returns the current accessor, which defaults to initialize all sites with the same amount (which depends on the clipping polygon and the number of data):

```js
function halfAverageAreaInitialWeight(d, i, arr, vornoiMap) {
  var siteCount = arr.length,
    totalArea = d3PolygonArea(vornoiMap.clip());

  return totalArea / siteCount / 2; // half of the average area of the the clipping polygon
}
```

Above is a quite complex accessor that uses the current d3-voronoi-map's API that sets the same weight for all sites, but the accessor may be simpler (-:

```js
function precomputedInitialWeight(d, i, arr, voronoiMap) {
  return d.precomputedWeight;
}
```

Considering a unique clipping polygon where you want to animate the same data but with slightly different weights (e.g., animate according to the time), this API combined with the [_initialPosition_](#voronoiMap_initialPosition) API allows you to maintain areas from one set to another:

- first, compute the Voronoï map of a first set of data
- then, compute the Voronoï map of another set of data, by initilizing sites to the final values (positions and weights) of first Voronoï map

## Dependencies

- d3-polygon.{polygonCentroid, polygonArea, polygonContains}
- d3-weighted-voronoi.weightedVoronoi

## Testing

In order to test the code

```sh
git clone https://github.com/Kcnarf/d3-voronoi-map.git
[...]
yarn install
[...]
yarn test
```
