const prompts = new Set();
export const registerPromptAudio = audio => prompts.add(audio);
export const unregisterPromptAudio = audio => prompts.delete(audio);

export function pausePromptAudio() {
  for (const audio of prompts) {
    try {
      if (typeof audio.pause === 'function') {
        audio.pause();
      }
    } catch {
      // ignore
    }
  }
}
