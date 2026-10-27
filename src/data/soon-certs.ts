/**
 * Certificações "em breve" (patch v1.1 §9).
 *
 * Regras do patch:
 *  - Código e nome REAIS, chip "em breve", NÃO clicáveis, sem data prometida.
 *  - "Em breve é um estado, não um teaser" — quando uma certificação entra
 *    em produção, ela passa a viver no banco (tabela certifications) e sai
 *    desta lista; o catálogo tem versão.
 *  - Contraste AA no chip (muted sobre superfície — verificado nos tokens).
 *
 * A escolha reflete o escopo do produto: ecossistema Microsoft/Azure &
 * Databricks. DBDEA (Databricks) é a única disponível hoje.
 */
export interface SoonCert {
  /** Código oficial do exame (ex.: "AI-900"). */
  code: string;
  nameEn: string;
  namePt: string;
}

export const SOON_CERTS: SoonCert[] = [
  { code: "AI-900", nameEn: "Azure AI Fundamentals", namePt: "Fundamentos de IA do Azure" },
  { code: "DP-900", nameEn: "Azure Data Fundamentals", namePt: "Fundamentos de dados no Azure" },
  { code: "PL-300", nameEn: "Power BI Data Analyst", namePt: "Analista de dados Power BI" },
  { code: "SC-900", nameEn: "Security, Compliance, and Identity Fundamentals", namePt: "Segurança, conformidade e identidade" },
  { code: "AZ-104", nameEn: "Azure Administrator Associate", namePt: "Administrador do Azure" },
];

/** Linha compacta "em breve" do bilhete da landing (patch §7.4). */
export const SOON_LINE_CODES = ["AI-900", "DP-900", "PL-300"];
