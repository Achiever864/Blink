import React, { useState } from "react";
import { 
  Briefcase, FileText, MapPin, Globe, Link as LinkIcon, 
  Heart, ChevronLeft, ChevronRight, X 
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: (skipped?: boolean, data?: OnboardingData) => void;
}

export interface OnboardingData {
  occupation: string;
  bio: string;
  city: string;
  nationality: string;
  website: string;
  interests: string[];
}

const PRESET_INTERESTS = ["Tech", "Design", "Gaming", "Music", "Writing", "Art", "Sports", "Finance"];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [data, setData] = useState<OnboardingData>({
    occupation: "",
    bio: "",
    city: "",
    nationality: "",
    website: "",
    interests: [],
  });

  if (!isOpen) return null;

  const handleChange = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    const current = data.interests;
    if (current.includes(interest)) {
      handleChange("interests", current.filter((i) => i !== interest));
    } else {
      handleChange("interests", [...current, interest]);
    }
  };

  const handleFinish = (skipped = false) => {
    // Pass the collected data back to wherever linked this modal
    onClose(skipped, skipped ? undefined : data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-[2.5rem] border border-brand-border bg-brand-glass p-8 md:p-10 text-brand-text shadow-2xl transition-all duration-300"
        style={{ boxShadow: "0 20px 60px var(--shadow)" }}
      >
        {/* Upper Right Close/Skip Button */}
        <button 
          onClick={() => handleFinish(true)} 
          className="absolute top-6 right-6 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-text-muted hover:text-brand-text transition"
        >
          Skip <X size={16} />
        </button>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-3">
            <span>Complete Profile</span>
            <span>Step {currentStep} of 3</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-brand-bg-secondary/70 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-accent to-indigo-500 transition-all duration-300" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: BIO & OCCUPATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-slideIn">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight">Tell us about yourself</h3>
              <p className="text-sm text-brand-text-muted mt-1">Let the Blink community know who you are.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Occupation</label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-4 text-brand-text-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Frontend Engineer, Artist, Explorer"
                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                    value={data.occupation}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Bio</label>
                <div className="relative flex items-start">
                  <FileText className="absolute left-4 top-4 text-brand-text-muted" size={18} />
                  <textarea
                    rows={3}
                    placeholder="Just a creative soul finding paths through complex structures..."
                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 resize-none"
                    value={data.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & NATIONALITY */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-slideIn">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight">Where are you based?</h3>
              <p className="text-sm text-brand-text-muted mt-1">Share your location to find local connections.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">City</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 text-brand-text-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Lagos"
                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                    value={data.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Nationality</label>
                <div className="relative flex items-center">
                  <Globe className="absolute left-4 text-brand-text-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Nigerian"
                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                    value={data.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PORTFOLIO & INTERESTS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-slideIn">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight">Personal Space & Hobbies</h3>
              <p className="text-sm text-brand-text-muted mt-1">Add your digital footprint and pick what grabs you.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">Website / Portfolio</label>
                <div className="relative flex items-center">
                  <LinkIcon className="absolute left-4 text-brand-text-muted" size={18} />
                  <input
                    type="url"
                    placeholder="https://blink01.netlify.app"
                    className="w-full rounded-2xl border border-brand-border bg-brand-bg-secondary/70 py-3.5 pl-12 pr-4 text-sm text-brand-text placeholder:text-brand-text-muted outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                    value={data.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-500" /> Choose Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_INTERESTS.map((interest) => {
                    const isSelected = data.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 border ${
                          isSelected 
                            ? "bg-brand-accent border-brand-accent text-brand-text shadow-md shadow-brand-accent/20 scale-105" 
                            : "bg-brand-bg-secondary/50 border-brand-border text-brand-text-muted hover:border-brand-accent/40"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl border border-brand-border hover:bg-brand-bg-secondary/50 font-semibold text-sm transition"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleFinish(true)}
              className="text-sm font-semibold text-brand-text-muted hover:text-brand-text transition"
            >
              Skip all steps
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accent-hover font-semibold text-sm text-brand-text transition shadow-lg shadow-brand-accent/20 ml-auto"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleFinish(false)}
              className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold text-sm text-brand-text transition shadow-lg shadow-violet-600/30 ml-auto"
            >
              Finish & Enter Blink
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;