import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useStatus } from "../context/StatusBarContext";

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { showStatus } = useStatus();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await API.post("/user/forgotPassword", { email });
            // Backend always returns the same generic message regardless of
            // whether the email exists — we mirror that here rather than
            // branching on success/failure, to avoid confirming which
            // emails are registered.
            setSubmitted(true);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Something went wrong. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-brand-bg px-4 overflow-hidden text-brand-text transition-colors duration-300">
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: "var(--glow)" }} />
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: "var(--glow)" }} />

            <div className="relative w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] border border-brand-border bg-brand-glass p-6 sm:p-8 backdrop-blur-xl md:p-10 transition-colors duration-300" style={{ boxShadow: "0 20px 60px var(--shadow)" }}>

                <div className="flex flex-col items-center text-center">
                    <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-accent to-brand-accent-hover shadow-xl shadow-violet-600/30">
                        <span className="text-3xl sm:text-4xl font-black text-white select-none transform -skew-x-3">B</span>
                        <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-white animate-pulse" />
                    </div>

                    <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text">
                        {submitted ? "Check your email" : "Forgot your password?"}
                    </h2>

                    <p className="mt-2 text-sm text-brand-text-muted max-w-sm">
                        {submitted
                            ? "If an account with that email exists, we've sent a link to reset your password. It expires in 30 minutes."
                            : "Enter the email associated with your account and we'll send you a link to reset your password."}
                    </p>
                </div>

                {submitted ? (
                    <div className="mt-8 flex flex-col items-center gap-6">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 size={28} className="text-emerald-400" />
                        </div>
                        <Link
                            to="/"
                            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-brand-border py-3.5 text-sm font-semibold text-brand-text hover:bg-brand-bg-secondary/70 transition-all"
                        >
                            <ArrowLeft size={16} />
                            Back to sign in
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-4 text-brand-text-muted" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="blink@example.com"
                                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-accent to-brand-accent-hover py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all transform active:scale-[0.98] hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 text-sm font-medium text-brand-text-muted hover:text-brand-text transition-all"
                        >
                            <ArrowLeft size={14} />
                            Back to sign in
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;