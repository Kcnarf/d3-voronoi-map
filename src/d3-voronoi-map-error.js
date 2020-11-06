// from https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
// (above link provided by https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

export default function d3VoronoiMapError(message) {
  this.message = message;
  this.stack = new Error().stack;
}

d3VoronoiMapError.prototype.name = 'd3VoronoiMapError';
d3VoronoiMapError.prototype = new Error();
