import React from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";

const ChatInput = ({ onSendMessage, isLoading }) => {
  const { register, handleSubmit, reset, watch } = useForm();
  const queryValue = watch("query");

  const onSubmit = (data) => {
    onSendMessage(data.query, reset);
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-slate-50 via-slate-50 to-transparent pb-4 md:pb-6 pt-12">
      <div className="max-w-3xl mx-auto px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 p-1.5 md:p-2 focus-within:ring-2 ring-emerald-500/20 transition-all flex items-center gap-2 px-2"
        >
          <input
            {...register("query")}
            type="text"
            autoComplete="off"
            className="flex-1 py-2.5 md:py-3 px-2 outline-none text-xs md:text-sm bg-transparent"
            placeholder="Ask about treatments, dosages..."
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
