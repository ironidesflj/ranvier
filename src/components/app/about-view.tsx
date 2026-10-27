"use client";

import { BadgeCheck, BookOpen, ExternalLink, EyeOff, Ghost, Github, Heart, KeyRound, Linkedin, Lock, Mail, MessageCircle, Scale, ShieldCheck, Sparkles, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { SITE } from "@/lib/site";
import { hubHomeUrl } from "@/lib/axon/deep-links";

export function AboutView() {
  const { t, lang } = useLang();
  const { navigate } = useAppStore();

  /* Ícones dos pontos de privacidade (um por promessa — pedido do fundador
     2026-10-27: transparência de segurança no app; só fatos auditados). */
  const privacyIcons = [KeyRound, Mail, EyeOff, Ghost, Trash2];

  const sources = [
    { label: t.about.sources.examPage, href: "https://www.databricks.com/learn/certification/data-engineer-associate" },
    {
      label: t.about.sources.examGuide,
      href: "https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf",
    },
    { label: t.about.sources.docs, href: "https://docs.databricks.com/" },
    { label: t.about.sources.training, href: "https://www.databricks.com/learn/training/home" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">{t.about.title}</h1>
      </div>

      {/* Mission */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-primary" aria-hidden />
            {t.about.missionTitle}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">{t.about.missionDesc}</CardDescription>
        </CardHeader>
      </Card>

      {/* Sources */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden />
            {t.about.sourcesTitle}
          </CardTitle>
          <CardDescription>{t.about.sourcesDesc}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {sources.map((src) => (
            <a
              key={src.href}
              href={src.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 break-words">{src.label}</span>
            </a>
          ))}
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            {t.about.methodologyTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {t.about.methodology.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--noos-success)]" aria-hidden />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Privacy & security — audited facts, plain language (founder request 2026-10-27) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" aria-hidden />
            {t.about.privacyTitle}
          </CardTitle>
          <CardDescription>{t.about.privacyDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {t.about.privacyPoints.map((item, i) => {
              const Icon = privacyIcons[i] ?? BadgeCheck;
              return (
                <li key={i} className="flex gap-2.5 text-sm">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--noos-success)]" aria-hidden />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Author */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            {t.about.authorTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar className="h-16 w-16 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">IJ</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">{t.about.authorName}</p>
            <p className="text-xs font-medium text-primary">{t.about.authorRole}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.about.authorBio}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <a href={SITE.authorGithub} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Github className="h-4 w-4" />
                  {t.about.github}
                </Button>
              </a>
              <a href={SITE.authorLinkedin} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Linkedin className="h-4 w-4" />
                  {t.about.linkedin}
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact — one page, no forms in between */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-primary" aria-hidden />
            {t.about.contactTitle}
          </CardTitle>
          <CardDescription>{t.about.contactDesc}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {SITE.contactEmail && (
            <a href={`mailto:${SITE.contactEmail}`}>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4" />
                {t.about.email}
              </Button>
            </a>
          )}
          <a href={SITE.authorGithub} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Github className="h-4 w-4" />
              {t.about.github}
            </Button>
          </a>
          <a href={SITE.authorLinkedin} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Linkedin className="h-4 w-4" />
              {t.about.linkedin}
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Noos ecosystem */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
            {t.about.ecosystemTitle}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">{t.about.ecosystemDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <a href={hubHomeUrl(lang)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t.about.ecosystemLink}
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Licenses + tech */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4 text-primary" aria-hidden />
              {t.about.licenseTitle}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">{t.about.licenseDesc}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4 text-primary" aria-hidden />
              {t.about.techTitle}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">{t.about.techDesc}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="text-center">
        <Button onClick={() => navigate("study")}>{t.home.ctaStudy}</Button>
      </div>
    </div>
  );
}
