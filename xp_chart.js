// xp_chart.js

// Responsive container
const container = d3.select("#chart");
const containerWidth = parseInt(container.style("width")); 
const aspectRatio = 800 / 400;

const margin = { top: 40, right: 30, bottom: 70, left: 70 };
const width = containerWidth - margin.left - margin.right;
const height = width / aspectRatio - margin.top - margin.bottom;

const svg = container
  .append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom + 40}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .classed("responsive-svg", true)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Parameters for pace line
//const paceTargetXP = 30000000; // 30 million  15,123,414 
const paceTargetXP = 15123414 ; // 30 million  15,123,414 
const paceTargetDate = new Date("2025-09-05T00:00:00"); // Example: Jan 1, 2026
//const paceTargetDate = new Date("2025-10-15T00:00:00"); // Example: Jan 1, 2026

d3.json("xp_data.json").then(data => {
  data.forEach(d => {
    d.timestamp = new Date(d.timestamp);
    d.xp = +d.xp;
  });

  // Define scales
  const x = d3.scaleTime()
    .domain([
      d3.min(data, d => d.timestamp),
      d3.max([paceTargetDate, ...data.map(d => d.timestamp)])
    ])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([10000000, Math.max(paceTargetXP, d3.max(data, d => d.xp))])
    .range([height, 0]);

  // Define line generator
  const line = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.xp));

  // Draw actual XP line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Add square markers
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.timestamp) - 4)
    .attr("y", d => y(d.xp) - 4)
    .attr("width", 8)
    .attr("height", 8)
    .attr("fill", "steelblue");

  // Pace line: from earliest data point to target
  const paceStart = data[0];
  const paceLineData = [
    { timestamp: paceStart.timestamp, xp: paceStart.xp },
    { timestamp: paceTargetDate, xp: paceTargetXP }
  ];

  const paceLine = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.xp));

  svg.append("path")
    .datum(paceLineData)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-dasharray", "6 3")
    .attr("stroke-width", 2)
    .attr("d", paceLine);

  // X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(15));

  // Y axis with abbreviation (0 → 10M, 20M, etc.)
  const yAxis = d3.axisLeft(y)
    .tickFormat(d => d >= 1000000 ? (d / 1000000) + "M" : d);

  svg.append("g")
    .call(yAxis)
    .selectAll("text")
    .attr("x", -40) // scoot labels right
    .style("text-anchor", "start");

  // Labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .text("Date");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .text("XP");

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 200)`);

  legend.append("rect")
    .attr("width", 12).attr("height", 12)
    .attr("fill", "steelblue");

  legend.append("text")
    .attr("x", 20).attr("y", 10)
    .attr("alignment-baseline", "middle")
    .text("Actual XP");

  legend.append("line")
    .attr("x1", 0).attr("y1", 30)
    .attr("x2", 12).attr("y2", 30)
    .attr("stroke", "red")
    .attr("stroke-dasharray", "6 3")
    .attr("stroke-width", 2);

  legend.append("text")
    .attr("x", 20).attr("y", 30)
    .attr("alignment-baseline", "middle")
    .text("Pace to 30M by 10/15");

    // // Footer text
    // svg.append("text")
    // .attr("x", width / 2)
    // .attr("y", height + margin.bottom)
    // .attr("text-anchor", "middle")
    // .style("font-size", "12px")
    // .style("fill", "#555")
    // .text("XP progress tracked every 30 minutes. Target pace shown as dashed red line.");

    // Footer text
    // svg.append("text")
    // .attr("x", width / 2)
    // .attr("y", height + margin.bottom+30)
    // .attr("text-anchor", "middle")
    // .style("font-size", "22px")
    //.style("fill", "#555")
    //.text("XP progress tracked every 30 minutes. Target pace shown as dashed red line.");


// ==============================
  // Data Table below the chart
  // ==============================

  const table = d3.select("#chart")
    .append("table")
    .attr("class", "data-table");

  // Table header
  const thead = table.append("thead");
  thead.append("tr")
    .selectAll("th")
    .data(["Timestamp", "XP"])
    .enter()
    .append("th")
    .text(d => d);

  // Table body
  const tbody = table.append("tbody");
  data.forEach(d => {
    const row = tbody.append("tr");
    row.append("td").text(d.timestamp.toLocaleString());
    row.append("td").text(d.xp.toLocaleString());
  });
});