import { LANGUAGES, useI18n } from "../lib/i18n";

/** Segmented language switch in the top-right corner, styled like the reference app. */
export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="learning-lang" role="group" aria-label={t("language")}>
      <div className="learning-lang-switch">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            className="learning-lang-btn"
            aria-pressed={lang === l.code}
            aria-label={l.name}
            title={l.name}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
