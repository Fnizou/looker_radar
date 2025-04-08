const d3 = window.d3;

function drawRadarChart(data, element) {
  element.innerHTML = "";

  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 40;

  const svg = d3.select(element)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`);

  const rows = data.tables.DEFAULT;
  if (!rows || rows.length === 0) return;

  const keys = Object.keys(rows[0].values).filter(k => k !== 'Nom');
  const angleSlice = (2 * Math.PI) / keys.length;

  const maxVal = d3.max(rows, row => d3.max(keys, k => +row.values[k]));

  // Radial scale
  const r = d3.scaleLinear().range([0, radius]).domain([0, maxVal]);

  // Draw grid
  for (let level = 1; level <= 5; level++) {
    const levelFactor = radius * level / 5;
    const points = keys.map((_, i) => {
      const angle = i * angleSlice;
      return [
        levelFactor * Math.cos(angle - Math.PI/2),
        levelFactor * Math.sin(angle - Math.PI/2)
      ];
    });

    svg.append("polygon")
      .attr("points", points.map(p => p.join(",")).join(" "))
      .attr("stroke", "#ddd")
      .attr("fill", "none");
  }

  // Axis lines + labels
  keys.forEach((key, i) => {
    const angle = i * angleSlice;
    const x = radius * Math.cos(angle - Math.PI/2);
    const y = radius * Math.sin(angle - Math.PI/2);

    svg.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", x).attr("y2", y)
      .attr("stroke", "#999");

    svg.append("text")
      .attr("x", x * 1.1)
      .attr("y", y * 1.1)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .text(key);
  });

  // Draw player polygons
  rows.forEach(row => {
    const points = keys.map((k, i) => {
      const val = +row.values[k];
      const angle = i * angleSlice;
      return [
        r(val) * Math.cos(angle - Math.PI/2),
        r(val) * Math.sin(angle - Math.PI/2)
      ];
    });

    svg.append("polygon")
      .attr("points", points.map(p => p.join(",")).join(" "))
      .attr("fill", "tomato")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "tomato")
      .attr("stroke-width", 2);
  });
}

gviz.ext.visualizations.register({
  id: 'd3_radar_chart',
  name: 'Radar Chart',
  description: 'Radar chart using D3.js',
  draw: drawRadarChart
});
