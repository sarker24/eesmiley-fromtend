export default function playSound(src: string, onEnd?: () => void): void {
  try {
    const audio = document.createElement('audio');
    audio.style.display = 'none';
    audio.src = src;
    audio.autoplay = true;
    audio.onended = function () {
      if (onEnd) {
        onEnd();
      }
      audio.remove(); //Remove when played.
    };
    audio.onerror = audio.onended;
    document.body.appendChild(audio);
  } catch (e) {
    // Do nothing if audio element is not supported
  }
}
