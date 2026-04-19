import { Activity, ChevronRight, FileText, MapPin } from "lucide-react";

export const HomeDashboard = () => {
  return (
    <>
      <section id="demo" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Designed for <br /> Medical Precision.
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm">
                    <MapPin className="text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Location-Aware Discovery
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Find clinical trials recruiting specifically in your city
                      or region.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm">
                    <FileText className="text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Multi-Turn Context
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Ask follow-up questions; Curalink remembers your disease
                      history and previous queries.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm">
                    <Activity className="text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Recruiting Status Tracking
                    </h4>
                    <p className="text-slate-600 text-sm">
                      Real-time status updates on trial eligibility and contact
                      information.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden aspect-square md:aspect-video lg:aspect-square flex flex-col">
                <div className="bg-slate-900 p-4 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto bg-slate-800 px-4 py-1 rounded text-xs text-slate-400 w-1/2 text-center">
                    curalink-research-v1.0.ai
                  </div>
                </div>
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-500 shrink-0 flex items-center justify-center text-white font-bold text-xs italic">
                      C
                    </div>
                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-sm text-slate-800 max-w-[80%]">
                      Based on current research, **Deep Brain Stimulation
                      (DBS)** has shown 60% improvement in motor symptoms for
                      Parkinson’s patients. Here are the top clinical trials in
                      your area:
                    </div>
                  </div>
                  <div className="ml-11 border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        RECRUITING
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ID: NCT054321
                      </span>
                    </div>
                    <h5 className="font-bold text-sm mb-1 text-slate-900">
                      Phase III Study of DBS in Early Parkinson's
                    </h5>
                    <p className="text-xs text-slate-500 mb-2">
                      Toronto General Hospital • 1.2 miles away
                    </p>
                    <button className="text-xs font-bold text-emerald-600 underline">
                      View Eligibility
                    </button>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
                    <input
                      type="text"
                      placeholder="Ask follow-up..."
                      className="bg-transparent text-sm w-full outline-none"
                    />
                    <button className="bg-emerald-600 text-white p-1.5 rounded-full">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
