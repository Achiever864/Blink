import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import { useStatus } from "../context/StatusBarContext";

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const { showStatus } = useStatus();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showStatus("Passwords do not match", "error");
            return;
        }

        if (newPassword.length < 6) {
            showStatus("Password must be at least 6 characters", "error");
            return;
        }

        if (!token) {
            showStatus("Reset link is missing or invalid", "error");
            return;
        }

        setIsLoading(true);
        try {
            await API.post("/user/resetPassword", { token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate("/"), 2500);
        } catch (error: any) {
            showStatus(error.response?.data?.message || "Failed to reset password", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // No token in the URL at all — this page was reached without a valid link
    if (!token) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-brand-bg px-4 overflow-hidden text-brand-text">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: "var(--glow)" }} />
                <div className="relative w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] border border-brand-border bg-brand-glass p-8 backdrop-blur-xl text-center" style={{ boxShadow: "0 20px 60px var(--shadow)" }}>
                    <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                        <XCircle size={28} className="text-rose-400" />
                    </div>
                    <h2 className="mt-6 text-2xl font-extrabold text-brand-text">Invalid reset link</h2>
                    <p className="mt-2 text-sm text-brand-text-muted">
                        This password reset link is missing or malformed. Please request a new one.
                    </p>
                    <Link
                        to="/forgotPassword"
                        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-brand-accent to-brand-accent-hover px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02]"
                    >
                        Request new link
                    </Link>
                </div>
            </div>
        );
    }

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
                        {success ? "Password updated!" : "Set a new password"}
                    </h2>

                    <p className="mt-2 text-sm text-brand-text-muted max-w-sm">
                        {success
                            ? "Redirecting you to sign in..."
                            : "Choose a strong new password for your account."}
                    </p>
                </div>

                {success ? (
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 size={28} className="text-emerald-400" />
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">New Password</label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-4 text-brand-text-muted" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Enter new password"
                                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-12 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 text-brand-text-muted hover:text-brand-text transition"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Confirm Password</label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-4 text-brand-text-muted" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Confirm new password"
                                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-accent to-brand-accent-hover py-3.5 font-semibold text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all transform active:scale-[0.98] hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;