export async function renderRoleGrid() {
  const container = document.getElementById("role-grid");
  container.innerHTML = "";

  try {
    const response = await fetch("data/team-roles.json");
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    // `data` is an object: { trainerName: [ {mon_role, mon_value}, ... ], ... }

    // Collect all trainers
    const trainers = Object.keys(data).sort();

    // Collect all roles & sub-roles from all trainers
    // Structure: { role: Set(subRole) }
    const rolesMap = {};

    for (const trainer of trainers) {
      data[trainer].forEach(({ mon_role }) => {
        const [role, subRole] = mon_role.split("-");
        if (!rolesMap[role]) rolesMap[role] = new Set();
        rolesMap[role].add(subRole);
      });
    }

    // Convert sets to sorted arrays
    for (const role in rolesMap) {
      rolesMap[role] = Array.from(rolesMap[role]).sort();
    }

    // Create table element
    const table = document.createElement("table");
    table.classList.add("role-grid");

    // Header row: empty corner + trainer names
    const headerRow = document.createElement("tr");
    headerRow.appendChild(document.createElement("th")); // empty corner
    for (const trainer of trainers) {
      const th = document.createElement("th");
      th.textContent = trainer;
      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // For each role group (tank, attacker, etc.)
    for (const role of Object.keys(rolesMap).sort()) {
      // Role section header row
      const roleRow = document.createElement("tr");
      const roleHeader = document.createElement("th");
      roleHeader.colSpan = trainers.length + 1;
      roleHeader.textContent = role.toUpperCase();
      roleHeader.classList.add("role-section-header");
      roleRow.appendChild(roleHeader);
      table.appendChild(roleRow);

      // For each sub-role under the role
      for (const subRole of rolesMap[role]) {
        const row = document.createElement("tr");

        // Sub-role name cell
        const subRoleCell = document.createElement("td");
        subRoleCell.textContent = subRole;
        subRoleCell.classList.add("sub-role-name");
        row.appendChild(subRoleCell);

        // One cell per trainer
        for (const trainer of trainers) {
          const cell = document.createElement("td");

          // Find the matching mon_value for this trainer and sub-role
          const entry = data[trainer].find(e => {
            const [r, sr] = e.mon_role.split("-");
            return r === role && sr === subRole;
          });

          cell.textContent = entry ? entry.mon_value : "";
          row.appendChild(cell);
        }

        table.appendChild(row);
      }
    }

    container.appendChild(table);

  } catch (err) {
    container.innerHTML = `<p style="color: red;">Error loading role grid: ${err.message}</p>`;
    console.error(err);
  }
}
