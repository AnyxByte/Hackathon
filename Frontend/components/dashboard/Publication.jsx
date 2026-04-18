import { ExternalLink } from "lucide-react";

const PublicationCard = ({ pub }) => (
  <div className="bg-white border border-slate-200 p-4 rounded-xl hover:shadow-md transition-shadow group relative">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-tighter">
        {pub.platform}
      </span>
      <a
        href={pub.url}
        target="_blank"
        className="text-slate-400 hover:text-emerald-600"
      >
        <ExternalLink size={14} />
      </a>
    </div>
    <h4 className="text-xs font-bold text-slate-800 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
      {pub.title}
    </h4>
    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
      <span>{pub.authors}</span>
      <span>•</span>
      <span>{pub.year}</span>
    </div>
  </div>
);

export default PublicationCard;
