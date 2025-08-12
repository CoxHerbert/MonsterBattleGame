export function enterFullscreen(elem) {
  if (elem.requestFullscreen) elem.requestFullscreen();
}
export function exitFullscreen() {
  if (document.exitFullscreen) document.exitFullscreen();
}
export function toggleFullscreen(elem) {
  if (document.fullscreenElement) exitFullscreen();
  else enterFullscreen(elem);
}
