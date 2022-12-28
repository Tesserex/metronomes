var canvas = document.getElementById('canvas');

// get the context and set the width and height
var ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.width;

// create an audio context and lower the volume
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();
gainNode.gain.value = 0.1;
gainNode.connect(audioCtx.destination);

function playNote(frequency, duration) {
  // create Oscillator node
  var oscillator = audioCtx.createOscillator();

  oscillator.type = 'square';
  oscillator.frequency.value = frequency; // value in hertz
  oscillator.connect(gainNode);
  oscillator.start(0);
	oscillator.stop(audioCtx.currentTime + duration);
}

// grab all the form inputs
var ballCount = document.getElementById('ball-count');
var ballCountLabel = document.getElementById('ball-count-label');
var pitchOffset = document.getElementById('pitch-offset');
var pitchOffsetLabel = document.getElementById('pitch-offset-label');
var showLines = document.getElementById('chkShowLines');
var simSpeed = document.getElementById('sim-speed');
var simSpeedLabel = document.getElementById('sim-speed-label');
var simProgressBar = document.getElementById('sim-progress');

function updateSimSpeedLabel() {
  simSpeedLabel.innerHTML = `${simSpeed.value * 100}%`;
}

simSpeed.addEventListener('input', updateSimSpeedLabel);
updateSimSpeedLabel();

ballCount.addEventListener('input', () => ballCountLabel.innerHTML = ballCount.value);
pitchOffset.addEventListener('input', () => pitchOffsetLabel.innerHTML = pitchOffset.value);

var progress = 0;

function setProgress(val) {
  progress = val;
  if (progress > 1) {
    progress -= 1;
  }
  if (progress < 0) {
    progress += 1;
  }
  simProgressBar.style.width = `${progress*100}%`;
}

function addProgress(val) {
  setProgress(progress + val);
}

var bounds = { x: canvas.width / 2, y: canvas.height / 2, radius: canvas.width / 2 };

var balls = [];
var loopTime = 1;

var lastTimeMs = 0;
var running = false;

function initialize() {
  balls = [];
  for (var i = 0; i < ballCount.value; i++) {
    balls.push({
      x: bounds.x,
      y: bounds.y,
      speed: 500 * (i+1) / ballCount.value,
      theta: Math.PI * 2 * i / ballCount.value,
    });
  }

  loopTime = bounds.radius * 2 / balls[0].speed;
  setProgress(0);
}

function draw(timestamp) {
  var dt = (timestamp - lastTimeMs) * simSpeed.value / 1000;
  lastTimeMs = timestamp;

  addProgress(dt / loopTime);

  // fill the background white
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw a thick black bounding circle
  ctx.beginPath();
  ctx.arc(bounds.x, bounds.y, bounds.radius, 0, 2 * Math.PI, false);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000000';
  ctx.stroke();

  for (var i = 0; i < balls.length; i++) {
    var ball = balls[i];

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, 2 * Math.PI, false);
    // color the ball according to index
    ctx.fillStyle = 'hsl(' + (i * 360 / balls.length) + ', 100%, 50%)';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#003300';
    ctx.stroke();

    // draw a black line between this ball and the previous
    if (i > 0 && chkShowLines.checked) {
      ctx.beginPath();
      ctx.moveTo(balls[i - 1].x, balls[i - 1].y);
      ctx.lineTo(ball.x, ball.y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }

    ball.x += ball.speed * Math.cos(ball.theta) * dt;
    ball.y += ball.speed * Math.sin(ball.theta) * dt;

    // bounce the ball off the bounding circle
    var dx = ball.x - bounds.x;
    var dy = ball.y - bounds.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > bounds.radius) {
      var normalRadians = Math.atan2(dy, dx);
      ball.x = bounds.x + bounds.radius * Math.cos(normalRadians);
      ball.y = bounds.y + bounds.radius * Math.sin(normalRadians);
      
      // reflect the ball's angle off the normal
      ball.theta = 2 * normalRadians - ball.theta + Math.PI;

      // re-add the correction
      var correctionDistance = distance - bounds.radius;
      ball.x += correctionDistance * Math.cos(ball.theta);
      ball.y += correctionDistance * Math.sin(ball.theta);
      
      playNote(110 * Math.pow(2, i * pitchOffset.value / 1200), 0.1);
    }
  }

  if (running) {
    requestAnimationFrame(draw);
  }
}

const startBtn = document.getElementById('btn-start');
startBtn.addEventListener('click', function() {
  if (running) {
    running = false;
    startBtn.innerHTML = "Start";
  } else {
    lastTimeMs = performance.now();
    running = true;
    requestAnimationFrame(draw);
    startBtn.innerHTML = "Pause";
  }
});

document.getElementById('btn-reset').addEventListener('click', function() {
  initialize();
});

initialize();
