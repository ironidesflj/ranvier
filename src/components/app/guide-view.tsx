"use client";

import { ExternalLink, FileText, GraduationCap, Lightbulb, ListChecks } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { GUIDE_SECTIONS } from "@/data/guide";
import { AdSlot } from "@/components/app/ad-slot";

export function GuideView() {
  const { t, lang } = useLang();
  const { navigate } = useAppStore();

  const officialResources = [
    {
      icon: FileText,
      label: t.about.sources.examGuide,
      href: "https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf",
    },
    { icon: ExternalLink, label: t.about.sources.examPage, href: "https://www.databricks.com/learn/certification/data-engineer-associate" },
    { icon: GraduationCap, label: t.about.sources.training, href: "https://www.databricks.com/learn/training/home" },
    { icon: ExternalLink, label: t.about.sources.docs, href: "https://docs.databricks.com/" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.guide.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.guide.subtitle}</p>
      </div>

      {/* How it works */}
      <Card className="mb-6 border-dashed bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">{t.guide.howItWorksDesc}</p>
        </CardContent>
      </Card>

      {/* Tips */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <ListChecks className="h-5 w-5 text-primary" aria-hidden />
          {t.guide.tipsTitle}
        </h2>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <ul className="space-y-2.5">
              {t.guide.tips.map((tip) => (
                <li key={tip} className="flex gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Sections */}
      <div className="space-y-4">
        {GUIDE_SECTIONS.map((section) => (
          <Card key={section.code}>
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2 text-base">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {section.code}
                </span>
                {lang === "pt" ? section.titlePt : section.titleEn}
              </CardTitle>
              <CardDescription>{lang === "pt" ? section.summaryPt : section.summaryEn}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {(lang === "pt" ? section.pointsPt : section.pointsEn).map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-2" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {section.links.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <ExternalLink className="h-3 w-3" />
                      {lang === "pt" ? (link.titlePt ?? link.title) : link.title}
                    </Button>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Official resources */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t.guide.officialResources}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {officialResources.map((res) => (
            <a key={res.href} href={res.href} target="_blank" rel="noopener noreferrer" className="group">
              <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <res.icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm font-medium leading-snug group-hover:text-primary">{res.label}</p>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={() => navigate("study")}>{t.nav.study}</Button>
        <Button variant="outline" onClick={() => navigate("cert")}>
          {t.nav.cert}
        </Button>
      </div>

      <AdSlot placement="guide" className="mt-8" />
    </div>
  );
}
