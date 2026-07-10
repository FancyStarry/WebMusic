import { ref, watch } from 'vue'
import { usePlayerStore } from '../stores/player'

export function useAudio() {
  const player = usePlayerStore()
  const audioRef = ref(null)
  const analyser = ref(null)
  const audioContext = ref(null)
  const source = ref(null)
  const frequencies = ref(new Uint8Array(0))

  function initAudio(audioEl) {
    if (!audioEl) return
    audioRef.value = audioEl

    audioEl.addEventListener('timeupdate', () => {
      player.currentTime = audioEl.currentTime
    })

    audioEl.addEventListener('loadedmetadata', () => {
      player.duration = audioEl.duration
    })

    audioEl.addEventListener('ended', () => {
      if (player.playMode === 'single') {
        audioEl.currentTime = 0
        audioEl.play()
      } else {
        player.next()
      }
    })

    audioEl.addEventListener('error', () => {
      player.playing = false
    })
  }

  function initAnalyser(audioEl) {
    if (!audioEl) return
    try {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      source.value = audioContext.value.createMediaElementSource(audioEl)
      analyser.value = audioContext.value.createAnalyser()
      analyser.value.fftSize = 256
      source.value.connect(analyser.value)
      analyser.value.connect(audioContext.value.destination)
      frequencies.value = new Uint8Array(analyser.value.frequencyBinCount)
    } catch (e) {
      console.warn('Web Audio API 初始化失败:', e.message)
    }
  }

  function getFrequencies() {
    if (analyser.value) {
      analyser.value.getByteFrequencyData(frequencies.value)
    }
    return frequencies.value
  }

  watch(() => player.playing, (playing) => {
    const audio = audioRef.value
    if (!audio) return

    if (audioContext.value && audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }

    if (playing) {
      audio.play().catch(() => {
        player.playing = false
      })
    } else {
      audio.pause()
    }
  })

  watch(() => player.volume, (vol) => {
    if (audioRef.value) {
      audioRef.value.volume = vol
    }
  })

  watch(() => player.muted, (muted) => {
    if (audioRef.value) {
      audioRef.value.muted = muted
    }
  })

  watch(() => player.currentSong, (song, oldSong) => {
    if (song && song !== oldSong) {
      const audio = audioRef.value
      if (!audio) return
      audio.src = player.audioSrc
      audio.load()
      if (player.playing) {
        audio.play().catch(() => {
          player.playing = false
        })
      }
    }
  })

  return {
    audioRef,
    initAudio,
    initAnalyser,
    getFrequencies,
  }
}
