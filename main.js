"use strict";

// Trigger the confirmation popup when user tries to close the page
window.onbeforeunload = () => {return 1;}

// querySelector shorthand like jQuery has
// Inspired by https://stackoverflow.com/q/6398787
function $(element) {
  return document.querySelector(element);
}

// Game parameters
let tickSpeed = 1000; // ms per factory run
const updateSpeed = 50; // ms per main counter update
// How big can a number get before switching to scientific notation?
const sciThreshold = 1000000;
// How many factories get generated?
const maxFactoryLevel = 16;

// Numbers that need to be tracked globally
let scuffs = 0;
let scuffIncAmount = 1;

let numAuto = [0];
let autoCost = [10];

// Update a DOM element using a variable - default to the main counter
function updateCounter(counter = $("#scuffCtr"), num = scuffs) {
  // Scientific (e) notation
  if (num >= sciThreshold)
    counter.textContent = numeral(num).format("0.000e+0");
  // Commas and 1 decimal place (main counter only)
  else if (num === scuffs) counter.textContent = numeral(num).format("0,0.0");
  // Commas and whole
  else counter.textContent = numeral(num).format("0,0");
}

// Tries to deduct cost from scuffs, returning whether it succeeded.
function spend(cost) {
  if (scuffs < cost) {
    return false;
  } else {
    scuffs -= cost;
    return true;
  }
}

// Programmatically generate the factories! I'm proud of this.
for (let idx = 1; idx < maxFactoryLevel; idx++) {
  // Number given to this factory
  let num = idx + 1;
  // Button's <label>
  let lbl = document.createElement("label");
  lbl.innerHTML = `${num}. Auto-Scuffer Factory<sup>${idx}</sup> (<span id="auto${num}Ctr">0</span>): `;
  // The <button>
  let btn = document.createElement("button");
  btn.id = `auto${num}Btn`;
  btn.type = "button";
  // Determine cost and format it right
  let formattedCost =
    10 ** num >= sciThreshold
      ? numeral(10 ** num).format("0e+0")
      : numeral(10 ** num).format("0,0");

  btn.innerHTML = `Buy (<span id="auto${num}Cost">${formattedCost}</span> scuffs)`;
  lbl.appendChild(btn);
  $("#upgrades").appendChild(lbl);
  // Populate numAuto and autoCost for this factory
  numAuto[idx] = 0;
  autoCost[idx] = 10 ** num;
}
/* The above loop generates this HTML for index 7:
<label>8. Auto-Scuffer Factory<sup>7</sup> (<span id="auto8Ctr">0</span>):
    <button id="auto8Btn" type="button">
        Buy (<span id="auto8Cost">1e+8</span> scuffs)
    </button>
</label>
*/

// -- Button actions --

$("#scuffBtn").addEventListener("click", () => {
  scuffs += scuffIncAmount;
  updateCounter();
});

// For each button of the generated factories:
// (I'm actually surprised this works)
for (let idx = 0; idx < maxFactoryLevel; idx++) {
  const num = idx + 1; // Factory's number
  // Set the button to do this:
  $(`#auto${num}Btn`).addEventListener("click", () => {
    // (Try to) spend its cost
    if (spend(autoCost[idx])) {
      numAuto[idx]++; // Add a factory
      autoCost[idx] *= 1.1; // Increase cost by 10%
      // Update immediately relevant counters (this one's cost and num)
      updateCounter($(`#auto${num}Cost`), autoCost[idx]);
      updateCounter($(`#auto${num}Ctr`), numAuto[idx]);
    }
  });
}

// Run the factories and update less important counters
const runFactories = setInterval(() => {
  // For each factory level:
  numAuto.forEach((num, idx) => {
    // (except the last one)
    if (idx < maxFactoryLevel - 1) {
      // Gain factories equal to the number of higher factories owned
      numAuto[idx] += numAuto[idx + 1];
    }
    // Update the counter for this factory level
    updateCounter($(`#auto${idx + 1}Ctr`), numAuto[idx]);
  });
  // Update the scuffs/sec counter
  updateCounter($("#spsCtr"), numAuto[0]);
}, tickSpeed);

// Add scuffs and update the main counter
const scuffCounterLoop = setInterval(() => {
  scuffs += (numAuto[0] / 1000) * updateSpeed;
  updateCounter();
}, updateSpeed);
