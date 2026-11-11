"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

export default function ResumePage() {
  const { user, profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [resumes, setResumes] = useState([
    {
      id: "res-1",
      fileName: `${user?.full_name?.replace(/\s+/g, "_") || "Candidate"}_Resume_2026.pdf`,
      uploadedAt: "Yesterday at 3:15 PM",
      fileSize: "420 KB",
      skillsExtracted: [
        "React",
        "Next.js",
        "TypeScript",
        "FastAPI",
        "PostgreSQL",
        "REST APIs",
        "Docker",
        "Git",
      ],
      projectsDetected: [
        "E-Commerce Microservices Platform",
        "Real-time Chat & WebRTC Communication App",
      ],
      educationDetected: `${profile?.course || "BCA / Tech"} (${profile?.college || "University"})`,
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);

    // Simulate smart resume parsing
    setTimeout(() => {
      const newResume = {
        id: `res-${Date.now()}`,
        fileName: file.name,
        uploadedAt: "Just now",
        fileSize: `${Math.round(file.size / 1024)} KB`,
        skillsExtracted: [
          "Python",
          "Machine Learning",
          "Data Analysis",
          "SQL",
          "FastAPI",
          "Communication",
        ],
        projectsDetected: [
          "AI Mock Interview System",
          "Predictive Analytics Dashboard",
        ],
        educationDetected: `${profile?.course || "Degree"}`,
      };

      setResumes((prev) => [newResume, ...prev]);
      setIsUploading(false);
      setUploadSuccess(true);
    }, 1200);
  };

  const handleDelete = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Resume Intelligence & Storage
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Upload your resume in PDF or DOCX format. MockMate AI automatically parses your
          projects and technologies to ask authentic, project-specific interview questions.
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors">
        <CardContent className="flex flex-col items-center justify-center p-6 sm:p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            {isUploading ? (
              <Loader2 className="size-7 animate-spin" />
            ) : (
              <UploadCloud className="size-7" />
            )}
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground">
            {isUploading ? "Parsing resume with AI..." : "Drop your resume here, or browse"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Supports PDF and DOCX files up to 5MB. Files are stored securely and privately.
          </p>

          <label className="mt-4 cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-md bg-brand-gradient hover:bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-105">
              <Plus className="size-3.5" /> Select Resume File
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {uploadSuccess && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="size-3.5" /> Resume uploaded and parsed successfully!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Resumes List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Saved Resumes ({resumes.length})</h2>

        {resumes.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground border-border/80">
            No resumes uploaded yet. Upload one above to practice resume-based interview rounds!
          </Card>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <Card key={resume.id} className="border-border/80 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-3 flex flex-row items-center justify-between border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {resume.fileName}
                      </CardTitle>
                      <CardDescription className="text-[0.68rem]">
                        Uploaded {resume.uploadedAt} • {resume.fileSize}
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(resume.id)}
                    className="size-8 text-destructive hover:bg-destructive/10"
                    aria-label="Delete resume"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs">
                  {/* Extracted Skills */}
                  <div>
                    <span className="text-[0.68rem] font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                      Extracted Skills & Technologies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.skillsExtracted.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[0.68rem] font-medium text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Detected Projects */}
                  <div>
                    <span className="text-[0.68rem] font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                      Identified Projects for Questions:
                    </span>
                    <div className="space-y-1">
                      {resume.projectsDetected.map((proj) => (
                        <div key={proj} className="flex items-center gap-1.5 text-foreground/90">
                          <Sparkles className="size-3 text-primary shrink-0" />
                          <span>{proj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
