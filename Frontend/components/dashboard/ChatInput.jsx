import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Send, Mic, MicOff } from "lucide-react";

const ChatInput = ({ onSendMessage, isLoading }) => {
  // ⚡ Added setValue to manually update the input when speaking
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const queryValue = watch("query");

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // ⚡ Initialize the Speech Recognition API on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");

          setValue("query", transcript, { shouldValidate: true });
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [setValue]);

  const toggleListening = (e) => {
    e.preventDefault(); 
    if (!recognitionRef.current) {
      alert(
        "Voice dictation is not supported in this browser. Please use Chrome or Edge.",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!queryValue) setValue("query", "");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const onSubmit = (data) => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onSendMessage(data.query, reset);
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-slate-50 via-slate-50 to-transparent pb-4 md:pb-6 pt-12">
      <div className="max-w-3xl mx-auto px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-1.5 md:p-2 focus-within:ring-2 ring-emerald-500/20 transition-all flex items-center gap-2 px-2"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-colors shrink-0 flex items-center justify-center ${
              isListening
                ? "bg-red-100 text-red-600 animate-pulse"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
            title={isListening ? "Stop dictation" : "Start dictation"}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input
            {...register("query")}
            type="text"
            autoComplete="off"
            className="flex-1 py-2.5 md:py-3 px-2 outline-none text-xs md:text-sm bg-transparent"
            placeholder="Ask about treatments, dosages, or click the mic to speak..."
          />

          <button
            type="submit"
            disabled={isLoading || !queryValue}
            className="bg-slate-900 text-white p-2 md:p-2.5 rounded-xl hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md shrink-0"
          >
            <Send size={16} className="md:w-4.5 md:h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
