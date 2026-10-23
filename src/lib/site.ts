/**
 * Site-wide constants (contacts, author, ecosystem links).
 * Single source of truth — the footer "Contact" and the About page read from here.
 */

export const SITE = {
  appName: "Ranvier",
  authorName: "Ironides Junior",
  authorGithub: "https://github.com/ironidesflj",
  authorLinkedin: "https://www.linkedin.com/in/ironjunior/",
  /** Professional contact e-mail. Empty = hidden (set it here when defined). */
  contactEmail: "",
} as const;
