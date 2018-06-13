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

The computation of the Voronoï map is based on a iteration/looping process. Hence, obtaining the final partition requires _some iterations_/_some times_, depending on the number and type of data/weights, the desired representativeness of cell areas.

As the [d3-force](https://github.com/d3/d3-force) layout does, this module can be used in two ways :

- <a name="live" href="#live">live Voronoï map</a>: displays the evolution of the self-organising Voronoï map; each iteration is displayed, with some delay between iterations so that the animation is appealing to human eyes;
- <a name="static" href="#static">static Voronoï map</a>: displays only the final most representative Voronoï map, which is faster than the _live_ use case; intermediate iterations are silently computed, one after each other, without any delay.

The rest of this README gives some implementatiton details and example on these two use cases.

## Examples

- [The Individual Costs of Being Obese in the U.S. (2010)](https://bl.ocks.org/kcnarf/e649c8723eff3fd64a23f75901910930), a remake of [HowMuch.net's post](https://howmuch.net/articles/obesity-costs-visualized)

## Installing

Load `https://rawgit.com/Kcnarf/d3-voronoi-map/master/build/d3-voronoi-map.js` (or its `d3-voronoi-map.min.js` version) to make it available in AMD, CommonJS, or vanilla environments. In vanilla, you must load the [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi) plugin prior to this one, and a d3 global is exported:

```html
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://raw.githack.com/Kcnarf/d3-weighted-voronoi/master/build/d3-weighted-voronoi.js"></script>
<script src="https://raw.githack.com/Kcnarf/d3-voronoi-map/master/build/d3-voronoi-map.js"></script>
<script>
  var simulation = d3.voronoiMapSimulation(data);
</script>
```

## TL;DR;

In your javascript, if you want to display a <a name="tldr_live" href="#tldr_live">live</a> Voronoï map (i.e. displays the evolution of the self-organising Voronoï map) :

```javascript
var simulation = d3.voronoiMapSimulation(data)
  .weight(function(d){ return weightScale(d); }           // set the weight accessor
  .clip([[0,0], [0,height], [width, height], [width,0]])  // set the clipping polygon
  .on ("tick", ticked);                                   // function 'ticked' is called after each iteration

function ticked() {
  var state = simulation.state(),                         // retrieve the simulation's state, i.e. {ended, polygons, iterationCount, convergenceRatio}
      polygons = state.polygons,                          // retrieve polygons, i.e. cells of the current iteration
      drawnCells;

  drawnCells = d3.selectAll('path').data(polygons);       // d3's join
  drawnCells
    .enter().append('path')                               // create cells at first render
    .merge(drawnCells);                                   // assigns appropriate shapes and colors
      .attr('d', function(d) {
        return cellLiner(d) + 'z';
      })
      .style('fill', function(d) {
        return fillScale(d.site.originalObject);
      });
}
```

Or, if you want to display only the <a name="tldr_static" href="#tldr_static">static</a> Voronoï map (i.e. display the final most representative arrangement):

```javascript
var simulation = d3.voronoiMapSimulation(data)
  .weight(function(d){ return weightScale(d); }           // set the weight accessor
  .clip([[0,0], [0,height], [width, height], [width,0]])  // set the clipping polygon
  .stop();                                                // interupts the simulation

var state = simulation.state();                           // retrieve the simulation's state, i.e. {ended, polygons, iterationCount, convergenceRatio}

while (!state.ended) {                                    // manually launch each iteration until the simulation ends
  simulation.tick();
  state = simulation.state();
}

var polygons = state.polygons;                            // retrieve polygons, i.e. cells of the final Voronoï map

d3.selectAll('path')
  .data(polygons);                                        // d3's join
  .enter()                                                // create cells with appropriate shapes and colors
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

<a name="voronoiMapSimulation" href="#voronoiMapSimulation">#</a> d3.<b>voronoiMapSimulation</b>(data)

Creates a new simulation with the specified array of data, and the default accessors and configuration values ([_weight_](#simulation_weight), [_clip_](#simulation_clip), [_convergenceRatio_](#simulation_convergenceRatio), [_maxIterationCount_](#simulation_maxIterationCount), [_minWeightRatio_](#simulation_minWeightRatio), [_initialPosition_](#simulation_initialPosition), and [_initialWeight_](#simulation_initialWeight)).

The simulator starts automatically. For a [live](#live) Vornoï map, use [simulation.on](#simulation_on) to listen for _tick_ events as the simulation runs, and _end_ event when the simulation finishes. See [TL;DR; live Voronoï map](#tldr_live).

For a [static](#static) Vornoï map, call [simulation.stop](#simulation_stop), and then call [simulation.tick](#simulation_tick) as desired. See [TL;DR; static Voronoï map](#tldr_static).

<a name="simulation_state" href="#simulation_state">#</a> <i>simulation</i>.<b>state</b>()

Returns a _hash_ of the current state of the simulation.

_hash.polygons_ is a sparse array of polygons clipped to the [_clip_](#simulation_clip)-ping polygon, one for each cell (each unique input point) in the diagram. Each polygon is represented as an array of points \[_x_, _y_\] where _x_ and _y_ are the point coordinates, a _site_ field that refers to its site (ie. with x, y and weight retrieved from the original data), and a _site.originalObject_ field that refers to the corresponding element in _data_ (specified in [d3.voronoiMapSimulation(data)](#voronoiMapSimulation)). Polygons are open: they do not contain a closing point that duplicates the first point; a triangle, for example, is an array of three points. Polygons are also counterclockwise (assuming the origin ⟨0,0⟩ is in the top-left corner).

Furthermore :

- the positive integer _hash.iterationCount_ is the current iteration count;
- the floating number _hash.convergenceRatio_ is the current convergence ratio (ie. cell area errors / area of the [_clip_](#simulation_clip)-ping polygon);
- the boolean _hash.ended_ indicates if the current iteration is the final one, or if the simulation requires more iterations to complete.

<a name="simulation_weight" href="#simulation_weight">#</a> <i>simulation</i>.<b>weight</b>([<i>weight</i>])

If _weight_-accessor is specified, sets the _weight_ accessor. If _weight_ is not specified, returns the current _weight_ accessor, which defaults to:

```js
function weight(d) {
  return d.weight;
}
```

<a name="simulation_clip" href="#simulation_clip">#</a> <i>simulation</i>.<b>clip</b>([<i>clip</i>])

If _clip_ is specified, sets the clipping polygon. _clip_ defines a hole-free convex polygon, and is specified as an array of 2D points \[x, y\], which must be _(i)_ open (no duplication of the first D2 point) and _(ii)_ counterclockwise (assuming the origin ⟨0,0⟩ is in the top-left corner). If _clip_ is not specified, returns the current clipping polygon, which defaults to:

```js
[[0, 0], [0, 1], [1, 1], [1, 0]];
```

<a name="simulation_convergenceRatio" href="#simulation_convergenceRatio">#</a> <i>simulation</i>.<b>convergenceRatio</b>([<i>convergenceRatio</i>])

If _convergenceRatio_ is specified, sets the convergence ratio, which stops simulation when (cell area errors / ([_clip_](#simulation_clip)-ping polygon area) <= _convergenceRatio_. If _convergenceRatio_ is not specified, returns the current _convergenceRatio_ , which defaults to:

```js
var convergenceRation = 0.01; // stops computation when cell area error <= 1% clipping polygon's area
```

The smaller the _convergenceRatio_, the more representative is the final map, the longer the simulation takes time.

<a name="simulation_maxIterationCount" href="#simulation_maxIterationCount">#</a> <i>simulation</i>.<b>maxIterationCount</b>([<i>maxIterationCount</i>])

If _maxIterationCount_ is specified, sets the maximum allowed number of iterations, which stops simulation when it is reached, even if the [_convergenceRatio_](#simulation_convergenceRatio) is not reached. If _maxIterationCount_ is not specified, returns the current _maxIterationCount_ , which defaults to:

```js
var maxIterationCount = 50;
```

If you want to wait until simulation stops _only_ when the [_convergenceRatio_](#simulation_convergenceRatio) is reached, just set the _maxIterationCount_ to a large amount. Be warned that simulation may take a huge amount of time, due to flickering behaviours in later iterations.

<a name="simulation_minWeightRatio" href="#simulation_minWeightRatio">#</a> <i>simulation</i>.<b>minWeightRatio</b>([<i>minWeightRatio</i>])

If _minWeightRatio_ is specified, sets the minimum weight ratio, which allows to compute the minimum allowed weight (_= maxWeight \* minWeightRatio_). If _minWeightRatio_ is not specified, returns the current _minWeightRatio_ , which defaults to:

```js
var minWeightRatio = 0.01; // 1% of maxWeight
```

_minWeightRatio_ allows to mitigate flickerring behaviour (caused by too small weights), and enhances user interaction by not computing near-empty cells.

<a name="simulation_initialPosition" href="#simulation_initialPosition">#</a> <i>simulation</i>.<b>initialPosition</b>([<i>initialPosition</i>])

If _initialPosition_ is specified, sets the initial coordinate accessor. The accessor is a callback wich is passed the datum, its index, the array it comes from, and the underlying [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi) layout (which notably computes the initial map). The accessor must provide an array of two numbers `[x, y]` inside the clipping polygon, otherwise a random initial position is used instead. If _initialPosition_ is not specified, returns the current accessor, which defaults to a random position inside the clipping polygon:

```js
function randomInitialPosition(d, i, arr, weightedVoronoi) {
  var clippingPolygon = weightedVoronoi.clip(),
    extent = weightedVoronoi.extent(),
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

Above is a quite complex accessor that uses the [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi)'s API to ensure that sites are positioned inside the clipping polygon, but the accessor may be simpler (-:

```js
function precomputedInitialPosition(d, i, arr, weightedVoronoi) {
  return [d.precomputedX, d.precomputedY];
}
```

Considering the same set of data, severall Voronoï map simulations lead to disctinct final arrangements, due to the default random initial position of sites. If _initialPosition_ is a callback producing repeatable outputs, then several simulations produce the same final arrangement. This is useful if you want the same arrangement for distinct page loads/reloads.

<a name="simulation_initialWeight" href="#simulation_initialWeight">#</a> <i>simulation</i>.<b>initialWeight</b>([<i>initialWeight</i>])

If _initialWeight_ is specified, sets the initial weight accessor. The accessor is a callback wich is passed the datum, its index, the array it comes from, and the underlying [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi) layout (which notably computes the initial map). The accessor must provide a positive amount. If _initialWeight_ is not specified, returns the current accessor, which defaults to initialize all sites with the same amount (which depends on the clipping polygon and the number of data):

```js
function halfAverageAreaInitialWeight(d, i, arr, weightedVoronoi) {
  var siteCount = arr.length,
    totalArea = d3PolygonArea(weightedVoronoi.clip());

  return totalArea / siteCount / 2; // half of the average area of the the clipping polygon
}
```

Above is a quite complex accessor that uses the [d3-weighted-voronoi](https://github.com/Kcnarf/d3-weighted-voronoi)'s API that sets the same weight for all sites, but the accessor may be simpler (-:

```js
function precomputedInitialWeight(d, i, arr, weightedVoronoi) {
  return d.precomputedWeight;
}
```

Considering a unique clipping polygon where you want to animate the same data but with slightly different weights (e.g., animate according to the time), this API combined with the [_initialPosition_](#simulation_initialPosition) API allows you to maintain areas from one set to another:

- first, compute the Voronoï map of a first set of data
- then, compute the Voronoï map of another set of data, by initilizing sites to the final values (positions and weights) of first Voronoï map

<a name="simulation_stop" href="#simulation_stop">#</a> <i>simulation</i>.<b>stop</b>()

Stops the simulation’s internal timer, if it is running, and returns the simulation. If the timer is already stopped, this method does nothing. This method is useful to display only a [static](#static) Vornoï map. In such a case, you have to stop the simulation, and run it manually till its end with [simulation.tick](#simulation_tick) (see also [TL;DR; static Voronoï map](#tldr_static)).

<a name="simulation_tick" href="#simulation_tick">#</a> <i>simulation</i>.<b>tick</b>()

If the simulation is not ended, computes a more representative Voronoï map by adapting the one of the previous iteration, and increments the current iteration count. If the simulation is ended, it does nothing.

This method does not dispatch events; events are only dispatched by the internal timer when the simulation is started automatically upon creation or by calling [simulation.restart](#simulation_restart).

This method can be used in conjunction with [simulation.stop](#simulation_stop) to compute a [static](#static) Voronoï map (see also [TL;DR; static Voronoï map](#tldr_static)). For large graphs, static layouts should be computed in a web worker to avoid freezing the user interface.

<a name="simulation_restart" href="#simulation_restart">#</a> <i>simulation</i>.<b>restart</b>()

Restarts the simulation’s internal timer and returns the simulation. This method can be used to resume the simulation after temporarily pausing it with [simulation.stop](#simulation_stop).

<a name="simulation_on" href="#simulation_on">#</a> <i>simulation</i>.<b>on</b>(typenames, [listener])

# simulation.on(typenames, [listener]) <>

If listener is specified, sets the event listener for the specified typenames and returns this simulation. If an event listener was already registered for the same type and name, the existing listener is removed before the new listener is added. If listener is null, removes the current event listeners for the specified typenames, if any. If listener is not specified, returns the first currently-assigned listener matching the specified typenames, if any. When a specified event is dispatched, each listener will be invoked with the this context as the simulation.

The typenames is a string containing one or more typename separated by whitespace. Each typename is a type, optionally followed by a period (.) and a name, such as tick.foo and tick.bar; the name allows multiple listeners to be registered for the same type. The type must be one of the following:

- tick - after each tick of the simulation’s internal timer.
- end - after the simulation’s timer stops when alpha < alphaMin.

Note that tick events are not dispatched when [simulation.tick](#simulation_tick) is called manually when only displaying a [static] Voronoï map; events are only dispatched by the internal timer, and are intended for the [live](#live) Voronoï map.

See [dispatch.on](https://github.com/d3/d3-dispatch#dispatch_on) for details.

## Dependencies

- d3-polygon.{polygonCentroid, polygonArea, polygonContains}
- d3-timer.timer
- d3-dispatch.dispatch
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

## Commit

In order to commit some code

```sh
git clone https://github.com/Kcnarf/d3-voronoi-map.git
[...]
yarn install
[...]
yarn precommit
```
