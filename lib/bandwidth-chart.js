const chart = require('ascii-chart');

function pointsFromBandwidthData(values, numPoints) {

  // Define vars
  const len = values.length;
  const points = [];
  let i = 0;
  let size;

  // Split values into n points
  if(numPoints < 2) {
    points.push(values);
  } else {
    if(len % numPoints === 0) {
      size = Math.floor(len / numPoints);
      while (i < len) {
        points.push(values.slice(i, i += size));
      }
    }
    while (i < len) {
      size = Math.ceil((len - i) / numPoints--);
      points.push(values.slice(i, i += size));
    }
  }

  // Return points
  return points

    // Calculate average value of each point
    .map(point => Math.round(point.reduce((a,b) => a + b) / point.length))

    // Convert bytes to megabytes
    .map(bytes => Number((bytes / 1000000).toPrecision(3)));
}

module.exports = values => {
  if(values && values.length) {
    const points = pointsFromBandwidthData(values, 57);
    return chart(points, {
      width: 120,
      height: 20,
      padding: 0,
      pointChar: '*',
      negativePointChar: '.'
    });
  } else {
    return '';
  }
}
