const fileInput = document.getElementById("fileInput");
const dashboard = document.getElementById("dashboard");

let charts = [];

fileInput.addEventListener("change", handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  if(!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: results => {
      const data = results.data;
      generateDashboard(data);
    }
  });
}

function generateDashboard(data){
  dashboard.innerHTML = "";  // clear old charts
  if(charts.length){
    charts.forEach(c=>c.destroy());
    charts=[];
  }

  const columns = Object.keys(data[0]);

  columns.forEach(col => {
    const values = data.map(r => r[col]);

    // Determine type: numeric or categorical
    let isNumeric = values.every(v => !isNaN(parseFloat(v)) && v!=="");
    
    const chartDiv = document.createElement("div");
    chartDiv.className = "chart-card";
    const h2 = document.createElement("h2");
    h2.textContent = col;
    const canvas = document.createElement("canvas");
    chartDiv.appendChild(h2);
    chartDiv.appendChild(canvas);
    dashboard.appendChild(chartDiv);

    if(isNumeric){
      const nums = values.map(v => parseFloat(v));
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx,{
        type: "line",
        data:{
          labels: data.map((_,i)=>i+1),
          datasets:[{
            label: col,
            data: nums,
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            fill:true
          }]
        },
        options:{responsive:true}
      });
      charts.push(chart);
    } else {
      // categorical -> count frequencies
      const freq = {};
      values.forEach(v=>{ freq[v]=(freq[v]||0)+1; });
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx,{
        type: "bar",
        data:{
          labels: Object.keys(freq),
          datasets:[{
            label: col,
            data: Object.values(freq),
            backgroundColor:"rgba(153,102,255,0.6)"
          }]
        },
        options:{responsive:true}
      });
      charts.push(chart);
    }
  });
}
