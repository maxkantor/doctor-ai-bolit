import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: SpeechRecognitionResultLike[]
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

const SPEECH_LANG_MAP: Record<string, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  zh: 'zh-CN',
  hi: 'hi-IN',
  uk: 'uk-UA',
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function speechLanguageFromAppLanguage(language: string): string {
  const normalized = language.toLowerCase().split('-')[0]
  return SPEECH_LANG_MAP[normalized] || SPEECH_LANG_MAP.en
}

type UseSpeechDictationOptions = {
  language: string
  onTranscript: (text: string, isFinal: boolean) => void
  onError?: (code: string) => void
}

export function useSpeechDictation({
  language,
  onTranscript,
  onError,
}: UseSpeechDictationOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const wantsListeningRef = useRef(false)
  const onTranscriptRef = useRef(onTranscript)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognitionCtor()))
  }, [])

  const stopListening = useCallback(() => {
    wantsListeningRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      onErrorRef.current?.('unsupported')
      return
    }

    wantsListeningRef.current = true

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = speechLanguageFromAppLanguage(language)

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) final += text
        else interim += text
      }
      if (final.trim()) onTranscriptRef.current(final.trim(), true)
      else if (interim.trim()) onTranscriptRef.current(interim.trim(), false)
    }

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return
      wantsListeningRef.current = false
      setIsListening(false)
      onErrorRef.current?.(event.error)
    }

    recognition.onend = () => {
      if (wantsListeningRef.current) {
        try {
          recognition.start()
        } catch {
          wantsListeningRef.current = false
          setIsListening(false)
        }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch {
      wantsListeningRef.current = false
      onErrorRef.current?.('start-failed')
    }
  }, [language])

  const toggleListening = useCallback(() => {
    if (isListening) stopListening()
    else startListening()
  }, [isListening, startListening, stopListening])

  useEffect(() => {
    return () => {
      wantsListeningRef.current = false
      recognitionRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (isListening) stopListening()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart recognition when language changes
  }, [language])

  return { isSupported, isListening, toggleListening, stopListening }
}
