let song;
let slider;
let fft;
let color1;
let color2;
let spectrum;
let visualizerType = 0;
let visualizer;
let colorScheme = 0;
let touchStartX;
let touchStartY;
let playOnLoad = false;
let totalVisualizers = 3;

let centerMessage;
let musicFile = 'assets/solstitium.mp3';
// TODO: Allow for more mp3 options
function preload() {
  soundFormats('mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  frameRate(12);
  noStroke();

  fft = new p5.FFT(0.8, 64);
  song = loadSound(musicFile, playSongIfLoading, null, drawLoadingCircle);
  centerMessage = select('#center-message');
  centerMessage.show();

  slider = createSlider(0, 1, 0, 0.01);
  slider.position(0, height - 20);
  styleSlider()
  slider.input(onSliderInput);

  visualizer = visualizer0;
}

function draw() {
  if (song.isLoaded()) {
    // background(0);
    const currentTime = song.currentTime();
    const duration = song.duration();
    slider.value(currentTime / duration);
  
    spectrum = fft.analyze();
    let bass = fft.getEnergy('bass');
    let treble = fft.getEnergy('treble');

    if (colorScheme === 0) {
      // pink to cyan
      color1 = color(map(bass, 0, 255, 30, 210), 80, 100);
      color2 = color(map(treble, 0, 255, 30, 210), 20, 100);
    } else if (colorScheme === 1) {
      // yellow to blue
      color1 = color(map(bass, 0, 255, 0, 255), 100, 100);
      color2 = color(map(treble, 0, 255, 0, 100), 100, 100);
    } else if (colorScheme === 2) {
      // Purple to cyan
      color1 = color(map(bass, 0, 255, 300, 180), 100, 100);
      color2 = color(map(treble, 0, 255, 300, 180), 100, 100);
    }

    // Render the selected visualizer type
    if (visualizerType === 0) {
      visualizer = visualizer0;
    } else if (visualizerType === 1) {
      visualizer = visualizer1;
    } else if (visualizerType === 2) {
      visualizer = visualizer2;
    }
    visualizer();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
  // Make sure slider stays on bottom of the screen
  if (slider) {
    slider.position(0, height - 20);
  }
}

function keyPressed() {
  if (keyCode === 32) {
    togglePlay();
  } else if (keyCode === RIGHT_ARROW) {
    background(0);
    visualizerType = (visualizerType + 1) % totalVisualizers;
  } else if (keyCode === LEFT_ARROW) {
    background(0);
    visualizerType = (visualizerType - 1 + totalVisualizers) % totalVisualizers;
  } else if (keyCode === UP_ARROW) {
    colorScheme = (colorScheme + 1) % 3;
  } else if (keyCode === DOWN_ARROW) {
    colorScheme = (colorScheme - 1 + 3) % 3;
  }
}

function togglePlay() {
  if (song.isPlaying() || playOnLoad) {
    playOnLoad = false;
    centerMessage.html('Tap to Start <br/>⟵ Styles ⟶<br/>↑  Colors  ↓')
    if (song.isLoaded()) {
      song.pause();
      centerMessage.show();
    }
  } else if ((song.isLoaded())) {
    song.play();
    centerMessage.hide();
  } else {
    playOnLoad = true;
    centerMessage.html('Loading...');
  }
}

function playSongIfLoading() {
  if (playOnLoad) {
    togglePlay();
  }
}

function onSliderInput() {
  if (song.isLoaded()) {
    let val = slider.value();
    const duration = song.duration();
    song.jump(duration * val);
  }
}

// Visualizes smooth concentric circles with varying gradient fill
function visualizer0() {
  if (song.isLoaded()) {
    background(0);
    let numCircles = 4;
    let maxRadius = min(width, height) / 2.5;
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;

    let bass = fft.getEnergy('bass');
    let treble = fft.getEnergy('treble');

    let bassScaled = map(bass, 0, 255, 0, maxRadius);
    let trebleScaled = map(treble, 0, 255, 0, maxRadius);

    let bgLerpAmount = map(bass, 0, 255, 0, 1);
    let bgColor = lerpColor(color1, color2, bgLerpAmount);
    bgColor.setAlpha(0.2); // Set the alpha value for a darker background
    background(bgColor);

    // Draw an inner circle that changes size and color based on treble
    let innerCircleRadius = map(treble, 0, 255, 35, maxRadius / 2);
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
}

// Visualizes colorful rectangular blocks
function visualizer1() {
  background(lerpColor(color2, color(0), 100));
  let numRows = 5;
  let numCols = 3;
  let w = width / numCols;
  let h = height / numRows;
  strokeWeight(3);

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

// Draw radial lines with gradient colors
function visualizer2() {
  background(0);
  let numLines = 200;
  let step = 360 / numLines
  let maxRadius = min(width, height) * 0.8;

  for (let angle = 0; angle < (numLines * step); angle += step) {
    let index = floor(map(angle, 0, numLines * step, 0, spectrum.length));
    let scaledValue = map(spectrum[index], 0, 255, 0, maxRadius);
    
    let x1 = width / 2;
    let y1 = height / 2;
    let x2 = width / 2 + scaledValue * cos(radians(angle - 45));
    let y2 = height / 2 + scaledValue * sin(radians(angle - 45));

    let col = lerpColor(color1, color2, angle / (numLines * step));

    stroke(col);
    strokeWeight(2);
    line(x1, y1, x2, y2);
  }
}

function touchStarted() {
  // Ignore touches on the slider
  let sliderRect = slider.elt.getBoundingClientRect();
  if (mouseY < sliderRect.top) {
    touchStartX = mouseX;
    touchStartY = mouseY;
  } else {
    touchStartX = null;
    touchStartY = null;
  }
}

function touchEnded() {
  const touchThreshold = 100;
  // Only handle touch events outside the slider area
  if (touchStartX !== null && touchStartY !== null) {
    let deltaX = mouseX - touchStartX;
    let deltaY = mouseY - touchStartY;
    // Detect swipe right
    if (deltaX > touchThreshold && abs(deltaY) < touchThreshold) {
      background(0);
      visualizerType = (visualizerType + 1) % totalVisualizers;
    }

    // Detect swipe left
    if (deltaX < -touchThreshold && abs(deltaY) < touchThreshold) {
      background(0);
      visualizerType = (visualizerType - 1 + totalVisualizers) % totalVisualizers;
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
  let sliderRect = slider.elt.getBoundingClientRect();
  // Check if the click is outside the slider area
  if (mouseY < height - 3 * (sliderRect.x + sliderRect.height)) {
    togglePlay();
  }
}

function drawLoadingCircle(loadedFraction) {
  let centerX = width / 2;
  let centerY = height / 2;
  let radius = 100;
  const numSegments = 10;

  background(0);
  noFill();
  strokeWeight(10);

  for (let i = 0; i < numSegments; i++) {
    let angle = map(i, 0, numSegments, 0, TWO_PI);
    let x1 = centerX + radius * cos(angle);
    let y1 = centerY + radius * sin(angle);
    let x2 = centerX + radius * cos(angle + TWO_PI / numSegments);
    let y2 = centerY + radius * sin(angle + TWO_PI / numSegments);

    col1 = color(100, 100, 100);
    col2 = color(255, 255, 255);
    let col = lerpColor(col1, col2, i / numSegments);
    stroke(col);

    if (i / numSegments < loadedFraction) {
      line(x1, y1, x2, y2);
    }
  }
}

function styleSlider() {
  slider.style('width', '98%');
  slider.style('height', '6px');
  slider.style('padding-left', '1%');
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
