import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useStatus } from "../context/StatusBarContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/loadSpinner";
import { type AuthFormData } from "../types/auth";
import OnboardingModal, {type OnboardingData} from "../components/OnboardingModal";
import API from "../api/axios";

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const { user, login, register, isLoading } = useAuth();
    const navigate = useNavigate();
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { showStatus } = useStatus();
    const [formData, setFormData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try{
            if(isLogin) {
                await login({email: formData.email, password: formData.password });
                navigate("/feed");
            } else {
                await register(formData);
                setShowOnboarding(true);
            };
        } catch(err){
            showStatus(isLogin ? "Unable to login!" : "Registration Failed!");
        }
    };

    const handleModalClose = async (skipped?: boolean, data?: OnboardingData) => {
        if (!skipped && data){
            try {
                const res = await API.patch("/user/update", {
                    userId: user?.id,
                    ...data
                });
                console.log("Updated:", res.data);
            } catch (error: any) {
                showStatus(error.response?.data?.message || "Failed to save onboarding info", "error");
            }
        }

        setShowOnboarding(false);
        navigate("/feed");
    }

    const handleInputChange = (key: keyof AuthFormData, value: string): void => {
        setFormData((prev) => ({...prev, [key]: value}));
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-brand-bg px-4 overflow-hidden text-brand-text transition-colors duration-300">
            {/*BACKGROUND BRAND GLOW EFFECTS */}
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{background: "var(--glow)"}}/>
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{background: "var(--glow)"}}/>

            {/*GLASSMORPHIC CONTAINER CARD*/}
            <div className="relative w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] border border-brand-border bg-brand-glass p-6 sm:p-8 backdrop-blur-xl md:p-10 transition-colors duration-300" style={{boxShadow: "0 20px 60px var(--shadow)"}}>

                {/*Brand Identity header */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-accent to-brand-accent-hover shadow-xl shadow-violet-600/30">
                        <span className="text-3xl sm:text-4xl font-black text-white select-none transform -skew-x-3">B</span>
                        <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-white animate-pulse" />
                    </div>

                    <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text">
                        {isLogin ? "Welcome back to Blink" : "Create your Blink account"}
                    </h2>

                    <p className="mt-2 text-sm text-brand-text-muted">
                        {isLogin ? "Catch up on what you missed" : "Connect with friends and start sharing"}
                    </p>
                </div>

                {/*Auth Form*/}
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                    {/*Registration-only fields */}
                    {!isLogin && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Username</label>
                                <div className="relative flex items-center">
                                    <User className="absolute left-4 text-brand-text-muted" size={18} />
                                    <input 
                                        type="text"
                                        required
                                        placeholder="Achiever"
                                        className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                        value={formData.username}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("username", e.target.value.replace(/\s/g, ""))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">First Name</label>
                                    <div className="relative flex items-center">
                                        <User className="absolute left-4 text-brand-text-muted" size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ada"
                                            className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                            value={formData.firstName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("firstName", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Last Name</label>
                                    <div className="relative flex items-center">
                                        <User className="absolute left-4 text-brand-text-muted" size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Lovelace"
                                            className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                            value={formData.lastName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("lastName", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/*Email Field oo */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Email Address</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-4 text-brand-text-muted" size={18} />
                            <input
                                type="email"
                                required
                                placeholder="blink@example.com"
                                className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                    </div>

                    {/*Password side oo */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Password</label>
                            {isLogin && (
                                <a href="#forgot" className="text-xs font-medium text-brand-accent hover:text-brand-accent-hover hover:underline">Forgot password?</a>
                            )}
                        </div>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 text-brand-text-muted" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter Password"
                                className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                value={formData.password}
                                onChange ={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("password", e.target.value)}
                            />
                            <button type="button"
                            className="absolute right-4 text-brand-text-muted hover:text-brand-text transition"
                            onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/*Submit button oo */}
                    <button
                    type="submit"
                    disabled = {isLoading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-accent to-brand-accent-hover py-3.5 font-semibold text-white shadow-lg shadow-brand-accent/20 hover:from-violet-500 hover:to-indigo-500 transition-all transform active:scale-[0.98] hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <>
                                <Spinner size="sm" variant="white" />
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <span>{isLogin ? "Sign In" : "Get Started"}</span>
                            </>
                        )}
                    </button>
                </form>
                
                    {/*Interactive Toggle Footer */}
                    <div className="mt-8 text-center text-sm text-brand-text-muted">
                            {isLogin ? "New to Blink?" : "Already have an account?" }{" "}
                            <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-bold text-brand-accent hover:text-brand-accent-hover hover:underline transition">
                                {isLogin ? "Create an account" : "Sign in here"}
                            </button>
                    </div>
            </div>

            <OnboardingModal
                isOpen={showOnboarding}
                onClose={handleModalClose}
            />
        </div>
    )
};

export default AuthPage;