let audio;
let fft;

let resolution = 120;

function preload() {
  audio = loadSound('probe.mp3'); 
}

function setup() {
  const canvas = createCanvas(950, 950, WEBGL);
  canvas.id('p5canvas');

  const plane = document.querySelector('#p5-plane');
  if (plane) {
    plane.setAttribute(
      'material',
      'shader: flat; src: #p5canvas; transparent: true'
    );
  }

  angleMode(RADIANS);
  frameRate(60);

  stroke(0);
  strokeWeight(1.5);
  noFill();

  fft = new p5.FFT();
  fft.setInput(audio);

  audio.loop();
}

function draw() {
  // --- keep A-Frame texture updating ---
  const canvas = document.getElementById('p5canvas');
  if (canvas) {
    const plane = document.querySelector('#p5-plane');
    if (plane && plane.object3D && plane.object3D.children.length > 0) {
      const mesh = plane.object3D.children[0];
      if (mesh.material.map) {
        mesh.material.map.needsUpdate = true;
      }
    }
  }

  // --- translucent fade (same feel as vortex sketch) ---
  noStroke();
  fill(255, 10);
  rect(-width / 2, -height / 2, width, height);

  // --- vortex rotation ---
  rotateZ(frameCount * 0.003);

  let spectrum = fft.analyze();

  stroke(0);
  strokeWeight(1.5);
  noFill();

  beginShape(POINTS);

  for (let r = 5; r < resolution; r++) {
    let radius = r * 3.2;

    for (let a = 0; a < 360; a += 1) {
      let angle = radians(a);

      let idx = r % spectrum.length;
      let ampVal = spectrum[idx];

      // audio-based outward push
      let audioWarp = map(ampVal, 0, 255, 0, 180);

      // 3D noise warp
      let n = noise(
        r * 0.03,
        a * 0.01,
        frameCount * 0.01
      );
      let noiseWarp = map(n, 0, 1, -90, 500);

      // spiral twist
      let twist = noise(r * 0.02, frameCount * 0.01) * 2.5;

      let finalR = radius + noiseWarp + audioWarp;

      let x = finalR * cos(angle + twist);
      let y = finalR * sin(angle + twist);
      let z = noiseWarp * 1.2;

      vertex(x, y, z);
    }
  }

  endShape();
}
