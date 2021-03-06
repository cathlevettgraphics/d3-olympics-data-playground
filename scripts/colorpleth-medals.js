async function drawCloropleth() {
  // import country shapes
  const countryShapes = await d3.json(
    './../ne_50m_admin_0_countries/world-geojson.json',
  );

  // get data
  const dataset = await d3.csv('./../data/medals.csv');
  console.log({ dataset });

  // get name and id data
  const countryNameAccessor = (d) => d.properties['NAME'];
  const countryIdAccessor = (d) => d.properties['ADM0_A3_IS'];

  // filter the data we need
  let totalMedals = {};

  for (const country of dataset) {
    totalMedals[country['ioc-code']] = +country['total'];
  }

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
    .select('#medal-map-001')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = map
    .append('g')
    .style(
      'transform',
      `translate( ${dimensions.margin.left}px, ${dimensions.margin.top}px)`,
    );

  // create color scale for total medals
  const metricValues = Object.values(totalMedals);
  // extract smallest /largest value
  const metricValuesExtent = d3.extent(metricValues);
  const colorScale = d3
    .scaleLinear()
    .domain([metricValuesExtent[0], metricValuesExtent[1]])
    .range(['#d9ed92', '#76c893']);

  // draw map
  const countries = bounds
    .selectAll('.country')
    .data(countryShapes.features)
    .join('path')
    .attr('class', 'country')
    .attr('id', (d) => countryNameAccessor(d))
    .attr('d', pathGenerator)
    .attr('fill', (d) => {
      const metricValue = totalMedals[countryIdAccessor(d)];
      if (typeof metricValue === 'undefined' || metricValue === 0) {
        return '#efefef';
      }
      return colorScale(metricValue);
    })
    .attr('stroke-width', 0.5)
    .attr('stroke', '#bbb');

  // create legend
  const keyGroup = map
    .append('g')
    .attr(
      'transform',
      `translate(${120}, ${dimensions.boundedHeight / 2 + 125})`,
    );

  const keyTitle = keyGroup
    .append('text')
    .attr('y', -23)
    .attr('x', -60)
    .attr('class', 'key-title')
    .text('olympic medals');

  const keyline = keyGroup
    .append('text')
    .attr('y', 0)
    .attr('x', -60)
    .attr('class', 'key-byline')
    .text('all time summer games');

  // create color bar
  const defs = map.append('defs');
  const keyGradiendId = 'key-gradient';

  // create gradient
  const gradient = defs
    .append('linearGradient')
    .attr('id', keyGradiendId)
    .selectAll('stop')
    .data(colorScale.range())
    .join('stop')
    .attr('stop-color', (d) => d)
    .attr('offset', (d, i) => `${(i * 100) / 2}%`);

  // create the rect to contain gradient
  const keyWidth = 120;
  const keyHeight = 16;
  const keyGradient = keyGroup
    .append('rect')
    .attr('x', -keyWidth / 2)
    .attr('y', 10)
    .attr('height', keyHeight)
    .attr('width', keyWidth)
    .style('fill', `url(#${keyGradiendId})`);

  // label min and max values
  const keyValueRight = keyGroup
    .append('text')
    .attr('class', 'key-value')
    .attr('x', keyWidth / 2 + 10)
    .attr('y', keyHeight / 2 + 14)
    .text(`${d3.format(',.0f')(metricValuesExtent[1])}`);

  const keyValueLeft = keyGroup
    .append('text')
    .attr('class', 'key-value')
    .attr('x', -keyWidth / 2 - 10)
    .attr('y', keyHeight / 2 + 14)
    .text(`${metricValuesExtent[0]}`)
    .style('text-anchor', 'end');
}

drawCloropleth();
