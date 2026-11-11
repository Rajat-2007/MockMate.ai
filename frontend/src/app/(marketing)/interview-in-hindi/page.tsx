import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, MessageSquare, Mic, Sparkles } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Hindi AI Mock Interview — हिन्दी में इंटरव्यू की तैयारी",
  description:
    "हिन्दी भाषा में AI इंटरव्यू की तैयारी करें। अपनी मातृभाषा में बोलें और सटीक फीडबैक रिपोर्ट प्राप्त करें।",
  alternates: { canonical: "/interview-in-hindi" },
};

export default function HindiInterviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="हिन्दी में AI मॉक इंटरव्यू की तैयारी"
        description="भाषा आपकी सफलता में बाधा नहीं बननी चाहिए। MockMate AI में आप पूरी तरह हिन्दी में प्रश्न सुन सकते हैं और बोलकर उत्तर दे सकते हैं।"
        breadcrumb={[{ label: "Interview in Hindi" }]}
      >
        <div className="mt-6">
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup">मुफ़्त में अभ्यास शुरू करें (Start Free)</Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 p-5 bg-card">
            <Mic className="size-8 text-primary mb-3" />
            <h3 className="font-bold text-base text-foreground">हिन्दी वॉइस सपोर्ट</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              AI हिन्दी में प्रश्न पूछता है और आपके बोले गए हिन्दी शब्दों को समझकर तुरंत फॉलो-अप करता है।
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Globe className="size-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">तकनीकी शब्दों की शुद्धता</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              टेक्निकल टर्म्स (जैसे API, Database, Marketing) को सुरक्षित रखते हुए स्वाभाविक बातचीत।
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Sparkles className="size-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">हिन्दी रिपोर्ट</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              इंटरव्यू के बाद मिलने वाली फीडबैक रिपोर्ट भी आपकी चुनी गई भाषा में उपलब्ध कराई जाती है।
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
