"use client";

import { ChangeEvent, useEffect, useState } from "react";

type State = {
  sender: string;
  response: string | null | undefined;
};

function VoiceSynthesizer({
  state,
  displaySettings,
}: {
  state: State;
  displaySettings: boolean;
}) {
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  // Initialize speech synthesis only on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  // Load voices when synth is available
  useEffect(() => {
    if (!synth) return;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !voice) {
        setVoice(availableVoices[0]);
      }
    };

    loadVoices();
    
    // Some browsers load voices asynchronously
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, [synth, voice]);

  // Handle speech synthesis
  useEffect(() => {
    if (!state.response || !synth || !voice) return;

    const wordsToSay = new SpeechSynthesisUtterance(state.response);

    wordsToSay.voice = voice;
    wordsToSay.pitch = pitch;
    wordsToSay.rate = rate;
    wordsToSay.volume = volume;

    synth.speak(wordsToSay);

    return () => {
      synth.cancel();
    };
  }, [state.response, synth, voice, pitch, rate, volume]);

  const handleVoiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedVoice = voices.find((v) => v.name === e.target.value);
    if (selectedVoice) {
      setVoice(selectedVoice);
    }
  };

  const handlePitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPitch(parseFloat(e.target.value));
  };

  const handleRateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRate(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  // Don't render anything if we're on the server or speech synthesis is not available
  if (typeof window === 'undefined' || !synth) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center text-white">
      {displaySettings && (
        <>
          <div className="w-fit">
            <p className="text-xs text-gray-500 p-2">Voice:</p>
            <select
              value={voice?.name || ''}
              onChange={handleVoiceChange}
              className="flex-1 bg-purple-500 text-white border border-gray-300 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-purple-500 dark:focus:border-purple-500"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex pb-5">
            <div className="p-2">
              <p className="text-xs text-gray-500">Pitch:</p>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={handlePitchChange}
                className="accent-purple-500"
              />
            </div>

            <div className="p-2">
              <p className="text-xs text-gray-500">Speed:</p>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={handleRateChange}
                className="accent-purple-500"
              />
            </div>

            <div className="p-2">
              <p className="text-xs text-gray-500">Volume:</p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="accent-purple-500"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VoiceSynthesizer;