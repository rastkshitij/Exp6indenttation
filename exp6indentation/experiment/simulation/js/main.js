function openProcedure() {
  document.getElementById("procedure").style.display = "flex";
}

function closeProcedure() {
  document.getElementById("procedure").style.display = "none";
}
function resetExperiment() {
  window.location.reload();
}



const CONTACT_Y = 60; // px → sample surface
let pointerState = "up"; 
// up | touching | leaving

let animPhase = "idle";
let animT = 0;
let holdStartTime = null;



let holdTime = 0;          // seconds (user input)
let holdProgress = 0;     // 0 → 1

//btn selector
let dis2dbtn = document.querySelector('#dis2d');
let indentbtn  = document.querySelector('#indent');
let dis3btn = document.querySelector("#display3d");
let formulabtn = document.querySelector('#formula');
let tableobs = document.querySelector('.parameter-block')
tableobs.style.display ='none';
let marker =0
let btnarray = [dis2dbtn ,indentbtn , dis3btn,formulabtn];
btnarray.forEach(element => {
  element.style.display ='none'
});

//array

let heading = document.getElementById('heading');
let svgContainer = document.querySelector('.svg-container');
let pointer = document.querySelector('.pointer')
function display2d() {
    const holdingtime = parseFloat(timeInput.value);
  setTimeout(() => {
    btnarray[marker].style.display='block';
  marker++;
    
}, 3000);
setTimeout(() => {
  document.querySelector('.graph').style.display ='block'
}, 1500);
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
  <image id='baseimage'width="1606" height="823" transform="translate(166.5 147)" data-text="Material : metals, ceramics, polymers, composites, and biological tissues" xlink:href="base1-1.png"/>
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
    <image width="513" height="413" transform="translate(764.4 149)"  data-text="Berkovich tip" xlink:href="pointer-1.png"/>
    <image width="512" height="123" transform="translate(764.9 27.9)" data-text="Berkovich tip" xlink:href="pointer-2.png"/>
  </g>
</svg>
</div>`
  setTimeout(initGraph, 0);

  setTimeout(() => {
  const images = svgContainer.querySelectorAll("svg image");
  const infoBox = document.getElementById("infoBox");

  console.log("Images found:", images.length);

  images.forEach(img => {
    img.addEventListener("mouseenter", () => {
      infoBox.style.display = "block";
      infoBox.textContent = img.getAttribute("data-text");
    });

    img.addEventListener("mouseleave", () => {
      infoBox.style.display = "none";
    });
  });
}, 0);

}


//graph code 
let canvas, ctx;
// ===================
  // loading | holding | unloading




let holdLength = 0;

//==================
function initGraph() {
  canvas = document.getElementById("miniGraph");
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  drawBaseGraph();
}

const origin = { x: 40, y: 190 };
const gWidth = 160;
const gHeight = 140;
let hmax = gWidth * 0.75;
let Pmax = gHeight * 0.85;
let hf   = gWidth * 0.18;

let holdDelayDone = false;

const loadSteps = 120;     // smoothness
const unloadSteps = 120;



let appliedForce = 0; // mN (user input)

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

 ctx.fillText(
  `Load = ${appliedForce} mN | Hold = ${holdTime}s`,
  origin.x - 5,
  origin.y + 35
);

}
function animateIndentationCurve(timestamp) {
  drawBaseGraph();

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();

  const loadExp = 2.0;
  const unloadExp = 1.5;

  /* ================= LOADING ================= */
  if (animPhase === "loading") {
    animT += 0.010;

    for (let i = 0; i <= animT * 100; i++) {
      const t = i / 100;
      const h = hmax * t;
      const P = Pmax * Math.pow(t, loadExp);
      ctx.lineTo(origin.x + h, origin.y - P);
    }
    ctx.stroke();

    if (animT < 1) {
      requestAnimationFrame(animateIndentationCurve);
    } else {
      animPhase = "holding";
      holdStartTime = performance.now(); // ✅ single hold timer
      requestAnimationFrame(animateIndentationCurve);
    }
    return;
  }

  /* ================= HOLDING ================= */
  if (animPhase === "holding") {
    // draw full loading
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      ctx.lineTo(
        origin.x + hmax * t,
        origin.y - Pmax * Math.pow(t, loadExp)
      );
    }

    // draw hold line
    ctx.lineTo(
      origin.x + hmax + holdLength,
      origin.y - Pmax
    );
    ctx.stroke();

    if (performance.now() - holdStartTime < holdTime * 1000) {
      requestAnimationFrame(animateIndentationCurve);
    } else {
      startUnloading(); // ✅ single transition
    }
    return;
  }

  /* ================= UNLOADING ================= */
  if (animPhase === "unloading") {
    animT += 0.015;

    // loading
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      ctx.lineTo(
        origin.x + hmax * t,
        origin.y - Pmax * Math.pow(t, loadExp)
      );
    }

    // holding
    ctx.lineTo(
      origin.x + hmax + holdLength,
      origin.y - Pmax
    );

    // unloading curve
    for (let i = 0; i <= animT * 100; i++) {
      const t = i / 100;
      const h = (1 - t) * hmax + t * hf;
      const P = Pmax * Math.pow((h - hf) / (hmax - hf), unloadExp);
      ctx.lineTo(origin.x + h + holdLength, origin.y - P);
    }

    ctx.stroke();

    if (animT < 1) {
      requestAnimationFrame(animateIndentationCurve);
    }
  }
}






function startUnloading() {
  if (pointerState !== "touching") return;

  pointerState = "leaving";
  animPhase = "unloading";
  animT = 0;

  const pointer = document.querySelector(".pointer");
  pointer.style.transition = "transform 0.8s linear";
  pointer.style.transform = "translateY(0px)";

  // 🟢 CONTACT BROKEN → CHANGE MATERIAL IMAGE
  const img = document.getElementById("baseimage");
  if (img) {
    img.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      "./base2-1.png"
    );
  }

  requestAnimationFrame(animateIndentationCurve);
}



//graph code 



function movedown() {
  const pointer = document.querySelector(".pointer");
  if (!pointer) return;

  pointerState = "touching";

  pointer.style.transition = "transform 2s linear";
  pointer.style.transform = `translateY(${CONTACT_Y}px)`;

  // ⏳ Wait until pointer actually reaches the sample
  setTimeout(() => {
    // 🟢 CONTACT MADE → START LOADING GRAPH
    animPhase = "loading";
    animT = 0;
    holdStartTime = null;

    holdLength = Math.min(holdTime * 8, gWidth * 0.2);
    requestAnimationFrame(animateIndentationCurve);
  }, 600); // same as pointer transition time
  setTimeout(() => {
    btnarray[marker].style.display ='block'
    marker++;
  }, 2500);
}


let pointerY = 0;

//




function autoMovePointerUp() {
  btnarray[marker].style.display='block';
marker++;
  const pointer = document.querySelector('.pointer');
  if (!pointer) return;

  // Move pointer up
  pointer.style.transition = "transform 1s linear";
  pointer.style.transform = "translateY(0px)";

  // 🔄 Auto change material image
  const img = document.getElementById("baseimage");
  if (img) {
    const newSrc = "./base2-1.png";

    img.setAttribute("href", newSrc);
    img.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      newSrc
    );
  }
animPhase = "unloading";
animT = 0;
requestAnimationFrame(animateIndentationCurve);

}



function display3d() {
setTimeout(() => {
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
            data-text ="Material:metals, ceramics, polymers, composites, and biological tissues"
            xlink:href="nano indentation-2.png"/>
            
          <image width="469" height="1184"
            transform="translate(196.5 181.9) scale(.2)"
            data-text ="Material:metals, ceramics, polymers, composites, and biological tissues"
            xlink:href="nano indentation-3.png"/>
        </g>
      </svg>
    </div>
  `;
}, 1500);
svgContainer.style.transition="1s ease all"
  heading.innerText = '3-Dimentional view'
  btnarray[marker].style.display='block';
marker++;
}






















function showformula() {
  document.getElementById("formulaModal").style.display = "flex";
}

function closeFormula() {
  document.getElementById("formulaModal").style.display = "none";
}

















document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("startupOverlay");
  const form = document.getElementById("startupForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const choice = document.querySelector(
      'input[name="choice"]:checked'
    ).value;

    if (choice === "youtube") {
      window.open("https://virtual-labs.github.io/exp-micro-scratching-iitk/", "_blank");
    }

    // Remove popup
    overlay.style.display = "none";
  });
});






























function textar() {
  document.getElementById("indentPanel").style.display = "block";
}

const forceInput = document.getElementById("forceInput");
const timeInput = document.getElementById("timeInput");
const submitBtn = document.getElementById("submitIndent");

function validateInputs() {
  const force = parseFloat(forceInput.value);
  const time = parseFloat(timeInput.value);

  if (force >= 0.1 && force <= 10 && time >= 0) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

// function submitIndent() {
//   console.log("Submitted Force:", forceInput.value, "mN");
//   console.log("Submitted Time:", timeInput.value, "s");

//   // Disable submit after click
//   submitBtn.disabled = true;


//   // later logic will go here
// }

function submitIndent() {
  holdTime = parseFloat(timeInput.value); // seconds
  appliedForce = parseFloat(forceInput.value); // mN

  submitBtn.disabled = true;
  btnarray[marker].style.display = 'block';
  marker++;
  tableobs.style.display = 'block';

  console.log("Force:", appliedForce, "mN");
  console.log("Holding Time:", holdTime, "min");
}


forceInput.addEventListener("input", validateInputs);
timeInput.addEventListener("input", validateInputs);


