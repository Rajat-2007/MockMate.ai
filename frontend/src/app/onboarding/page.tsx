"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Globe,
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { authApi, type AcademicOptions, type AcademicStream } from "@/lib/api/auth";

const FALLBACK_OPTIONS: AcademicOptions = {
  streams: [
    {
      id: "engineering",
      name: "Engineering & Technology",
      courses: ["B.Tech", "B.E.", "M.Tech", "M.E.", "Diploma"],
      specializations: [
        "Computer Science & Engineering",
        "Information Technology",
        "Electronics & Communication",
        "Mechanical Engineering",
        "Civil Engineering",
        "AI & Data Science",
      ],
    },
    {
      id: "computer_applications",
      name: "Computer Applications & IT",
      courses: ["BCA", "MCA", "B.Sc Computer Science", "B.Sc IT"],
      specializations: [
        "Full Stack Web Development",
        "Software Engineering",
        "Cloud & DevOps",
        "Cybersecurity",
      ],
    },
    {
      id: "management",
      name: "Management & Business",
      courses: ["BBA", "MBA", "PGDM"],
      specializations: [
        "Marketing Management",
        "Finance & Banking",
        "Human Resources (HR)",
        "Operations & Supply Chain",
        "Business Analytics",
      ],
    },
    {
      id: "commerce",
      name: "Commerce & Accounting",
      courses: ["B.Com", "M.Com", "CA", "CS", "CMA"],
      specializations: [
        "Accounting & Taxation",
        "Banking & Finance",
        "Auditing & Corporate Law",
        "Financial Analysis",
      ],
    },
    {
      id: "arts_humanities",
      name: "Arts & Humanities",
      courses: ["BA", "MA", "BJMC"],
      specializations: [
        "Journalism & Mass Comm",
        "Psychology",
        "English Literature",
        "Economics",
      ],
    },
    {
      id: "science",
      name: "Pure & Applied Sciences",
      courses: ["B.Sc", "M.Sc"],
      specializations: [
        "Biotechnology",
        "Chemistry",
        "Physics",
        "Mathematics & Stats",
      ],
    },
    {
      id: "law",
      name: "Law & Legal Studies",
      courses: ["LLB", "BA LLB", "LLM"],
      specializations: [
        "Corporate Law",
        "Criminal & Civil Litigation",
        "IPR & Cyber Law",
      ],
    },
    {
      id: "medical_healthcare",
      name: "Medical, Pharmacy & Healthcare",
      courses: ["MBBS", "BDS", "B.Pharm", "B.Sc Nursing"],
      specializations: [
        "Clinical Practice",
        "Pharmaceutical Formulation",
        "Patient Care & Hospital Admin",
      ],
    },
  ],
  experience_levels: [
    "Student (1st / 2nd Year)",
    "Final Year Student",
    "Fresher / Recent Graduate",
    "Junior Professional (0-2 Years)",
    "Mid-Level Professional (2-5 Years)",
    "Senior Professional (5+ Years)",
    "Career Switcher",
  ],
  target_roles: [
    "Software Engineer (SDE 1 / Fresher)",
    "Frontend Developer (React / Next.js)",
    "Backend Developer (Python / Node / Java)",
    "Full Stack Developer",
    "Data Analyst / Data Scientist",
    "Business Development Associate (BDA)",
    "Management Trainee",
    "HR Recruiter / Generalist",
    "Product Manager / Associate PM",
    "Financial Analyst / Equity Research",
    "Accountant / Tax Consultant",
    "General / Other Role",
  ],
  languages: [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi (हिन्दी)" },
    { code: "hi-en", label: "Hinglish (Hindi + English)" },
    { code: "bn", label: "Bengali (বাংলা)" },
    { code: "ta", label: "Tamil (தமிழ்)" },
    { code: "te", label: "Telugu (తెలుగు)" },
    { code: "mr", label: "Marathi (मराठी)" },
    { code: "gu", label: "Gujarati (ગુજરાતી)" },
    { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
    { code: "ml", label: "Malayalam (മലയാളം)" },
    { code: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [options, setOptions] = useState<AcademicOptions>(FALLBACK_OPTIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [academicStream, setAcademicStream] = useState("engineering");
  const [course, setCourse] = useState("B.Tech");
  const [specialization, setSpecialization] = useState("Computer Science & Engineering");
  const [college, setCollege] = useState("");
  const [currentYear, setCurrentYear] = useState("Final Year Student");
  const [experienceLevel, setExperienceLevel] = useState("Fresher / Recent Graduate");
  const [targetRole, setTargetRole] = useState("Software Engineer (SDE 1 / Fresher)");
  const [careerGoal, setCareerGoal] = useState("Crack upcoming campus placement interviews");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Load dynamic options from backend if available
  useEffect(() => {
    authApi
      .getAcademicOptions()
      .then((data) => {
        if (data && data.streams?.length > 0) {
          setOptions(data);
        }
      })
      .catch(() => {
        // Fallback options already set
      });
  }, []);

  const selectedStreamObj: AcademicStream | undefined = options.streams.find(
    (s) => s.id === academicStream,
  );

  const handleStreamChange = (streamId: string) => {
    setAcademicStream(streamId);
    const found = options.streams.find((s) => s.id === streamId);
    if (found) {
      if (found.courses.length > 0) setCourse(found.courses[0]);
      if (found.specializations.length > 0) setSpecialization(found.specializations[0]);
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!targetRole.trim()) {
        setError("Please select or specify your target role.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await completeOnboarding({
        full_name: fullName.trim(),
        academic_stream: academicStream,
        course,
        specialization,
        college: college.trim() || undefined,
        current_year: currentYear,
        experience_level: experienceLevel,
        target_role: targetRole,
        career_goal: careerGoal.trim() || undefined,
        preferred_language: preferredLanguage,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4ff] dark:bg-[#0b1b29] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between pb-6">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary">Step {step} of 3</span>
          <div className="flex h-2 w-24 gap-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="mx-auto w-full max-w-2xl">
        <Card className="border-border/80 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              {step === 1 && <GraduationCap className="size-6" />}
              {step === 2 && <Briefcase className="size-6" />}
              {step === 3 && <Globe className="size-6" />}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {step === 1 && "Academic Background"}
              {step === 2 && "Career Goal & Target Role"}
              {step === 3 && "Interview Language & Preferences"}
            </CardTitle>
            <CardDescription className="text-xs max-w-md mx-auto">
              {step === 1 &&
                "MockMate AI tailors interview questions specifically to your academic stream and coursework."}
              {step === 2 &&
                "Tell us what job or role you are aiming for so the AI interviewer asks relevant scenarios."}
              {step === 3 &&
                "Select your preferred language. You can practice in English, Hindi, Hinglish, and more."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            {/* STEP 1: Academic Stream & Education */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicStream">Academic Category / Stream</Label>
                  <select
                    id="academicStream"
                    value={academicStream}
                    onChange={(e) => handleStreamChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {options.streams.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="course">Degree / Course</Label>
                    <select
                      id="course"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {selectedStreamObj?.courses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization / Branch</Label>
                    <select
                      id="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {selectedStreamObj?.specializations.map((sp) => (
                        <option key={sp} value={sp}>
                          {sp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentYear">Current Year / Status</Label>
                    <select
                      id="currentYear"
                      value={currentYear}
                      onChange={(e) => setCurrentYear(e.target.value)}
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="Final Year Student">Final Year Student</option>
                      <option value="Graduated">Graduated / Alum</option>
                      <option value="Working Professional">Working Professional</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="college">College or University (Optional)</Label>
                    <Input
                      id="college"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Delhi University / IIT / NIT"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Target Career & Role */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Job Role</Label>
                  <select
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {options.target_roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {options.experience_levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerGoal">Primary Career Goal</Label>
                  <Input
                    id="careerGoal"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. Crack campus placements / Switch to product company"
                  />
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-ink-70 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-primary">
                    <Sparkles className="size-3.5" /> Adaptive Questioning
                  </div>
                  <p>
                    Questions will be calibrated automatically to your target role:{" "}
                    <span className="font-semibold text-foreground">{targetRole}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: Language & Review */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Default Interview Language</Label>
                  <select
                    id="preferredLanguage"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {options.languages.map((l) => (
                      <option key={l.code} value={l.label}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Note: Website remains in English, but the AI interviewer speaks and understands your chosen language!
                  </p>
                </div>

                {/* Summary Card */}
                <div className="rounded-lg border border-border/80 bg-muted/40 p-4 space-y-2 text-xs">
                  <div className="font-semibold text-foreground flex items-center gap-1.5 pb-1 border-b border-border/60">
                    <CheckCircle2 className="size-4 text-emerald-600" /> Summary of Your Profile
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-ink-70 pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[0.68rem]">Student</span>
                      <span className="font-medium text-foreground">{fullName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[0.68rem]">Course & Stream</span>
                      <span className="font-medium text-foreground">
                        {course} ({selectedStreamObj?.name.split("&")[0]})
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[0.68rem]">Target Role</span>
                      <span className="font-medium text-foreground">{targetRole}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[0.68rem]">Interview Language</span>
                      <span className="font-medium text-foreground">{preferredLanguage}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  className="bg-brand-gradient hover:bg-brand-gradient text-white ml-auto"
                  onClick={handleNext}
                >
                  Next Step <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-brand-gradient hover:bg-brand-gradient text-white ml-auto"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Finalizing Profile...
                    </>
                  ) : (
                    <>
                      Go to Dashboard <CheckCircle2 className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center text-xs text-muted-foreground pt-6">
        MockMate AI — Designed for students across Engineering, Management, Commerce, Science, Law & Healthcare.
      </footer>
    </div>
  );
}
