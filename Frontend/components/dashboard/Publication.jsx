import React from "react";
import { BookOpen, ExternalLink, Calendar, Users } from "lucide-react";

const PublicationCard = ({ pub }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 md:p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] md:text-xs font-semibold">
          <BookOpen size={12} className="md:w-3.5 md:h-3.5" />
          <span>{pub.source || "Publication"}</span>
        </div>
        {pub.year && (
          <div className="flex items-center gap-1 text-slate-400 text-[10px] md:text-xs font-medium">
            <Calendar size={12} />
            <span>{pub.year}</span>
          </div>
        )}
      </div>

      <h4 className="text-xs md:text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
        {pub.title}
      </h4>

      {pub.authors && pub.authors.length > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-500 mb-2.5">
          <Users size={12} className="shrink-0" />
          <span className="truncate">{pub.authors.join(", ")}</span>
        </div>
      )}

      <p className="text-[11px] md:text-xs text-slate-600 line-clamp-3 mb-3.5 flex-1 leading-relaxed">
        {pub.abstract || "No abstract available for this publication."}
      </p>

      <div className="mt-auto pt-3 border-t border-slate-100">
        <a
          href={pub.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 md:gap-2 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] md:text-xs font-bold py-2 rounded-lg transition-colors"
        >
          Read Full Paper <ExternalLink size={12} className="md:w-3.5 md:h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default PublicationCard;