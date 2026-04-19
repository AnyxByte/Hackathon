import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";
import {
  Brain,
  Mail,
  Lock,
  User,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Cookies from "js-cookie";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    if (!isLogin) {
      data = {
        ...data,
        name: data.firstName + " " + data.lastName,
      };
    }

    try {
      const response = await axios.post(`${apiUrl}${endpoint}`, data);

      toast.success(
        isLogin ? "Welcome back!" : "Account created successfully!",
      );

      localStorage.setItem("token", response.data.token);
      Cookies.set("token", response.data.token);

      localStorage.setItem("user", JSON.stringify(response.data.user));
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <>
      <div className="min-h-screen flex items-stretch bg-white font-sans">
        <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 max-w-md text-center">
            <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <Brain className="text-emerald-400" size={48} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">
              Advancing Medicine <br /> Through Reasoning.
            </h1>
            <div className="space-y-4 inline-block text-left">
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

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-50">
          <div className="w-full max-w-md">
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
              <p className="text-slate-500 text-sm">
                {isLogin
                  ? "Enter your credentials to access your research dashboard."
                  : "Start your journey into AI-assisted medical discovery today."}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      {...register("firstName", { required: "Required" })}
                      type="text"
                      placeholder="First Name"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <input
                      {...register("lastName", { required: "Required" })}
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
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
                  {...register("email", {
                    required: "Email is required",
                  })}
                  type="email"
                  autoComplete="email"
                  placeholder="Medical Email Address"
                  className={`w-full pl-11 pr-4 py-3 bg-white border ${
                    errors.email ? "border-red-400" : "border-slate-200"
                  } rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm`}
                />
                {errors.email && (
                  <span className="text-[10px] text-red-500 ml-2">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  {...register("password", {
                    required: "Password required",
                    minLength: { value: 6, message: "Min 6 chars" },
                  })}
                  type="password"
                  placeholder="Password"
                  className={`w-full pl-11 pr-4 py-3 bg-white border ${errors.password ? "border-red-400" : "border-slate-200"} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm`}
                />
                {errors.password && (
                  <span className="text-[10px] text-red-500 ml-2">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {!isLogin && (
                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    {...register("location", {
                      required: "Location helps personalize research",
                    })}
                    type="text"
                    placeholder="Location (City, Country)"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                  />
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group mt-6"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin
                      ? "Sign In to Dashboard"
                      : "Create Research Profile"}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-600 font-medium text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleAuthMode}
                className="text-emerald-600 hover:underline font-bold"
              >
                {isLogin ? "Sign up for free" : "Log in here"}
              </button>
            </p>

            <div className="mt-12 text-center">
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed italic">
                Curalink is a HIPAA-compliant medical research interface. Secure
                authentication is powered by AES-256 encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};
