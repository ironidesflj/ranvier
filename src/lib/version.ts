/**
 * Single source of truth for the app version (founder decision 2026-10-25:
 * version strings used to be duplicated across package.json, i18n, sw.js and
 * offline.html and drifted). Bump here (and package.json/sw.js/offline.html
 * for the release artifacts) in the same batch, per the SDD update rule.
 *
 * The Whats-new dialog keys off this value: it shows once per user per
 * version change (localStorage "ranvier:whatsnew:seen").
 */
export const APP_VERSION = "1.6.0";
