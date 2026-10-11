import React, { useState, useRef } from 'react';

// Web Audio API orqali generatsiya qilinadigan 100% kafolatlangan sokin meditatsion kuy (Pianino va Ambient)
export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const timerRef = useRef(null);

  const startCalmSynthMusic = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Sokin akkordlar (Pentatonika: tinchlantiruvchi, sokin tovushlar)
      const calmScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25]; // C4, D4, E4, G4, A4, C5, E5

      const playCalmTone = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        // Sine to'lqin - eng mayin, sokin fortepiano/organ ohangi
        osc.type = 'sine';

        // Tasodifiy sokin nota tanlash
        const freq = calmScale[Math.floor(Math.random() * calmScale.length)];
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Mayin kirib kelish va ohista so'nish (Attack & Release)
        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.2, now + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 4.6);
      };

      // Har 2 soniyada mayin sokin kuy notasi yangraydi
      playCalmTone();
      timerRef.current = setInterval(playCalmTone, 2200);

      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopMusic = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startCalmSynthMusic();
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime);
    }
  };

  return (
    <div className="ambient-music-player" title="Sokin, tinchlantiruvchi fon kuylari">
      <button
        type="button"
        className={`music-btn ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        aria-label="Sokin fon kuylari"
      >
        <span className="music-icon">{isPlaying ? '🔊' : '🎵'}</span>
        <span className="music-label">{isPlaying ? 'Sokin kuy: Yoqiq' : 'Sokin kuy'}</span>
        {isPlaying && (
          <span className="sound-wave">
            <span></span>
            <span></span>
            <span></span>
          </span>
        )}
      </button>

      {isPlaying && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="music-volume-slider"
          title={`Ovoz: ${Math.round(volume * 100)}%`}
        />
      )}
    </div>
  );
}
