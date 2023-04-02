// const numLeaves = 5;
// let leaves = [];
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
let playOnLoad = false;

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

  // for (let i = 0; i < numLeaves; i++) {
  //   leaves.push(new Leaf());
  // }
  // Add more visualizers to the array as needed
  visualizers = [visualizer1, visualizer2]; 
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
      color2 = color(map(treble, 0, 255, 0, 99), 80, 100);
    } else if (colorScheme === 2) {
      // Purple to cyan
      color1 = color(map(bass, 0, 255, 300, 180), 100, 100);
      color2 = color(map(treble, 0, 255, 300, 180), 100, 100);
    }
    // Render the selected visualizer type
    visualizers[visualizerType]();
  } else {
    visualizer1();
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
    visualizerType = (visualizerType + 1) % visualizers.length;
  } else if (keyCode === LEFT_ARROW) {
    background(0);
    visualizerType = (visualizerType - 1 + visualizers.length) % visualizers.length;
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
function visualizer1() {
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
const numRows = 5;
const numCols = 3;
function visualizer2() {
  background(lerpColor(color2, color(0), 100));
  // fill('red')
  let w = width / numCols;
  let h = height / numRows;
  // fill();
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
const numLines = 72;
const step = 360 / numLines
function visualizer3() {
  background(0);
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

// Draw falling leaves on the screen
function visualizer4() {
  drawingContext.shadowOffsetX = 3;
  drawingContext.shadowOffsetY = 3;
  drawingContext.shadowBlur = 6;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  for (let leaf of leaves) {
    leaf.update();
    leaf.display();
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
      visualizerType = (visualizerType + 1) % visualizers.length;
    }

    // Detect swipe left
    if (deltaX < -touchThreshold && abs(deltaY) < touchThreshold) {
      background(0);
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

// class Leaf {
//   constructor() {
//     this.x = random(30, width - 30);
//     this.size = random(30, 65);
//     this.y = height + this.size;
//     this.speed = random(1, 3);
//     this.angle = random(TWO_PI);
//     this.angleSpeed = random(-0.05, 0.05);
//   }

//   update() {
//     this.y -= this.speed;
//     this.angle -= this.angleSpeed;

//     // Reset the leaf's position when it goes off the screen
//     if (this.y < -this.size) {
//       this.x = random(width);
//       this.y = random(height);
//     }
//   }

//   display() {
//     push();
//     translate(this.x, this.y);
//     rotate(this.angle);
//     if (!color1 || !color2) {
//       color1 = color(100, 100, 100);
//       color2 = color(255, 255, 255);
//     }
//     fill(lerpColor(color1, color2, this.y / height));
//     noStroke();
//     ellipse(0, 0, this.size, this.size / 2);
//     pop();
//   }
// }
