"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, Loader2, Pause, Volume2 } from "lucide-react";
import { GradientText } from "../ui/GradientText";
import { HolographicButton } from "../ui/HolographicButton";
import { CyberBorder } from "../ui/CyberBorder";
import { generateShortScript } from "../../../lib/api/client";

interface QuilliumShortsProps {
  onBack: () => void;
  language?: string;
}

const DEFAULT_SHORT_VIDEO = "subway.mp4";

export const QuilliumShorts = ({ onBack, language = "English" }: QuilliumShortsProps) => {
  const [topic, setTopic] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(DEFAULT_SHORT_VIDEO);
  const [isNarrationLoading, setIsNarrationLoading] = useState(false);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const subtitleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopNarration();
      if (subtitleTimerRef.current) clearTimeout(subtitleTimerRef.current);
    };
  }, []);

  const stopNarration = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsNarrationPlaying(false);
    setSubtitle("");
    if (subtitleTimerRef.current) {
      clearTimeout(subtitleTimerRef.current);
      subtitleTimerRef.current = null;
    }
  };

  const speak = async (text: string) => {
    if (typeof window === "undefined") throw new Error("Speech synthesis not available");
    if (!("speechSynthesis" in window)) throw new Error("Text-to-speech not supported in this browser");

    stopNarration();

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const ESTIMATED_WPS = 2.8;
    let time = 0;
    const cues = sentences.map((sentence) => {
      const words = sentence.trim().split(/\s+/).length;
      const duration = Math.max(1, Math.round(words / ESTIMATED_WPS));
      const cue = { text: sentence.trim(), start: time, end: time + duration };
      time += duration;
      return cue;
    });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsNarrationPlaying(true);
      setIsNarrationLoading(false);

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }

      let idx = 0;
      setSubtitle(cues[0]?.text || "");

      const showNextSubtitle = () => {
        idx++;
        if (idx < cues.length) {
          setSubtitle(cues[idx].text);
          subtitleTimerRef.current = setTimeout(
            showNextSubtitle,
            (cues[idx].end - cues[idx].start) * 1000
          );
        }
      };

      if (cues.length > 1) {
        subtitleTimerRef.current = setTimeout(
          showNextSubtitle,
          (cues[0].end - cues[0].start) * 1000
        );
      }
    };

    utterance.onend = () => {
      setIsNarrationPlaying(false);
      utteranceRef.current = null;
      setSubtitle("");

      if (subtitleTimerRef.current) {
        clearTimeout(subtitleTimerRef.current);
        subtitleTimerRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    };

    utterance.onerror = () => {
      setIsNarrationPlaying(false);
      utteranceRef.current = null;
      setTtsError("Narration playback failed.");
      setSubtitle("");

      if (subtitleTimerRef.current) {
        clearTimeout(subtitleTimerRef.current);
        subtitleTimerRef.current = null;
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerateShort = async () => {
    if (isGenerating) return;

    const subject = topic.trim() || "Your topic";
    setIsGenerating(true);
    setShowPreview(true);
    setTtsError(null);
    setScript("");
    setSubtitle("");
    setSelectedVideo(DEFAULT_SHORT_VIDEO);
    stopNarration();

    try {
      setSelectedVideo(DEFAULT_SHORT_VIDEO);

      const response = await generateShortScript(subject);
      const generatedScript = response?.script?.trim() ?? "";
      setScript(generatedScript);
    } catch (err) {
      console.error(err);
      const fallbackScript = `Let's explore ${subject}. This is an important concept with many applications. Understanding the basics helps build a strong foundation for advanced learning. Practice regularly to master this topic.`;
      setScript(fallbackScript);

      setSelectedVideo(DEFAULT_SHORT_VIDEO);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNarrationClick = async () => {
    if (!script || isNarrationLoading || isNarrationPlaying) return;

    setIsNarrationLoading(true);
    setTtsError(null);

    try {
      await speak(script);
    } catch (err) {
      setIsNarrationLoading(false);
      setTtsError(err instanceof Error ? err.message : "Unable to play narration");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CyberBorder className="max-w-6xl mx-auto">
        <div className="p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              <GradientText text="Quillium Shorts" gradient="cyber" />
            </h2>
            <span className="text-green-400">🌐 {language}</span>
          </div>

          <input
            className="cyber-input w-full mb-4"
            placeholder="e.g. Binary Search, OS Scheduling, Machine Learning"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <HolographicButton
            onClick={handleGenerateShort}
            disabled={isGenerating}
            className="w-full mb-8"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Short...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Short</span>
              </>
            )}
          </HolographicButton>

          {showPreview && selectedVideo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-6"
            >
              <div className="relative w-[360px] h-[640px] sm:w-[400px] sm:h-[711px] rounded-3xl overflow-hidden border-4 border-white/10 bg-black shadow-2xl">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={`/shorts/${selectedVideo}`}
                  muted
                  loop
                  playsInline
                  autoPlay
                />

                {topic && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] flex justify-center z-10">
                    <div className="bg-gradient-to-r from-cyan-500/90 to-purple-500/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl">
                      <p className="text-white font-bold text-center text-sm">
                        {topic}
                      </p>
                    </div>
                  </div>
                )}

                {subtitle && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] flex justify-center z-10">
                    <motion.div
                      key={subtitle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/85 backdrop-blur-sm px-6 py-3 rounded-xl shadow-2xl max-w-[90%] border border-white/10"
                    >
                      <p className="text-white text-lg font-medium text-center drop-shadow-lg leading-relaxed">
                        {subtitle}
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <HolographicButton
                  onClick={handleNarrationClick}
                  disabled={!script || isNarrationLoading || isNarrationPlaying}
                  className="w-full max-w-xs mx-auto"
                >
                  {isNarrationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Preparing voice...</span>
                    </>
                  ) : isNarrationPlaying ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Narration Playing</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Play with Narration</span>
                    </>
                  )}
                </HolographicButton>

                {isNarrationPlaying && (
                  <HolographicButton
                    variant="ghost"
                    onClick={stopNarration}
                    className="w-full max-w-xs mx-auto"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Stop Narration</span>
                  </HolographicButton>
                )}
              </div>

              {ttsError && (
                <p className="text-red-400 text-sm text-center">{ttsError}</p>
              )}
            </motion.div>
          )}

          <div className="mt-10 flex justify-center">
            <HolographicButton onClick={onBack} variant="ghost">
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </HolographicButton>
          </div>
        </div>
      </CyberBorder>
    </div>
  );
};
