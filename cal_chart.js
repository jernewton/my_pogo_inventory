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
const finishTargetXP  = 7847; // 30 million  15,123,414 
const finishTargetDate = new Date("2025-09-30T23:59:59"); // Example: Jan 1, 2026

const inaweek = new Date();
inaweek.setDate(inaweek.getDate() + 30);

const view_TargetXP = 0; // 30 million  15,123,414 
const view_TargetDate = inaweek;

d3.json("cal_data.json").then(data => {
  data.forEach(d => {
    d.timestamp = new Date(d.timestamp);
    d.xp = +d.xp;
  });

  // Define scales
  const x = d3.scaleTime()
    .domain([
      d3.min(data, d => d.timestamp),
      d3.max([finishTargetDate, ...data.map(d => d.timestamp)])
    ])
    .range([0, width]);

  // Projected pace line: extend current rate forward until 30M
  const currPace = data[data.length - 1];

  // Calculate slope (XP per ms)
  const elapsedTime = currPace.timestamp - data[0].timestamp;
  const gainedXP = currPace.xp - data[0].xp;
  const xpPerMs = gainedXP / elapsedTime;

  const probXP = data[0].xp + xpPerMs * (inaweek - data[0].timestamp)

  const y = d3.scaleLinear()
    .domain([0, 
      Math.max(finishTargetXP, probXP, d3.max(data, d => d.xp))])
    .range([height, 0]);

    // ✅ Add dashed black horizontal line at 30M XP
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(7850))
    .attr("y2", y(7850))
    .attr("stroke", "black")
    .attr("stroke-dasharray", "4 4")
    .attr("stroke-width", 1);
  
  // ✅ Add dashed black vertical line at 30M XP
  svg.append("line")
  .attr("x1", x(finishTargetDate))
  .attr("x2", x(finishTargetDate))
  .attr("y1", 0)
  .attr("y2", height)
  .attr("stroke", "black")
  .attr("stroke-dasharray", "4 4")
  .attr("stroke-width", 1);

  console.log('here')
  // Optional label
  svg.append("text")
    .attr("x", width - 5)
    .attr("y", y(7850) - 5)
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .style("font-size", "12px")
    .text("7.5k XP");

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
  const Start = data[0];
  const paceLineData = [
    { timestamp: Start.timestamp, xp: Start.xp },
    { timestamp: finishTargetDate, xp: finishTargetXP }
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

// Project when 7.5k will be reached
const remainingXP = finishTargetXP - currPace.xp;
const projectedMs = remainingXP / xpPerMs;
const projectedDate = new Date(currPace.timestamp.getTime() + projectedMs);

// Build line data -- green
const projectedLineData = [
  { timestamp: Start.timestamp, xp: Start.xp },
  { timestamp: projectedDate, xp: finishTargetXP }
];
console.log('here')
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
  .attr("cy", y(finishTargetXP))
  .attr("r", 5)
  .attr("fill", "green");

svg.append("text")
  .attr("x", x(projectedDate) + 5)
  .attr("y", y(finishTargetXP) - 5)
  .text(d3.timeFormat("%b %d, %Y")(projectedDate))
  .attr("fill", "green");

// Compute slope of current pace (xp per ms)
const slope = (currPace.xp - Start.xp) / (currPace.timestamp - Start.timestamp);

// Pick your target time (e.g. tomorrow at noon)
const tomorrowNoon = new Date();
tomorrowNoon.setDate(tomorrowNoon.getDate() + 1);
tomorrowNoon.setHours(0, 0, 0, 0);



// Project XP at that time using slope from start
const xpAtTomorrow = Math.round((Start.xp + slope * (tomorrowNoon - Start.timestamp)));
// Project XP at that time using slope from start
const xpAtEnd = Math.round((Start.xp + slope * (finishTargetDate - Start.timestamp)));


// Convert to screen coords
const markX = x(tomorrowNoon);
const markY = y(xpAtTomorrow);

// Convert to screen coords
const markXEnd = x(finishTargetDate);
const markYEnd = y(xpAtEnd);

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
  .text(`${(xpAtTomorrow-currPace.xp).toLocaleString()} more cal`);

// Draw point
svg.append("circle")
  .attr("cx", markXEnd)
  .attr("cy", markYEnd)
  .attr("r", 5)
  .attr("fill", "purple");

// Label it
svg.append("text")
  .attr("x", markXEnd - 75)
  .attr("y", markYEnd - 15)
  .attr("fill", "purple")
  .style("font-size", "12px")
  .text(`${(xpAtEnd).toLocaleString()} cals`);

//   // Convert to screen coords 2
// const markXtoday = x(todayNoon);
// const markYtoday = y(xpAtToday);

// // Draw point 2
// svg.append("circle")
//   .attr("cx", markXtoday)
//   .attr("cy", markYtoday)
//   .attr("r", 5)
//   .attr("fill", "blue");

// // Label it
// svg.append("text")
//   .attr("x", markXtoday + 5)
//   .attr("y", markYtoday + 15)
//   .attr("fill", "blue")
//   .style("font-size", "12px")
//   .text(`${(xpAtToday/1000).toLocaleString()}k XP`);

// console.log('slow start')
// // Compute slope of current pace (xp per ms)
const slope_slow = (finishTargetXP - Start.xp) / (finishTargetDate - Start.timestamp);
// Project XP at that time using slope from start
const xpAtTomorrow2 = Math.round((Start.xp + slope_slow * (tomorrowNoon - Start.timestamp)));

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
  .text(`${(xpAtTomorrow2-currPace.xp).toLocaleString()} more cal`);


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
    .attr("transform", `translate(${width - 200}, 300)`);

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
    .text("Pace to 7.5k by 9/30");

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
  .text("Cal tomorrow");

//legend for poly line

    
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


  // ==============================
// Polynomial Regression Forecast
// ==============================

// Convert time → numeric (days since first timestamp)
const t0 = data[0].timestamp.getTime();
const polyData = data.map(d => [
  (d.timestamp.getTime() - t0) / (1000 * 60 * 60 * 24), // x in days
  d.xp
]);

// Quadratic regression (fit ax^2 + bx + c)
function quadraticRegression(points) {
  const n = points.length;
  let sumX=0, sumX2=0, sumX3=0, sumX4=0;
  let sumY=0, sumXY=0, sumX2Y=0;

  points.forEach(([x,y]) => {
    sumX += x;
    sumX2 += x*x;
    sumX3 += x*x*x;
    sumX4 += x*x*x*x;
    sumY += y;
    sumXY += x*y;
    sumX2Y += x*x*y;
  });

  // Solve normal equations for quadratic fit
  const A = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4]
  ];
  const B = [sumY, sumXY, sumX2Y];

  // Solve linear system (Gaussian elimination)
  function solve(A,B){
    const m = A.length;
    for(let i=0;i<m;i++){
      // pivot
      let maxRow=i;
      for(let k=i+1;k<m;k++) if(Math.abs(A[k][i])>Math.abs(A[maxRow][i])) maxRow=k;
      [A[i],A[maxRow]]=[A[maxRow],A[i]];
      [B[i],B[maxRow]]=[B[maxRow],B[i]];
      // eliminate
      for(let k=i+1;k<m;k++){
        const c=A[k][i]/A[i][i];
        for(let j=i;j<m;j++) A[k][j]-=c*A[i][j];
        B[k]-=c*B[i];
      }
    }
    // back substitution
    const x=Array(m).fill(0);
    for(let i=m-1;i>=0;i--){
      let sum=0;
      for(let j=i+1;j<m;j++) sum+=A[i][j]*x[j];
      x[i]=(B[i]-sum)/A[i][i];
    }
    return x; // [c, b, a]
  }

  const [c,b,a] = solve(A,B);
  return (x) => a*x*x + b*x + c;
}

// Fit polynomial
const polyFunc = quadraticRegression(polyData);

// Find projected day where XP = 30M
let day = (polyData[polyData.length-1][0]);
while(polyFunc(day) < finishTargetXP && day < 10000) {
  day += 0.5; // step half a day
}
const projectedDate_poly = new Date(t0 + day * 24*60*60*1000);

// Build line data
const polyLineData = d3.range(0, day, 1).map(d => ({
  timestamp: new Date(t0 + d*24*60*60*1000),
  xp: polyFunc(d)
}));

// Draw polynomial fit line
const polyLine = d3.line()
  .x(d => x(d.timestamp))
  .y(d => y(d.xp));

svg.append("path")
  .datum(polyLineData)
  .attr("fill", "none")
  .attr("stroke", "orange")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "6 3")
  .attr("d", polyLine);

// Mark 30M crossing
svg.append("circle")
  .attr("cx", x(projectedDate_poly))
  .attr("cy", y(finishTargetXP))
  .attr("r", 5)
  .attr("fill", "orange");

svg.append("text")
  .attr("x", x(projectedDate_poly) + 5)
  .attr("y", y(finishTargetXP) - 5)
  .text("Poly Fit: " + d3.timeFormat("%b %d, %Y")(projectedDate_poly))
  .attr("fill", "orange");

  //poly projection
  legend.append("line")
  .attr("x1", 0).attr("y1", 90)
  .attr("x2", 12).attr("y2", 90)
  .attr("stroke", "orange")
  .attr("stroke-dasharray", "6 3")
  .attr("stroke-width", 2);

  legend.append("text")
  .attr("x", 20).attr("y", 90)
  .attr("alignment-baseline", "middle")
  .text("Proj, 30M @ " + d3.timeFormat("%m/%d %H:%M")(projectedDate_poly));



});