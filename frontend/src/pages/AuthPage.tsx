import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useStatus } from "../context/StatusBarContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/loadSpinner";
import { type AuthFormData } from "../types/auth";

//Import your type definitions if extracted or define them locally for now
//import { AuthFormData } from "../types/auth.ts";

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const { login, register, isLoading } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { showStatus } = useStatus();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try{
            if(isLogin) {
                await login({email: formData.email, password: formData.password });
                //redirection to the next page should happen here if success
            } else {
                await register(formData);
            }

            //the code hits this line when the login has been completed successfully
            navigate("/feed");
        } catch(err){
            showStatus(err);
        }
        console.log("Submitting Type-Safe Data:", formData);
        //Next: to feed this directly into an axios/fetch handler
    };

    //Helper function to safely update individual keys in our typed state
    const handleInputChange = (key: keyof AuthFormData, value: string): void => {
        setFormData((prev) => ({...prev, [key]: value}));
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-brand-bg px-4 overflow-hidden text-brand-text transition-colors duration-300">
            {/*BACKGROUND BRAND GLOW EFFECTS */}
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{background: "var(--glow)"}}/>
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{background: "var(--glow)"}}/>


            {/*GLASSMORPHIC CONTAINER CARD*/}
            <div className="relative w-full max-w-md rounded-[2.5rem] border border-brand-border bg-brand-glass p-8 backdrop-blur-xl md:p-10 transition-colors duration-300" style={{boxShadow: "0 20px 60px var(--shadow)"}}>

                {/*Brand Identity header */} <div className="flex flex-col items-center text-center"> <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/30"> <span className="text-4xl font-black text-white select-none transform -skew-x-3">B</span> <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-white animate-pulse" />
                    </div>

                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-text">
                        {isLogin ? "Welcome back to Blink" : "Create your Blink account"}
                    </h2>

                    <p className="mt-2 text-sm text-brand-text-muted">
                        {isLogin ? "Catch up on what you missed" : "Connct with friends and start sharing"}
                    </p>
                </div>

                {/*Auth Form*/}
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                    {/*Userame Field (visible only during registration)*/}
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Full Name</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-4 text-brand-text-muted" size={10} />
                                <input 
                                    type="text"
                                    required
                                    placeholder="Igaga Adeoluwa"
                                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secoondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                    value={formData.username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("username", e.target.value)}
                                />
                            </div>
                        </div>
                    )}


                    {/*Email Field oo */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-4 text-brand-text-muted" size={18} />
                            <input
                                type="email"
                                required
                                placeholder="blink@example.com"
                                className="w-full rounded-2xl border border-brand-border bg-brand-bg-secoondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                    </div>

                    {/*Password side oo */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                            {isLogin && (
                                <a href="#forgot" className="text-xs font-meddium text-brand-accent hover:text-brand-accent-hover hover:underline">Forgot password?</a>
                            )}
                        </div>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 text-brand-text-muted" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter Password"
                                className="w-full rounded-2xl border border-brand-border bg-brand-bg-secoondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none transition-all focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                                value={formData.password}
                                onChange ={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("password", e.target.value)}
                            />
                            <button type="button"
                            className="absolute right-4 text-slate-500 hover:text-slate-300 transition"
                            onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/*Submit button oo */}
                    <button
                    type="submit"
                    disabled = {isLoading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradiend-to-r from-brand-accent to-brand-accent-hover py-3.5 font-semibold text-brand-text shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all transform active:scale-[0.98] hover:scale-[1.02]">
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
        </div>
    )
};

export default AuthPage;