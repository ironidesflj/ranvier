"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LogIn, Lock, UserPlus, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/components/app/language-provider";
import { useAppStore } from "@/store/app-store";
import { api, ApiError } from "@/lib/api-client";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, f } = useLang();
  const { navigate } = useAppStore();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(mode: "login" | "register") {
    setLoading(true);
    setError(null);
    try {
      const res =
        mode === "login"
          ? await api.login(email.trim(), password)
          : await api.register(email.trim(), password, name.trim() || undefined);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await queryClient.invalidateQueries({ queryKey: ["progress"] });
      await queryClient.invalidateQueries({ queryKey: ["attempts"] });
      if (res.mergedAttempts > 0) {
        toast.success(f(t.auth.mergedToast, { count: res.mergedAttempts }));
      }
      onClose();
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401 || err.status === 409)) {
        setError(err.message);
      } else {
        setError(t.auth.authErrorGeneric);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-normal tracking-[-0.02em]">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t.app.name}
          </DialogTitle>
          <DialogDescription>{t.auth.anonNote}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t.auth.loginTitle}</TabsTrigger>
            <TabsTrigger value="register">{t.auth.registerTitle}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 pt-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit("login");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">{t.auth.email}</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t.auth.password}</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {t.auth.loginCta}
              </Button>
              <p className="text-xs text-muted-foreground text-center">{t.auth.sessionNote}</p>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 pt-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit("register");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="reg-name">{t.auth.name}</Label>
                <Input id="reg-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">{t.auth.email}</Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">{t.auth.password}</Label>
                <Input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {t.auth.registerCta}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Reasseguro de privacidade no ponto exato da decisão (pedido do
            fundador 2026-10-27) — fatos auditados, link para a seção completa. */}
        <div className="mt-4 border-t pt-3">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--noos-success)]" aria-hidden />
            <span>
              {t.auth.privacyNote}{" "}
              <button
                type="button"
                className="font-medium underline underline-offset-2 transition-colors hover:text-foreground"
                onClick={() => {
                  onClose();
                  navigate("about");
                }}
              >
                {t.auth.privacyLink}
              </button>
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
