function downloadMinified() {
    const input = document.getElementById("jsonInput");
    const file = input.files[0];
  
    if (!file) {
      alert("Please select a JSON file first.");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const raw = e.target.result;
      const data = JSON.parse(raw);
      const minified = {};
  
      let i = 0;
      const startTime = Date.now();
  
      for (const mon_id in data) {
        const mon = data[mon_id];
        const entry = {
          mon_isshiny: mon.mon_isshiny,
          mon_cp: mon.mon_cp,
          mon_name: mon.mon_name,
          mon_number: mon.mon_number,
          mon_islucky: mon.mon_islucky,
        };
  
        if (mon.mon_form) entry.mon_form = mon.mon_form;
        if (mon.mon_costume) entry.mon_costume = mon.mon_costume;
        if (mon.mon_alignment) entry.mon_alignment = mon.mon_alignment;
        if (mon.is_traded) entry.is_traded = mon.is_traded;
  
        minified[mon_id] = entry;
  
        if (i % 3000 === 0) {
          const now = Date.now();
          console.log(i, (now - startTime) / 1000 + "s since start");
        }
        i++;
      }
  
      const blob = new Blob([JSON.stringify(minified, null, 2)], {
        type: "application/json",
      });
  
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".json", "-min.json");
      a.click();
      URL.revokeObjectURL(url);
    };
  
    reader.readAsText(file);
  }