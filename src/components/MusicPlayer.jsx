import React, { useState, useRef, useEffect } from 'react';

// Sokin, tinchlantiruvchi, yoqimli lofi / ambient musiqa (Royalty-free)
const MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Pastroq, yoqimli fon ovozi
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <div className="ambient-music-player" title="Sokin fon musiqasi">
      <audio
        ref={audioRef}
        src={MUSIC_URL}
        loop
        preload="auto"
      />

      <button
        type="button"
        className={`music-btn ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        aria-label="Fon musiqasi"
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
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="music-volume-slider"
          title={`Ovoz: ${Math.round(volume * 100)}%`}
        />
      )}
    </div>
  );
}
