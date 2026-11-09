const prompts = new Set();
let activeWebAudioController = null;
let sharedAudioContextRef = null;

export const registerPromptAudio = audio => prompts.add(audio);
export const unregisterPromptAudio = audio => prompts.delete(audio);

export function registerSharedAudioContext(ctx) {
  sharedAudioContextRef = ctx;
}

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

  if (sharedAudioContextRef && sharedAudioContextRef.state === 'running') {
    try {
      sharedAudioContextRef.suspend().catch(() => {});
    } catch {
      // ignore
    }
  }

  for (const audio of prompts) {
    try {
      if (typeof audio.pause === 'function') {
        audio.pause();
        if (audio.currentTime > 0) {
          audio.currentTime = 0;
        }
      }
    } catch {
      // ignore
    }
  }
}
