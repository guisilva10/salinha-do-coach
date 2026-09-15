"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Playlist configurável — arquivos ainda não adicionados (ver
 * `public/audio/LICENSE.txt`). Trocar por faixas CC0/CC-BY reais com a
 * licença/atribuição documentada nesse arquivo antes de ir pra produção.
 */
const LOFI_TRACKS = [
  { title: "Lofi 1", src: "/audio/lofi-1.mp3" },
  { title: "Lofi 2", src: "/audio/lofi-2.mp3" },
];

const DEFAULT_VOLUME = 0.4;

/** Player de áudio local, sem sync — só quem sentou numa cadeira lofi ouve. */
export function LofiPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.volume = volume;
  }, [volume]);

  const track = LOFI_TRACKS[trackIndex];

  const nextTrack = () => {
    setIsPlaying(false);
    setIsUnavailable(false);
    setTrackIndex((previous) => (previous + 1) % LOFI_TRACKS.length);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || isUnavailable) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsUnavailable(true));
  };

  return (
    <div className="pointer-events-auto fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-background/90 px-4 py-2 backdrop-blur">
      <audio
        ref={audioRef}
        src={track?.src}
        loop
        onError={() => setIsUnavailable(true)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="min-h-11 min-w-11"
        aria-label={isPlaying ? "Pausar lofi" : "Tocar lofi"}
        onClick={togglePlay}
        disabled={isUnavailable}
      >
        {isPlaying ? (
          <Pause className="size-4" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="min-h-11 min-w-11"
        aria-label="Próxima faixa"
        onClick={nextTrack}
      >
        <SkipForward className="size-4" aria-hidden="true" />
      </Button>
      <div className="flex items-center gap-2">
        <Volume2 className="size-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          aria-label="Volume do lofi"
          onChange={(event) => setVolume(Number(event.target.value))}
          className="w-20"
        />
      </div>
      {isUnavailable ? (
        <p className="text-xs text-muted-foreground">Faixas indisponíveis</p>
      ) : (
        <p className="text-xs text-muted-foreground">{track?.title}</p>
      )}
    </div>
  );
}
