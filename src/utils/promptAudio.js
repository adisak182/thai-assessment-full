const prompts = new Set();
export const registerPromptAudio = audio => prompts.add(audio);
export const unregisterPromptAudio = audio => prompts.delete(audio);
export function pausePromptAudio() {
  for (const audio of prompts) {
    try {
      audio.pause();
      if (typeof audio.removeAttribute === 'function') {
        audio.removeAttribute('src');
      }
      if (typeof audio.load === 'function') {
        audio.load();
      }
    } catch {
      // ignore
    }
  }
}
