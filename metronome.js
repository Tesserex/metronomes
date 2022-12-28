// add a canvas to the body of the html page
var canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// get the context and set the width and height
var ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;

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

var bounds = { x: canvas.width / 2, y: canvas.height / 2, radius: canvas.width / 2 };

var pitchCents = 50;
var ballCount = 64;
var balls = [];
for (var i = 0; i < ballCount; i++) {
  balls.push({
    x: bounds.x,
    y: bounds.y,
    speed: 500 * i / ballCount,
    theta: Math.PI * 2 * i / ballCount,
    pitch: 110 * Math.pow(2, i * pitchCents / 1200),
  });
}

var lastTime = 0;

function draw(timestamp) {
  var dt = timestamp - lastTime;
  lastTime = timestamp;

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
    // if (i > 0) {
    //   ctx.beginPath();
    //   ctx.moveTo(balls[i - 1].x, balls[i - 1].y);
    //   ctx.lineTo(ball.x, ball.y);
    //   ctx.lineWidth = 1;
    //   ctx.strokeStyle = '#000000';
    //   ctx.stroke();
    // }

    ball.x += ball.speed * Math.cos(ball.theta) * dt / 1000;
    ball.y += ball.speed * Math.sin(ball.theta) * dt / 1000;

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
      
      playNote(ball.pitch, 0.1);
    }
  }

  requestAnimationFrame(draw);
}

// add a button to the page
var button = document.createElement('button');
button.innerHTML = 'Start';
document.body.appendChild(button);
// when the button is clicked, play a note
button.addEventListener('click', function() {
  lastTime = performance.now();
  requestAnimationFrame(draw);
});