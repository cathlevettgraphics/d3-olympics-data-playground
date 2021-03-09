async function drawProportions() {
  // import country shapes
  const countryShapes = await d3.json(
    './../ne_50m_admin_0_countries/world-geojson.json',
  );
  // get data
  // const dataset = await d3.csv('./../data/medals.csv');
  const dataset = await d3.csv('./../data/medal-geo.csv');
  // console.log({ dataset });

  const countryProportions = await d3.csv('./../data/medal-geo.csv');
  // console.log({ countryProportions });

  // get name and id data
  const countryNameAccessor = (d) => d.properties['NAME'];
  const countryIdAccessor = (d) => d.properties['ADM0_A3_IS'];

  // filter the data we need

  // create map dimensions
  let dimensions = {
    width: window.innerWidth,
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  };

  // calculate total width
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;

  // create map projection
  const sphere = { type: 'Sphere' };
  const projection = d3.geoWinkel3().fitWidth(dimensions.boundedWidth, sphere);

  const pathGenerator = d3.geoPath(projection);
  // get height dimentions
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere);
  dimensions.boundedHeight = y1;
  dimensions.height =
    dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom;

  // draw canvas
  const map = d3
    .select('#medal-map-002')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = map
    .append('g')
    .style(
      'transform',
      `translate( ${dimensions.margin.left}px, ${dimensions.margin.top}px)`,
    );

  // draw ma
  const countries = bounds
    .append('g')
    .selectAll('.country')
    .data(countryShapes.features)
    .join('path')
    .attr('class', 'country')
    .attr('id', (d) => countryNameAccessor(d))
    .attr('d', pathGenerator)
    .attr('fill', (d) => {
      if (countryNameAccessor(d) === 'Antarctica') {
        return '#fff';
      }
      return '#efefef';
    })
    .attr('stroke-width', 0.5)
    .attr('stroke', (d) => {
      if (countryNameAccessor(d) === 'Antarctica') {
        return '#fff';
      }
      return '#bbb';
    });

  // create centroids from file
  /*
  const centroidData = countryShapes.features;
  // get all centroids
  const countryCentroids = centroidData.map((item) =>
    pathGenerator.centroid(item),
  );
  console.log({ countryCentroids });
  */

  // prop circles
  const medalsPerNation = bounds
    .append('g')
    .selectAll('circles')
    .data(countryProportions)
    .enter()
    .append('circle')
    .attr('cx', (d) => projection([d.longitude, d.latitude])[0])
    .attr('cy', (d) => projection([d.longitude, d.latitude])[1])
    .attr('r', (d) => Math.sqrt(parseInt(d.total) * 0.55))
    .attr('stroke', '#38b000')
    .attr('stroke-width', '1px')
    .attr('fill', '#ccff33')
    .attr('fill-opacity', 0.2)
    .attr('id', (d) => d.Team);

  // Text
  const medalTotalText = bounds
    .append('g')
    .selectAll('text')
    .data(countryProportions)
    .enter()
    .append('text')
    .attr('x', (d) => projection([d.longitude, d.latitude])[0])
    .attr('y', (d) => projection([d.longitude, d.latitude])[1])
    .attr('dy', 5)
    .text((d) => {
      if (d.total > 600) {
        const format = d3.format(',');
        return format(d.total);
      }
    })
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .attr('font-size', '18px');
}

drawProportions();
