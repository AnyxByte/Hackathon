import { ChevronRight, FlaskConical, MapPin } from "lucide-react";

const TrialCard = ({ trial }) => (
  <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-xl flex gap-4 items-center">
    <div className="bg-white w-12 h-12 rounded-lg border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
      <FlaskConical size={20} />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-xs font-bold text-slate-900">{trial.title}</h4>
        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider">
          {trial.status}
        </span>
      </div>
      <div className="flex gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin size={10} /> {trial.location}
        </span>
        <span className="flex items-center gap-1 font-mono text-emerald-700">
          {trial.contact}
        </span>
      </div>
    </div>
    <button className="text-slate-400 hover:text-emerald-600">
      <ChevronRight size={18} />
    </button>
  </div>
);

export default TrialCard;
