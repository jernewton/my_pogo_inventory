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
const paceTargetXP = 30000000; // 30 million  15,123,414 
const view_TargetXP = 16500000; // 30 million  15,123,414 
const paceTargetDate = new Date("2025-10-14T23:59:59"); // Example: Jan 1, 2026
const view_TargetDate = new Date("2025-09-05T00:00:00");
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
      d3.max([view_TargetDate, ...data.map(d => d.timestamp)])
      //d3.max([paceTargetDate, ...data.map(d => d.timestamp)])
    ])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([10000000, 
      //Math.max(paceTargetXP, d3.max(data, d => d.xp))])
      Math.max(view_TargetXP, d3.max(data, d => d.xp))])
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


// Projected pace line: extend current rate forward until 30M
const currPace = data[data.length - 1];

// Calculate slope (XP per ms)
const elapsedTime = currPace.timestamp - paceStart.timestamp;
const gainedXP = currPace.xp - paceStart.xp;
const xpPerMs = gainedXP / elapsedTime;

// Project when 30M will be reached
const remainingXP = paceTargetXP - currPace.xp;
const projectedMs = remainingXP / xpPerMs;
const projectedDate = new Date(currPace.timestamp.getTime() + projectedMs);

// Build line data -- green
const projectedLineData = [
  { timestamp: paceStart.timestamp, xp: paceStart.xp },
  { timestamp: projectedDate, xp: paceTargetXP }
];

const projectedLine = d3.line()
  .x(d => x(d.timestamp))
  .y(d => y(d.xp));

svg.append("path")
  .datum(projectedLineData)
  .attr("fill", "none")
  .attr("stroke", "green")
  .attr("stroke-dasharray", "6 3")
  .attr("stroke-width", 2)
  .attr("d", projectedLine);

// Optional marker + label
svg.append("circle")
  .attr("cx", x(projectedDate))
  .attr("cy", y(paceTargetXP))
  .attr("r", 5)
  .attr("fill", "green");

svg.append("text")
  .attr("x", x(projectedDate) + 5)
  .attr("y", y(paceTargetXP) - 5)
  .text(d3.timeFormat("%b %d, %Y")(projectedDate))
  .attr("fill", "green");

  const currPrevPace = data[data.length - 2];
  const AmbitPaceTargetDate = new Date("2025-10-11T15:00:00"); // Example: Jan 1, 2026

//   // Build line data orange
// const projected30MLineData = [
//   //{ timestamp: currPrevPace.timestamp, xp: currPrevPace.xp },
//   { timestamp: paceStart.timestamp, xp: paceStart.xp },
//   { timestamp: AmbitPaceTargetDate, xp: paceTargetXP }
// ];

// const projected30MLine = d3.line()
//   .x(d => x(d.timestamp))
//   .y(d => y(d.xp));

//   svg.append("path")
//   .datum(projected30MLineData)
//   .attr("fill", "none")
//   .attr("stroke", "orange")
//   .attr("stroke-dasharray", "6 3")
//   .attr("stroke-width", 2)
//   .attr("d", projected30MLine);

// Assume you have
// startPoint = { timestamp: Date, xp: number }
// currentPoint = { timestamp: Date, xp: number }

// Compute slope of current pace (xp per ms)
const slope = (currPace.xp - paceStart.xp) / (currPace.timestamp - paceStart.timestamp);

// Pick your target time (e.g. tomorrow at noon)
const tomorrowNoon = new Date();
tomorrowNoon.setDate(tomorrowNoon.getDate() + 1);
tomorrowNoon.setHours(9, 0, 0, 0);

// Project XP at that time using slope from start
const xpAtTomorrow = paceStart.xp + slope * (tomorrowNoon - paceStart.timestamp);

// Convert to screen coords
const markX = x(tomorrowNoon);
const markY = y(xpAtTomorrow);

// Draw point
svg.append("circle")
  .attr("cx", markX)
  .attr("cy", markY)
  .attr("r", 5)
  .attr("fill", "purple");

// Label it
svg.append("text")
  .attr("x", markX + 5)
  .attr("y", markY + 15)
  .attr("fill", "purple")
  .style("font-size", "12px")
  .text(`${xpAtTomorrow.toLocaleString()} XP`);

// // Compute slope of current pace (xp per ms)
const slope_slow = (paceTargetXP - paceStart.xp) / (paceTargetDate - paceStart.timestamp);
// Project XP at that time using slope from start
const xpAtTomorrow2 = paceStart.xp + slope_slow * (tomorrowNoon - paceStart.timestamp);

// Convert to screen coords
//const markX = x(tomorrowNoon);
const markY2 = y(xpAtTomorrow2);

// Draw point
svg.append("circle")
  .attr("cx", markX)
  .attr("cy", markY2)
  .attr("r", 5)
  .attr("fill", "purple");

// Label it
svg.append("text")
  .attr("x", markX + 5)
  .attr("y", markY2 + 15)
  .attr("fill", "purple")
  .style("font-size", "12px")
  .text(`${xpAtTomorrow2.toLocaleString()} XP`);


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
    .attr("transform", `translate(${width - 200}, 200)`);

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

    // ✅ Add projected line with dynamic finish date
  legend.append("line")
  .attr("x1", 0).attr("y1", 50)
  .attr("x2", 12).attr("y2", 50)
  .attr("stroke", "green")
  .attr("stroke-dasharray", "6 3")
  .attr("stroke-width", 2);

  legend.append("text")
  .attr("x", 20).attr("y", 50)
  .attr("alignment-baseline", "middle")
  .text("Proj, 30M @ " + d3.timeFormat("%m/%d %H:%M")(projectedDate));

    // ✅ Purple Dots
  legend.append("circle")
  .attr("cx", 6)
  .attr("cy", 70)
  .attr("r", 5)
  .attr("fill", "purple");

legend.append("text")
  .attr("x", 20).attr("y", 70)
  .attr("alignment-baseline", "middle")
  .text("XP tomorrow at 9am");

    
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