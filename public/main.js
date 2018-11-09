'use strict';

//Helper function 
function $(id) {
  return document.getElementById(id);
}

let socket = io('http://localhost:3000');

// Getting the html elements
let canvas = document.getElementsByClassName('drawboard')[0];
let context = canvas.getContext('2d');
let timeline = $('info');
let header = $('header');

// Helper functions to increment or decrement the value of the counter
function count() {
  count.id++;
}

function uncount() {
  count.id--;
}

count.id = 0;

// The on connect event declaration
socket.on('connect', () => {
  count();
  console.log(count.id)
  let userName = document.createElement('li');
  userName.innerHTML = `You are ${socket.id} and the number of active users is: ${count.id}`;
  header.appendChild(userName);
  let tl = document.createElement('li');
  tl.innerHTML = `Usuario ${socket.id} se acaba de unir`;
  timeline.appendChild(tl);
  onColorUpdate();
});

// Event that triggers when a user is disconnected
socket.on('disconnected', (user) => {
  uncount();
  let gone = document.createElement('li');
  gone.innerHTML = `${user} se ha desconectado`;
  let notify = document.createElement('li');
  notify.innerHTML = `number of active users is: ${count.id}`
  timeline.appendChild(gone);
  header.appendChild(notify);
  console.log(count.id);
});

// If the window is closed, the disconnected event is called
window.onunload = () => {
  socket.emit('disconnected', (socket.id));
}

// Color selection
let colors = ['maroon', 'black', 'red', 'blue', 'green', 'purple', 'orange', 'yellow', 'lime', 'aqua', 'teal', 'silver', 'magenta'];

let current = {
  color: colors[0]
};

// Helper function for color choosing
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function for update the current color of the brush 
function onColorUpdate() {
  let n = getRandomInt(0, 5);
  current.color = colors[n];
}

// Declaring the drawing variable
let drawing = false;

// Adding the basic event listeners for the drawing funcionality
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

// When a user draws on the canvas, do the onDrawingEvent function
socket.on('drawing', onDrawingEvent);

function onDrawingEvent(data) {
  var w = canvas.width;
  var h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

function drawLine(x0, y0, x1, y1, color, emit) {
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();
  context.closePath();

  if (!emit) {
    return;
  } // If there is not a emit call then return the event object
  var w = canvas.width; //1366
  var h = canvas.height; //458

  socket.emit('drawing', {
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color
  });
}

function onMouseDown(e) {
  drawing = true;
  current.x = e.clientX;
  current.y = e.clientY;
}

function onMouseUp(e) {
  if (!drawing) {
    return;
  }
  drawing = false;
  drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
}

function onMouseMove(e) {
  if (!drawing) {
    return;
  }
  drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
  current.x = e.clientX;
  current.y = e.clientY;
}

// limit the number of events per second
function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function () {
    var time = new Date().getTime();

    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

// Adding a listener when a resize of a screen happens
window.addEventListener('resize', onResize, false);
onResize();

// make the canvas fill its parent
function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}