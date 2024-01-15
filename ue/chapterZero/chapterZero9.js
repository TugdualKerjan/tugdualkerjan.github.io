const chatBox = document.getElementById('chatBox');
let offsetX, offsetY;

chatBox.addEventListener('mousedown', function(e) {
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none'; // For Safari
  offsetX = e.clientX - chatBox.getBoundingClientRect().left;
  offsetY = e.clientY - chatBox.getBoundingClientRect().top;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
  chatBox.style.left = e.clientX - offsetX + 'px';
  chatBox.style.top = e.clientY - offsetY + 'px';
}

function onMouseUp() {
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}