let audio;
let amp;
let fft;


let capturer;
let recording = false;
let maxFrames = 60; // 10 seconds at 60 FPS

let resolution =70; // Sphere detail (lat/lon divisions)
function preload() {

  document.addEventListener("click", () => {
    const audio = new Audio("warnung1.mp3");
    audio.play();
});}

function setup() {
  const canvas = createCanvas(950, 950, WEBGL);
  canvas.id('p5canvas'); 
  const plane = document.querySelector('#p5-plane');
  if (plane) {
  plane.setAttribute('material', 'shader: flat; src: #p5canvas; transparent: true');
}
  
  angleMode(RADIANS);
  noStroke();
  


  fft = new p5.FFT();
  fft.setInput(audio);

  audio.loop();
  frameRate(60);
}


function draw() {
  
  // Make sure to update the texture in A-Frame every frame
const canvas = document.getElementById('p5canvas');
if (canvas) {
  // Get the A-Frame plane material and mark texture for update
  const plane = document.querySelector('#p5-plane');
  if (plane && plane.object3D && plane.object3D.children.length > 0) {
    const mesh = plane.object3D.children[0];
    if (mesh.material.map) {
      mesh.material.map.needsUpdate = true;
    }
  }
}


  fill(255, 10);
  // background(255, 0.5);
  rect(-width/2, -height/2, width, height);

  rotateY(frameCount * 0.01); // Spin the globe
  rotateX(PI / 10); // Tilt for better view

  let spectrum = fft.analyze();
  let waveform = fft.waveform();

  let baseRadius = 200;

  // Draw frequency-reactive particles on globe
  fill(0);
  for (let lat = 1; lat < resolution; lat++) {
    let theta = map(lat, 0, resolution, -HALF_PI, HALF_PI);
    for (let lon = 1; lon < resolution * 2; lon++) {
      let phi = map(lon, 0, resolution * 2, 0, TWO_PI);
      let idx = (lat * resolution + lon) % spectrum.length;
      let ampVal = spectrum[idx];

      
      let droop = map(ampVal, 0, 1000, 10, 80);
      let r = baseRadius + map(ampVal, 10, 340, 10, 350);
      let x = r * cos(theta) * cos(phi);
      let y = r * sin(theta) + droop;
      let z = r * cos(theta) * sin(phi);

      let alpha = map(droop, 0, 80, 255, 200);
      fill(255);

      push();
      translate(x, y, z);
      sphere(1.2); // small reactive dot
      pop();
    }
  }




}
