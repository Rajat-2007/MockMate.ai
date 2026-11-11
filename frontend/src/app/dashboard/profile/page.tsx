"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";

export default function ProfilePage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading profile...
      </div>
    );
  }

  return <ProfileForm />;
}

function ProfileForm() {
  const { user, profile, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || "");
  const academicStream = profile?.academic_stream || "engineering";
  const [course, setCourse] = useState(profile?.course || "B.Tech");
  const [specialization, setSpecialization] = useState(profile?.specialization || "Computer Science");
  const [college, setCollege] = useState(profile?.college || "");
  const [currentYear, setCurrentYear] = useState(profile?.current_year || "Final Year Student");
  const experienceLevel = profile?.experience_level || "Fresher / Recent Graduate";
  const [targetRole, setTargetRole] = useState(profile?.target_role || "Software Engineer");
  const [careerGoal, setCareerGoal] = useState(profile?.career_goal || "");
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || "English");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      await updateProfile({
        full_name: fullName.trim(),
        academic_stream: academicStream,
        course,
        specialization,
        college,
        current_year: currentYear,
        experience_level: experienceLevel,
        target_role: targetRole,
        career_goal: careerGoal,
        preferred_language: preferredLanguage,
      });

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Student Profile & Interview Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Update your academic credentials, job target, and preferred language. The AI interviewer
          adapts question difficulty and domains based on this data.
        </p>
      </div>

      <Card className="border-border/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Academic & Career Details</CardTitle>
          <CardDescription className="text-xs">
            Changes will take effect in all future mock interview sessions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMsg && (
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="size-4" /> Profile updated successfully!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Degree / Course</Label>
                <Input
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech / BCA / MBA / B.Com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization / Major</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Computer Science / Finance"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college">College / University</Label>
                <Input
                  id="college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Delhi University / IIT / NIT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentYear">Year of Study</Label>
                <select
                  id="currentYear"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-sm"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year Student">Final Year Student</option>
                  <option value="Graduated">Graduated / Alum</option>
                  <option value="Working Professional">Working Professional</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Job Role</Label>
                <Input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer / Financial Analyst"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">Default Spoken Language</Label>
                <select
                  id="preferredLanguage"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-sm"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Hinglish">Hinglish (Hindi + English)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="Malayalam">Malayalam (മലയാളം)</option>
                  <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerGoal">Career Objective</Label>
              <Input
                id="careerGoal"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Crack top tier product company placement drives"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="bg-brand-gradient hover:bg-brand-gradient text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" /> Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
