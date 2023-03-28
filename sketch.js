let song;
let slider;
let fft;
let color1;
let color2;
let spectrum;
let visualizerType = 0;
let visualizers;
let colorScheme = 0;
let touchStartX;
let touchStartY;
let touchThreshold = 50;

let centerMessage;
let musicFile = 'Solstitium.mp3';

function preload() {
  song = loadSound(musicFile, () => {
    console.log('Song loaded');
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  noStroke();

  fft = new p5.FFT();
  slider = createSlider(0, 1, 0, 0.01);
  slider.position(0, height - 20);
  styleSlider()
  slider.input(onSliderInput);

  centerMessage = select('#center-message');
  centerMessage.show();

  function onSliderInput() {
    if (song.isLoaded()) {
      const val = slider.value();
      const duration = song.duration();
      song.jump(duration * val);
    }
  }

  function keyPressed() {
    if (keyCode === 32) {
      togglePlay();
    } else if (keyCode === RIGHT_ARROW) {
      visualizerType = (visualizerType + 1) % visualizers.length;
    } else if (keyCode === LEFT_ARROW) {
      visualizerType = (visualizerType - 1 + visualizers.length) % visualizers.length;
    } else if (keyCode === UP_ARROW) {
      colorScheme = (colorScheme + 1) % 3;
    } else if (keyCode === DOWN_ARROW) {
      colorScheme = (colorScheme - 1 + 3) % 3;
    }
  }

  window.keyPressed = keyPressed;
  // Add more visualizers to the array as needed
  visualizers = [visualizer1, visualizer2, visualizer3]; 
}

function draw() {
  background(0);
  if (song.isLoaded()) {
    const currentTime = song.currentTime();
    const duration = song.duration();
    slider.value(currentTime / duration);
  }
  spectrum = fft.analyze();
  let bass = fft.getEnergy('bass');
  let treble = fft.getEnergy('treble');

  if (colorScheme === 0) {
    color1 = color(map(bass, 0, 255, 0, 255), 100, 100);
    color2 = color(map(treble, 0, 255, 0, 255), 100, 100);
  } else if (colorScheme === 1) {
    // Red to green, orange to blue
    color1 = color(map(bass, 0, 255, 0, 120), 100, 100);
    color2 = color(map(treble, 0, 255, 30, 210), 100, 100);
  } else if (colorScheme === 2) {
    // Pink to cyan
    color1 = color(map(bass, 0, 255, 300, 180), 100, 100);
    color2 = color(map(treble, 0, 255, 300, 180), 100, 100);
  }
  // Render the selected visualizer type
  visualizers[visualizerType]();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Make sure slider stays on bottom of the screen
  if (slider){
    slider.position(0, height - 20);
  }
}

function togglePlay() {
  if (song.isPlaying()) {
    song.pause();
    centerMessage.show();
  } else {
    song.play();
    centerMessage.hide();
  }
}

// Visualizes colorful rectangular blocks
function visualizer1() {
  let numRows = 10;
  let numCols = 10;
  let w = width / numCols;
  let h = height / numRows;

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      let x = j * w;
      let y = i * h;

      let col = lerpColor(color1, color2, (i * numCols + j) / (numRows * numCols - 1));
      fill(col);
      rect(x, y, w, h);
    }
  }
}

// Visualizes smooth concentric circles with varying gradient fill
function visualizer2() {
  let numLines = 360;
  let maxRadius = min(width, height) * 0.8;

  // Draw radial lines with gradient colors
  for (let angle = 0; angle < numLines; angle++) {
    let index = floor(map(angle, 0, numLines, 0, spectrum.length));
    let scaledValue = map(spectrum[index], 0, 255, 0, maxRadius);
    
    let x1 = width / 2;
    let y1 = height / 2;
    let x2 = width / 2 + scaledValue * cos(radians(angle - 45));
    let y2 = height / 2 + scaledValue * sin(radians(angle - 45));

    let col = lerpColor(color1, color2, angle / numLines);

    stroke(col);
    strokeWeight(2);
    line(x1, y1, x2, y2);
  }
}

function visualizer3() {
  let numCircles = 10;
  let maxRadius = min(width, height) / 2;

  let bass = fft.getEnergy('bass');
  let treble = fft.getEnergy('treble');

  let bassScaled = map(bass, 0, 255, 0, maxRadius);
  let trebleScaled = map(treble, 0, 255, 0, maxRadius);

  let bgLerpAmount = map(bass, 0, 255, 0, 1);
  let bgColor = lerpColor(color1, color2, bgLerpAmount);
  bgColor.setAlpha(0.2); // Set the alpha value for a darker background
  background(bgColor);

  // Draw an inner circle that changes size and color based on treble
  let innerCircleRadius = map(treble, 0, 255, 20, maxRadius / 2);
  fill(color2);
  noStroke();
  ellipse(width / 2, height / 2, innerCircleRadius * 2, innerCircleRadius * 2);

  for (let i = 0; i < numCircles; i++) {
    let r = map(i, 0, numCircles - 1, bassScaled, trebleScaled);
    let col = lerpColor(color1, color2, i / (numCircles - 1));
    
    stroke(col);
    strokeWeight(2);
    noFill();
    ellipse(width / 2, height / 2, r * 2, r * 2);
  }
}

function touchStarted() {
  // Ignore touches on the slider
  let sliderRect = slider.elt.getBoundingClientRect();
  if (mouseY < sliderRect.top || mouseY > sliderRect.bottom) {
    touchStartX = mouseX;
    touchStartY = mouseY;
  } else {
    touchStartX = null;
    touchStartY = null;
  }
}

function touchEnded() {
  // Only handle touch events outside the slider area
  if (touchStartX !== null && touchStartY !== null) {
    let deltaX = mouseX - touchStartX;
    let deltaY = mouseY - touchStartY;
    // Detect swipe right
    if (deltaX > touchThreshold && abs(deltaY) < touchThreshold) {
      visualizerType = (visualizerType + 1) % visualizers.length;
    }

    // Detect swipe left
    if (deltaX < -touchThreshold && abs(deltaY) < touchThreshold) {
      visualizerType = (visualizerType - 1 + visualizers.length) % visualizers.length;
    }

    // Detect swipe up
    if (deltaY < -touchThreshold && abs(deltaX) < touchThreshold) {
      colorScheme = (colorScheme + 1) % 3;
    }

    // Detect swipe down
    if (deltaY > touchThreshold && abs(deltaX) < touchThreshold) {
      colorScheme = (colorScheme - 1 + 3) % 3;
    }
  }
}

function mouseClicked() {
  if (mouseY < height - 20) { // Check if the click is outside the slider area
    togglePlay();
  }
}

function styleSlider() {
  slider.style('width', '99%');
  slider.style('height', '6px');
  slider.style('appearance', 'none');
  slider.style('outline', 'none');
  slider.style('border', 'none');
  slider.style('border-radius', '3px');
  slider.style('background', 'rgba(255, 255, 255, 0.2)');
  slider.style('cursor', 'pointer');
  slider.style('transition', 'background 0.2s');
  slider.mouseOver(() => slider.style('background', 'rgba(255, 255, 255, 0.5)'));
  slider.mouseOut(() => slider.style('background', 'rgba(255, 255, 255, 0.2)'));
  slider.attribute('oninput', 'this.style.setProperty("--value", this.value);');
  slider.style('--value', '0');
  slider.style('--thumb-size', '15px');
  slider.style('--track-height', '6px');
  slider.style('--track-fill-color', 'rgba(255, 255, 255, 0.5)');
  slider.style('background-image', `
    linear-gradient(
      to right,
      var(--track-fill-color) 0%,
      var(--track-fill-color) calc(var(--value) * 100%),
      rgba(255, 255, 255, 0.2) calc(var(--value) * 100%),
      rgba(255, 255, 255, 0.2) 100%
    )
  `);
  slider.style('-webkit-slider-thumb', `
    width: var(--thumb-size);
    height: var(--thumb-size);
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    appearance: none;
    margin-top: calc(0px - (var(--thumb-size) - var(--track-height)) / 2);
  `);
  slider.style('-moz-range-thumb', `
    width: var(--thumb-size);
    height: var(--thumb-size);
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    appearance: none;
  `);
}