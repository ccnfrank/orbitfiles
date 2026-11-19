import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CircleHelp, Info } from "lucide-react";
import { Dialog } from "./Dialog";
import { HELP } from "../lib/help";
import { APP_CREATED, APP_VERSION } from "../lib/app-info";
import { useI18n } from "../lib/i18n";

/** Question-mark button for the top bar. Opens the help guide. */
export function HelpButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="learning-icon-btn"
        onClick={() => setOpen(true)}
        aria-label={t("helpLabel")}
        title={t("helpLabel")}
      >
        <CircleHelp size={17} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <Dialog
            key="help"
            title={t("helpTitle")}
            icon={<CircleHelp size={20} strokeWidth={1.8} aria-hidden="true" />}
            onClose={close}
          >
            <HelpGuide />
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

/** Info button in the footer, next to the GitHub link. Opens the version and creation date. */
export function InfoButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="learning-credit-info"
        onClick={() => setOpen(true)}
        aria-label={t("aboutLabel")}
        title={t("aboutLabel")}
      >
        <Info size={17} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <Dialog
            key="about"
            title={t("aboutTitle")}
            icon={<Info size={20} strokeWidth={1.8} aria-hidden="true" />}
            onClose={close}
          >
            <AboutBody />
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

function HelpGuide() {
  const { lang } = useI18n();
  return (
    <div className="learning-guide">
      {HELP[lang].map((section, i) => (
        <section key={i} className="learning-guide-section">
          <h3>{section.title}</h3>
          {section.intro && <p>{section.intro}</p>}
          <ul>
            {section.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function AboutBody() {
  const { lang, t } = useI18n();
  // Noon avoids a date shift in time zones west of UTC.
  const created = new Date(`${APP_CREATED}T12:00:00`).toLocaleDateString(lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="learning-about">
      <p>{t("aboutText")}</p>
      <dl>
        <div>
          <dt>{t("versionLabel")}</dt>
          <dd>{APP_VERSION}</dd>
        </div>
        <div>
          <dt>{t("createdLabel")}</dt>
          <dd>{created}</dd>
        </div>
      </dl>
    </div>
  );
}
