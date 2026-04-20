/**
 * Replace `${key}` placeholders in a prompt template with the
 * corresponding values from `vars`. Phase 1 uses a single variable
 * `payload_json`; the renderer is intentionally simple (no Liquid /
 * Handlebars / escaping) — the template author is responsible for
 * prompt correctness.
 */
export function renderPromptTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`\${${key}}`, value);
  }
  return result;
}
