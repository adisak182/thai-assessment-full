const prompts = new Set();
let activeWebAudioController = null;

export const registerPromptAudio = audio => prompts.add(audio);
export const unregisterPromptAudio = audio => prompts.delete(audio);

export function setActiveWebAudioController(ctrl) {
  activeWebAudioController = ctrl;
}

export function pausePromptAudio() {
  if (activeWebAudioController) {
    try {
      if (typeof activeWebAudioController.pause === 'function') {
        activeWebAudioController.pause();
      }
    } catch {
      // ignore
    }
    activeWebAudioController = null;
  }

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
