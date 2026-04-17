import React, { useState } from "react";
import {
  Brain,
  Mail,
  Lock,
  User,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <>
      <div className="min-h-screen flex items-stretch bg-white font-sans">
        {/* --- Left Side: Branding & Trust (Hidden on Mobile) --- */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
          {/* Abstract Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 max-w-md text-center">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <Brain className="text-emerald-400" size={48} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">
              Advancing Medicine <br />
              Through Reasoning.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Join thousands of researchers using Curalink to synthesize
              clinical trials and discover breakthrough treatments faster than
              ever.
            </p>

            <div className="space-y-4">
              {[
                "Real-time PubMed & OpenAlex integration",
                "Custom-tuned Local LLM Reasoning",
                "Location-aware Clinical Trial Discovery",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-slate-300 text-sm"
                >
                  <ShieldCheck className="text-emerald-500" size={18} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Right Side: Auth Form --- */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-50">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <Brain className="text-emerald-600" size={32} />
              <span className="text-2xl font-bold text-slate-900">
                Curalink
              </span>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                {isLogin ? "Welcome Back" : "Create Researcher Account"}
              </h2>
              <p className="text-slate-500">
                {isLogin
                  ? "Enter your credentials to access your research dashboard."
                  : "Start your journey into AI-assisted medical discovery today."}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Medical Email Address"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Location (City, Country)"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group">
                {isLogin ? "Sign In to Dashboard" : "Create Research Profile"}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </form>

            {/* Toggle Switch */}
            <p className="mt-8 text-center text-slate-600 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 hover:underline font-bold transition-all"
              >
                {isLogin ? "Sign up for free" : "Log in here"}
              </button>
            </p>

            <div className="mt-12 text-center">
              <p className="text-xs text-slate-400 max-w-70 mx-auto leading-relaxed">
                By continuing, you agree to Curalink's{" "}
                <span className="underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="underline cursor-pointer">
                  HIPAA-compliant Privacy Policy
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
