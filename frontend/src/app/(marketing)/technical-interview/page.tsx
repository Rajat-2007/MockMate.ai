import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Cpu, Database, Server } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Technical Mock Interview Online — Branch Fundamentals & System Design",
  description:
    "Prepare for technical rounds across B.Tech, BCA, MCA and diploma programs with deep conceptual questions, DSA, databases, and OS.",
  alternates: { canonical: "/technical-interview" },
};

export default function TechnicalInterviewPage() {
  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title="Technical Mock Interview Preparation"
        description="Master core fundamentals: Data Structures, Algorithms, Operating Systems, Database Management, Computer Networks, and System Architecture."
        breadcrumb={[{ label: "Technical Interview" }]}
      >
        <div className="mt-6">
          <Button asChild className="bg-brand-gradient hover:bg-brand-gradient text-white shadow-md">
            <Link href="/signup">Start Free Technical Interview</Link>
          </Button>
        </div>
      </PageHero>

      <section className="container-page space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/80 p-5 bg-card">
            <Database className="size-8 text-primary mb-3" />
            <h3 className="font-bold text-base text-foreground">Databases & SQL</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Indexing strategies, ACID transactions, normalization vs denormalization, and execution plans.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Server className="size-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">Backend & Architecture</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              REST, WebSockets, caching with Redis, message queues, rate limiters, and microservices.
            </p>
          </Card>

          <Card className="border-border/80 p-5 bg-card">
            <Cpu className="size-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-base text-foreground">OS & Networks</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Process synchronization, memory management, TCP/IP handshake, DNS, and TLS handshakes.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
