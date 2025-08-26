const margin = {top: 20, right: 30, bottom: 50, left: 80},
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("xp_data.json").then(data => {
  data.forEach(d => {
    d.date = new Date(d.date);
    d.xp = +d.xp;
  });

  let allData = [...data]; // keep a working array including live points

  const x = d3.scaleTime()
    .domain(d3.extent(allData, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(allData, d => d.xp)])
    .range([height, 0]);

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.xp));

  // axes
  const yAxis = d3.axisLeft(y)
    .tickFormat(d => d >= 1000000 ? (d/1000000) + "M" : d);

  svg.append("g")
    .call(yAxis)
    .attr("transform", "translate(10,0)"); // scoot labels right

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // line path
  const path = svg.append("path")
    .datum(allData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // squares
  const points = svg.selectAll(".point")
    .data(allData)
    .enter()
    .append("rect")
    .attr("class", "point")
    .attr("x", d => x(d.date) - 4)
    .attr("y", d => y(d.xp) - 4)
    .attr("width", 8)
    .attr("height", 8)
    .attr("fill", "steelblue");

  // Function to update chart (used for live points)
  function updateChart() {
    path.datum(allData)
      .attr("d", line);

    const upd = svg.selectAll(".point")
      .data(allData);

    upd.enter()
      .append("rect")
      .attr("class", "point")
      .attr("width", 8)
      .attr("height", 8)
      .merge(upd)
      .attr("x", d => x(d.date) - 4)
      .attr("y", d => y(d.xp) - 4)
      .attr("fill", (d, i) => i >= data.length ? "orange" : "steelblue"); // live points orange

    upd.exit().remove();
  }

  // Add live point
  d3.select("#add-live").on("click", () => {
    const dateVal = document.getElementById("live-date").value;
    const xpVal = +document.getElementById("live-xp").value;
    if (!dateVal || !xpVal) return;

    allData.push({ date: new Date(dateVal), xp: xpVal });
    allData.sort((a, b) => a.date - b.date);
    updateChart();
    renderTable();
    calcExpected();
  });

  // Expected completion calc
  function calcExpected() {
    if (allData.length < 2) return;

    // last 7 days
    const cutoff = new Date(allData[allData.length - 1].date);
    cutoff.setDate(cutoff.getDate() - 7);

    const recent = allData.filter(d => d.date >= cutoff);
    if (recent.length < 2) return;

    const gained = recent[recent.length-1].xp - recent[0].xp;
    const days = (recent[recent.length-1].date - recent[0].date) / (1000*60*60*24);
    const dailyRate = gained / days;

    const latestXp = allData[allData.length-1].xp;
    const remaining = 30000000 - latestXp;
    const etaDays = remaining / dailyRate;

    const expectedDate = new Date(allData[allData.length-1].date);
    expectedDate.setDate(expectedDate.getDate() + etaDays);

    document.getElementById("completion").textContent =
      `At current 7-day pace (${Math.round(dailyRate).toLocaleString()} XP/day), you will reach 30M on ${expectedDate.toDateString()}`;
  }

  calcExpected();

  // Data table
  function renderTable() {
    const tableDiv = d3.select("#data-table");
    tableDiv.html("");
    const table = tableDiv.append("table").attr("border", 1);
    const header = table.append("thead").append("tr");
    header.append("th").text("Date");
    header.append("th").text("XP");

    const rows = table.append("tbody")
      .selectAll("tr")
      .data(allData)
      .enter()
      .append("tr");

    rows.append("td").text(d => d.date.toLocaleString());
    rows.append("td").text(d => d.xp.toLocaleString());
  }

  renderTable();
});
