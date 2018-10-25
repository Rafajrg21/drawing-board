'use strict';

//(function() {
function $(id) {
    return document.getElementById(id);
}

let socket = io('http://localhost:3000');

let canvas = document.getElementsByClassName('drawboard')[0];
let users = $('info');
let header = $('header');
let context = canvas.getContext('2d');

socket.on('hello', ()=>{
    let lo = document.createElement('li');
    let li = document.createElement('li');
    lo.innerHTML=`${socket.id}`;
    li.innerHTML=`Usuario ${socket.id} se acaba de unir`;
    header.appendChild(lo);
    users.appendChild(li);
    onColorUpdate();
});

socket.on('disconnected',() => {
    let li = document.createElement('li');
    li.innerHTML=`${socket.id} se ha desconectado`;
    users.appendChild(li);
});

let colors = ['black', 'red', 'blue', 'green', 'purple', 'orange'];

  let current = {
    color: colors[0]
  };
  let drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  socket.on('drawing', onDrawingEvent);

  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
  }

  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function onColorUpdate(){
    let n = getRandomInt(0,5);
    current.color = colors[n];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

//})();

