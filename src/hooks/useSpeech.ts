// hooks/useSpeech.ts
import { useState, useEffect, useCallback, useRef } from "react";

export interface SpeechOptions {
  rate?: number; // 语速 (0.1 ~ 10，默认1)
  pitch?: number; // 音高 (0 ~ 2，默认1)
  volume?: number; // 音量 (0 ~ 1，默认1)
  lang?: string; // 语言 (默认'en-US')
  voice?: SpeechSynthesisVoice | null; // 特定语音
  voiceName?: string;
}

export interface SpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentWord: string;
  currentOptions: SpeechOptions;
}

export interface SpeechControls {
  speak: (text: string, options?: SpeechOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  cancel: () => void;
  setOptions: (options: SpeechOptions) => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  togglePlay: (text?: string) => void;
}

const defaultOptions: SpeechOptions = {
  rate: 1,
  pitch: 1,
  volume: 1,
  lang: "en-US",
  voiceName: "Samantha",
};

const useSpeech = (
  initialText: string = "",
  initialOptions: SpeechOptions = {}
): [SpeechState, SpeechControls] => {
  // 状态管理
  const [state, setState] = useState<SpeechState>({
    isPlaying: false,
    isPaused: false,
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
    voices: [],
    currentWord: initialText,
    currentOptions: { ...defaultOptions, ...initialOptions },
  });

  // Refs用于存储不触发重新渲染的值
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const isMountedRef = useRef(true);

  // 初始化语音合成和获取可用语音列表
  useEffect(() => {
    if (!state.isSupported) return;

    synthesisRef.current = window.speechSynthesis;

    // 获取可用的语音列表
    const loadVoices = () => {
      const voices = synthesisRef.current?.getVoices() || [];

      if (voices.length > 0) {
        const voice = voices.find(
          (voice) => voice.name === state.currentOptions.voiceName
        );

        if (voice) {
          setState((prev) => ({
            ...prev,
            currentOptions: { ...prev.currentOptions, voice },
          }));
        }
      }
      setState((prev) => ({ ...prev, voices }));
    };

    // 某些浏览器需要事件触发后才能获取语音列表
    if (synthesisRef.current.getVoices().length > 0) {
      loadVoices();
    } else {
      synthesisRef.current.addEventListener("voiceschanged", loadVoices);
    }

    return () => {
      isMountedRef.current = false;
      synthesisRef.current?.removeEventListener("voiceschanged", loadVoices);
      synthesisRef.current?.cancel(); // 清理未完成的语音
    };
  }, [state.isSupported]);

  // 创建语音实例
  const createUtterance = useCallback(
    (text: string, options: SpeechOptions = {}) => {
      if (!synthesisRef.current) return null;

      const utterance = new SpeechSynthesisUtterance(text);
      const finalOptions = { ...state.currentOptions, ...options };

      // 设置语音参数
      utterance.rate = finalOptions.rate ?? 1;
      utterance.pitch = finalOptions.pitch ?? 1;
      utterance.volume = finalOptions.volume ?? 1;
      utterance.lang = finalOptions.lang ?? "en-US";
      utterance.voice = finalOptions.voice ?? null;

      // 事件处理
      utterance.onstart = () => {
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isPlaying: true,
            isPaused: false,
          }));
        }
      };

      utterance.onend = () => {
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            isPaused: false,
          }));
        }
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            isPaused: false,
          }));
        }
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        if (isMountedRef.current) {
          setState((prev) => ({ ...prev, isPaused: true }));
        }
      };

      utterance.onresume = () => {
        if (isMountedRef.current) {
          setState((prev) => ({ ...prev, isPaused: false }));
        }
      };

      return utterance;
    },
    [state.currentOptions]
  );

  const stop = useCallback(() => {
    if (!synthesisRef.current) return;

    synthesisRef.current.cancel();
    utteranceRef.current = null;

    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
      }));
    }
  }, []);

  // 控制方法
  const speak = useCallback(
    (text: string, options?: SpeechOptions) => {
      if (!state.isSupported || !synthesisRef.current) {
        console.warn("Speech synthesis is not supported in this browser");
        return;
      }

      // 停止当前语音
      stop();

      // 更新状态
      const newOptions = options
        ? { ...state.currentOptions, ...options }
        : state.currentOptions;
      setState((prev) => ({
        ...prev,
        currentWord: text,
        currentOptions: newOptions,
      }));

      // 创建并播放新语音
      const utterance = createUtterance(text, options);
      if (utterance) {
        utteranceRef.current = utterance;
        synthesisRef.current.speak(utterance);
      }
    },
    [state.isSupported, state.currentOptions, createUtterance, stop]
  );

  const pause = useCallback(() => {
    if (!synthesisRef.current || !state.isPlaying || state.isPaused) return;
    synthesisRef.current.pause();
  }, [state.isPlaying, state.isPaused]);

  const resume = useCallback(() => {
    if (!synthesisRef.current || !state.isPaused) return;
    synthesisRef.current.resume();
  }, [state.isPaused]);

  const cancel = useCallback(() => {
    stop(); // cancel 是 stop 的别名
  }, [stop]);

  const setOptions = useCallback((options: SpeechOptions) => {
    setState((prev) => ({
      ...prev,
      currentOptions: { ...prev.currentOptions, ...options },
    }));
  }, []);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState((prev) => ({
      ...prev,
      currentOptions: { ...prev.currentOptions, voice },
    }));
  }, []);

  const togglePlay = useCallback(
    (text?: string) => {
      if (!state.isSupported) return;

      if (state.isPlaying) {
        if (state.isPaused) {
          resume();
        } else {
          pause();
        }
      } else {
        const wordToSpeak = text || state.currentWord;
        if (wordToSpeak) {
          speak(wordToSpeak);
        }
      }
    },
    [
      state.isSupported,
      state.isPlaying,
      state.isPaused,
      state.currentWord,
      speak,
      pause,
      resume,
    ]
  );

  // 获取英文语音（用于下拉选择）
  const getEnglishVoices = useCallback(() => {
    return state.voices.filter(
      (voice) => voice.lang.startsWith("en") && voice.localService
    );
  }, [state.voices]);

  // 在组件卸载时停止语音
  useEffect(() => {
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  // 控制对象
  const controls: SpeechControls = {
    speak,
    pause,
    resume,
    stop,
    cancel,
    setOptions,
    setVoice,
    togglePlay,
  };

  // 扩展状态
  const extendedState: SpeechState & { englishVoices: SpeechSynthesisVoice[] } =
    {
      ...state,
      englishVoices: getEnglishVoices(),
    };

  return [extendedState, controls];
};

export default useSpeech;
