function openProcedure() {
  document.getElementById("procedure").style.display = "flex";
}

function closeProcedure() {
  document.getElementById("procedure").style.display = "none";
}
function resetExperiment() {
  window.location.reload();
}



let heading = document.getElementById('heading');
let svgContainer = document.querySelector('.svg-container');
let pointer = document.querySelector('.pointer')
function display2d() {
  heading.innerText = '2D view'
  svgContainer.innerHTML = `        <div class="svg-base">
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1920 1080">
  <!-- Generator: Adobe Illustrator 29.1.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 142)  -->
  <defs>
    <style>
      .st0 {
        fill: #fff;
        stroke: #000;
        stroke-miterlimit: 10;
      }
    </style>
  </defs>
  <path class="st0" d="M2081.5,316.5"/>
  <image id='baseimage'width="1606" height="823" transform="translate(166.5 147)" xlink:href="base1-1.png"/>
</svg></div>
<div class="pointer">
        <?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1920 1080">
  <!-- Generator: Adobe Illustrator 29.1.0, SVG Export Plug-In . SVG Version: 2.1.0 Build 142)  -->
  <defs>
    <style>
      .st0 {
        fill: #fff;
        stroke: #000;
        stroke-miterlimit: 10;
      }
    </style>
  </defs>
  <path class="st0" d="M2081.5,316.5"/>
  <g>
    <image width="513" height="413" transform="translate(764.4 149)" xlink:href="pointer-1.png"/>
    <image width="512" height="123" transform="translate(764.9 27.9)" xlink:href="pointer-2.png"/>
  </g>
</svg>
</div>`
  setTimeout(initGraph, 0);

}

//graph code 
let canvas, ctx;

function initGraph() {
  canvas = document.getElementById("miniGraph");
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  drawBaseGraph();
}

const origin = { x: 40, y: 190 };
const gWidth = 160;
const gHeight = 140;

let loadProgress = 0;
let unloadProgress = 0;
let peakPoint = null;
let loadingPoints = [];
let unloadingPoints = [];

function drawBaseGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;

  // X axis
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(origin.x + gWidth, origin.y);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(origin.x, origin.y - gHeight);
  ctx.stroke();

  ctx.font = "10px Segoe UI";
  ctx.fillStyle = "#000";

  ctx.fillText("Displacement, h", origin.x + 40, origin.y + 20);

  ctx.save();
  ctx.translate(origin.x - 25, origin.y - 80);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Lo a d , P", 0, 0);
  ctx.restore();

  ctx.fillText("Contact Point", origin.x - 10, origin.y + 35);
}

//graph code 





function movedown() {
  const pointer = document.querySelector('.pointer');
  if (!pointer) return;

  pointer.style.transform = "translateY(85px)";
  drawLoadingCurve();

}

let pointerY = 0;

function moveup(newSrc) {
  const pointer = document.querySelector('.pointer');
  if (!pointer) return;

  pointerY -= 5;
  pointer.style.transition = "transform 0.6s linear";
  pointer.style.transform = `translateY(${pointerY}px)`;

  const img = document.getElementById("baseimage");
  if (!img) return;

  // Change SVG image correctly
  img.setAttribute("href", newSrc);
  img.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    newSrc
  );
  drawUnloadingCurve();

}



function drawLoadingCurve() {
  if (loadProgress >= 1) return;

  const interval = setInterval(() => {
    drawBaseGraph();

    ctx.strokeStyle = "#c1121f";
    ctx.lineWidth = 2;
    ctx.beginPath();

    loadingPoints = [];

    for (let t = 0; t <= loadProgress; t += 0.02) {
      const x = origin.x + gWidth * t;
      const y = origin.y - gHeight * Math.pow(t, 1.8);

      loadingPoints.push({ x, y });

      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
    loadProgress += 0.02;

    if (loadProgress >= 1) {
      peakPoint = loadingPoints[loadingPoints.length - 1];
      clearInterval(interval);
    }
  }, 95); // slow & smooth (loading)
}

function drawUnloadingCurve() {
  if (!peakPoint || unloadProgress >= 1) return;

  const interval = setInterval(() => {
    drawBaseGraph();

    // redraw loading curve
    ctx.strokeStyle = "#c1121f";
    ctx.beginPath();
    loadingPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // unloading curve
    ctx.beginPath();
    unloadingPoints = [];

    for (let t = 0; t <= unloadProgress; t += 0.02) {
      const x = peakPoint.x - gWidth * 0.35 * t;

      // 🔥 This guarantees the declination meets X-axis
      const y = peakPoint.y + (origin.y - peakPoint.y) * t;

      unloadingPoints.push({ x, y });

      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    if (unloadProgress >= 1) {
      ctx.lineTo(
        peakPoint.x - gWidth * 0.35,
        origin.y
      );
    }

    ctx.stroke();


    // 🔵 draw slope S (tangent)
    drawSlopeS();

    ctx.fillStyle = "#000";
    ctx.fillText(
      "Max Depth, Max Load",
      peakPoint.x - 70,
      peakPoint.y - 10
    );


    unloadProgress += 0.05; // faster than loading

    if (unloadProgress >= 1) {
  unloadProgress = 1;   // clamp

  // 🔴 FINAL FORCED DRAW
  drawBaseGraph();

  // redraw loading curve
  ctx.strokeStyle = "#c1121f";
  ctx.beginPath();
  loadingPoints.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  // 🔵 FINAL unloading curve TOUCHING X AXIS
  ctx.beginPath();
  ctx.moveTo(peakPoint.x, peakPoint.y);
  ctx.lineTo(
    peakPoint.x - gWidth * 0.35,
    origin.y   // 🔥 EXACT X-AXIS
  );
  ctx.stroke();

  clearInterval(interval);
}

  }, 30);
}


function drawSlopeS() {
  if (unloadingPoints.length < 2) return;

  // Use first two points near the peak
  const p0 = unloadingPoints[0];
  const p1 = unloadingPoints[1];

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;

  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;

  const L = 70; // visible length of slope line

  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(p0.x - ux * L, p0.y - uy * L);
  ctx.lineTo(p0.x + ux * L, p0.y + uy * L);
  ctx.stroke();

  ctx.setLineDash([]);

  // Label S
  ctx.fillStyle = "#2563eb";
  ctx.fillText("S", p0.x + ux * 15, p0.y + uy * 15);
}


function display3d() {
  svgContainer.innerHTML = `
    <div class="display3dview">
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 612 792"
        preserveAspectRatio="xMidYMid meet"
        class="responsive-svg"
      >
        <g id="Layer_1">
          <image width="1591" height="1555"
            transform="translate(115.1 276.7) scale(.2)"
            xlink:href="nano indentation-1.png"/>
          <image width="629" height="984"
            transform="translate(201.4 172.9) scale(.2)"
            xlink:href="nano indentation-2.png"/>
          <image width="469" height="1184"
            transform="translate(196.5 181.9) scale(.2)"
            xlink:href="nano indentation-3.png"/>
        </g>
      </svg>
    </div>
  `;
  heading.innerText = '3-Dimentional view'
}






















function showformula() {
  document.getElementById("formulaModal").style.display = "flex";
}

function closeFormula() {
  document.getElementById("formulaModal").style.display = "none";
}
