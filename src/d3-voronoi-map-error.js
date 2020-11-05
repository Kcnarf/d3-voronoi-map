export default function d3VoronoiMapError(message) {
  this.message = message;
}

d3VoronoiMapError.prototype = new Error();
