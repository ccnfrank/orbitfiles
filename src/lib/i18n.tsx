import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "es", label: "ES", name: "Español" },
  { code: "it", label: "IT", name: "Italiano" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "pl", label: "PL", name: "Polski" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

const en = {
  language: "Language",
  searchPlaceholder: "Search files and folders…",
  emptyNoFolders: "Load a folder to start searching.",
  emptyNoResults: "No results. Try another search.",
  poweredBy: "Powered by",
  githubLabel: "GitHub: ccnfrank",
  loadFolder: "Load folder",
  loadAnother: "Load another folder ({count} loaded)",
  globeLabel: "Folders on the globe. Use arrow keys to move between folders, Enter to select one, Escape to clear.",
  filesIn: "Files in {name}",
  reading: "Reading…",
  fileOne: "{n} file",
  fileFew: "{n} files",
  fileOther: "{n} files",
  noFilesInFolder: "No files in this folder.",
  view: "View",
  listView: "List view",
  listTitle: "List",
  thumbView: "Thumbnail view",
  thumbTitle: "Thumbnails",
  play: "Play {name}",
  pause: "Pause {name}",
  playTitle: "Play",
  pauseTitle: "Pause",
  close: "Close",
  helpLabel: "Help",
  helpTitle: "How Orbit Files works",
  aboutLabel: "About",
  aboutTitle: "About Orbit Files",
  aboutText: "Browse the folders and files on your computer as points on a globe.",
  versionLabel: "Version",
  createdLabel: "Created",
  cantOpen: "This file could not be opened.",
  loading: "Loading…",
  noPreview: "No preview for this file type.",
  truncated: "Showing the first {size}.",
  unknownType: "Unknown type",
};

export type Dict = typeof en;
type Key = keyof Dict;

const pt: Dict = {
  language: "Idioma",
  searchPlaceholder: "Pesquisar arquivos e pastas…",
  emptyNoFolders: "Carregue uma pasta para começar a pesquisar.",
  emptyNoResults: "Nenhum resultado. Tente outra busca.",
  poweredBy: "Desenvolvido por",
  githubLabel: "GitHub: ccnfrank",
  loadFolder: "Carregar pasta",
  loadAnother: "Carregar outra pasta ({count} carregadas)",
  globeLabel: "Pastas no globo. Use as setas para mover entre pastas, Enter para selecionar uma e Escape para limpar.",
  filesIn: "Arquivos em {name}",
  reading: "Lendo…",
  fileOne: "{n} arquivo",
  fileFew: "{n} arquivos",
  fileOther: "{n} arquivos",
  noFilesInFolder: "Nenhum arquivo nesta pasta.",
  view: "Visualização",
  listView: "Visualização em lista",
  listTitle: "Lista",
  thumbView: "Visualização em miniaturas",
  thumbTitle: "Miniaturas",
  play: "Reproduzir {name}",
  pause: "Pausar {name}",
  playTitle: "Reproduzir",
  pauseTitle: "Pausar",
  close: "Fechar",
  helpLabel: "Ajuda",
  helpTitle: "Como o Orbit Files funciona",
  aboutLabel: "Sobre",
  aboutTitle: "Sobre o Orbit Files",
  aboutText: "Explore as pastas e os arquivos do seu computador como pontos em um globo.",
  versionLabel: "Versão",
  createdLabel: "Criado em",
  cantOpen: "Não foi possível abrir este arquivo.",
  loading: "Carregando…",
  noPreview: "Sem pré-visualização para este tipo de arquivo.",
  truncated: "Mostrando os primeiros {size}.",
  unknownType: "Tipo desconhecido",
};

const de: Dict = {
  language: "Sprache",
  searchPlaceholder: "Dateien und Ordner suchen…",
  emptyNoFolders: "Lade einen Ordner, um die Suche zu starten.",
  emptyNoResults: "Keine Ergebnisse. Versuche eine andere Suche.",
  poweredBy: "Bereitgestellt von",
  githubLabel: "GitHub: ccnfrank",
  loadFolder: "Ordner laden",
  loadAnother: "Anderen Ordner laden ({count} geladen)",
  globeLabel: "Ordner auf dem Globus. Mit den Pfeiltasten zwischen Ordnern wechseln, Enter wählt einen aus, Escape hebt die Auswahl auf.",
  filesIn: "Dateien in {name}",
  reading: "Wird gelesen…",
  fileOne: "{n} Datei",
  fileFew: "{n} Dateien",
  fileOther: "{n} Dateien",
  noFilesInFolder: "Keine Dateien in diesem Ordner.",
  view: "Ansicht",
  listView: "Listenansicht",
  listTitle: "Liste",
  thumbView: "Miniaturansicht",
  thumbTitle: "Miniaturen",
  play: "{name} abspielen",
  pause: "{name} pausieren",
  playTitle: "Abspielen",
  pauseTitle: "Pausieren",
  close: "Schließen",
  helpLabel: "Hilfe",
  helpTitle: "So funktioniert Orbit Files",
  aboutLabel: "Info",
  aboutTitle: "Über Orbit Files",
  aboutText: "Durchsuche die Ordner und Dateien deines Computers als Punkte auf einem Globus.",
  versionLabel: "Version",
  createdLabel: "Erstellt am",
  cantOpen: "Diese Datei konnte nicht geöffnet werden.",
  loading: "Wird geladen…",
  noPreview: "Keine Vorschau für diesen Dateityp.",
  truncated: "Es werden die ersten {size} angezeigt.",
  unknownType: "Unbekannter Typ",
};

const es: Dict = {
  language: "Idioma",
  searchPlaceholder: "Buscar archivos y carpetas…",
  emptyNoFolders: "Carga una carpeta para empezar a buscar.",
  emptyNoResults: "Sin resultados. Prueba con otra búsqueda.",
  poweredBy: "Desarrollado por",
  githubLabel: "GitHub: ccnfrank",
  loadFolder: "Cargar carpeta",
  loadAnother: "Cargar otra carpeta ({count} cargadas)",
  globeLabel: "Carpetas en el globo. Usa las flechas para moverte entre carpetas, Enter para elegir una y Escape para borrar.",
  filesIn: "Archivos en {name}",
  reading: "Leyendo…",
  fileOne: "{n} archivo",
  fileFew: "{n} archivos",
  fileOther: "{n} archivos",
  noFilesInFolder: "No hay archivos en esta carpeta.",
  view: "Vista",
  listView: "Vista de lista",
  listTitle: "Lista",
  thumbView: "Vista de miniaturas",
  thumbTitle: "Miniaturas",
  play: "Reproducir {name}",
  pause: "Pausar {name}",
  playTitle: "Reproducir",
  pauseTitle: "Pausar",
  close: "Cerrar",
  helpLabel: "Ayuda",
  helpTitle: "Cómo funciona Orbit Files",
  aboutLabel: "Acerca de",
  aboutTitle: "Acerca de Orbit Files",
  aboutText: "Explora las carpetas y archivos de tu ordenador como puntos en un globo.",
  versionLabel: "Versión",
  createdLabel: "Creado el",
  cantOpen: "No se pudo abrir este archivo.",
  loading: "Cargando…",
  noPreview: "No hay vista previa para este tipo de archivo.",
  truncated: "Mostrando los primeros {size}.",
  unknownType: "Tipo desconocido",
};

const it: Dict = {
  language: "Lingua",
  searchPlaceholder: "Cerca file e cartelle…",
  emptyNoFolders: "Carica una cartella per iniziare la ricerca.",
  emptyNoResults: "Nessun risultato. Prova un'altra ricerca.",
  poweredBy: "Realizzato da",
  githubLabel: "GitHub: ccnfrank",
  loadFolder: "Carica cartella",
  loadAnother: "Carica un'altra cartella ({count} caricate)",
  globeLabel: "Cartelle sul globo. Usa le frecce per spostarti tra le cartelle, Invio per sceglierne una, Esc per deselezionare.",
  filesIn: "File in {name}",
  reading: "Lettura in corso…",
  fileOne: "{n} file",
  fileFew: "{n} file",
  fileOther: "{n} file",
  noFilesInFolder: "Nessun file in questa cartella.",
  view: "Vista",
  listView: "Vista elenco",
  listTitle: "Elenco",
  thumbView: "Vista miniature",
  thumbTitle: "Miniature",
  play: "Riproduci {name}",
  pause: "Metti in pausa {name}",
  playTitle: "Riproduci",
  pauseTitle: "Pausa",
  close: "Chiudi",
  helpLabel: "Aiuto",
  helpTitle: "Come funziona Orbit Files",
  aboutLabel: "Info",
  aboutTitle: "Info su Orbit Files",
  aboutText: "Esplora le cartelle e i file del tuo computer come punti su un globo.",
  versionLabel: "Versione",
  createdLabel: "Creato il",
  cantOpen: "Impossibile aprire questo file.",
  loading: "Caricamento…",
  noPreview: "Nessuna anteprima per questo tipo di file.",
  truncated: "Vengono mostrati i primi {size}.",
  unknownType: "Tipo sconosciuto",
};

const fr: Dict = {
  language: "Langue",
  searchPlaceholder: "Rechercher des fichiers et des dossiers…",
  emptyNoFolders: "Chargez un dossier pour commencer la recherche.",
  emptyNoResults: "Aucun résultat. Essayez une autre recherche.",
  poweredBy: "Propulsé par",
  githubLabel: "GitHub : ccnfrank",
  loadFolder: "Charger un dossier",
  loadAnother: "Charger un autre dossier ({count} chargés)",
  globeLabel: "Dossiers sur le globe. Flèches pour passer d'un dossier à l'autre, Entrée pour en choisir un, Échap pour effacer.",
  filesIn: "Fichiers dans {name}",
  reading: "Lecture…",
  fileOne: "{n} fichier",
  fileFew: "{n} fichiers",
  fileOther: "{n} fichiers",
  noFilesInFolder: "Aucun fichier dans ce dossier.",
  view: "Affichage",
  listView: "Affichage en liste",
  listTitle: "Liste",
  thumbView: "Affichage en miniatures",
  thumbTitle: "Miniatures",
  play: "Lire {name}",
  pause: "Mettre en pause {name}",
  playTitle: "Lire",
  pauseTitle: "Pause",
  close: "Fermer",
  helpLabel: "Aide",
  helpTitle: "Comment fonctionne Orbit Files",
  aboutLabel: "À propos",
  aboutTitle: "À propos d'Orbit Files",
  aboutText: "Parcourez les dossiers et fichiers de votre ordinateur sous forme de points sur un globe.",
  versionLabel: "Version",
  createdLabel: "Créé le",
  cantOpen: "Impossible d'ouvrir ce fichier.",
  loading: "Chargement…",
  noPreview: "Aperçu non disponible pour ce type de fichier.",
  truncated: "Affichage des {size} premiers.",
  unknownType: "Type inconnu",
};

const pl: Dict = {
  language: "Język",
  searchPlaceholder: "Szukaj plików i folderów…",
  emptyNoFolders: "Wczytaj folder, aby zacząć wyszukiwanie.",
  emptyNoResults: "Brak wyników. Spróbuj innego wyszukiwania.",
  poweredBy: "Zasilane przez",
  githubLabel: "GitHub: ccnfrank",
  loadFolder: "Wczytaj folder",
  loadAnother: "Wczytaj kolejny folder (wczytano: {count})",
  globeLabel: "Foldery na globusie. Strzałki przechodzą między folderami, Enter wybiera, Escape czyści zaznaczenie.",
  filesIn: "Pliki w: {name}",
  reading: "Odczytywanie…",
  fileOne: "{n} plik",
  fileFew: "{n} pliki",
  fileOther: "{n} plików",
  noFilesInFolder: "Brak plików w tym folderze.",
  view: "Widok",
  listView: "Widok listy",
  listTitle: "Lista",
  thumbView: "Widok miniatur",
  thumbTitle: "Miniatury",
  play: "Odtwórz {name}",
  pause: "Wstrzymaj {name}",
  playTitle: "Odtwórz",
  pauseTitle: "Wstrzymaj",
  close: "Zamknij",
  helpLabel: "Pomoc",
  helpTitle: "Jak działa Orbit Files",
  aboutLabel: "O aplikacji",
  aboutTitle: "O Orbit Files",
  aboutText: "Przeglądaj foldery i pliki na komputerze jako punkty na globusie.",
  versionLabel: "Wersja",
  createdLabel: "Utworzono",
  cantOpen: "Nie udało się otworzyć tego pliku.",
  loading: "Wczytywanie…",
  noPreview: "Brak podglądu dla tego typu pliku.",
  truncated: "Pokazano pierwsze {size}.",
  unknownType: "Nieznany typ",
};

const dictionaries: Record<Lang, Dict> = { en, pt, de, es, it, fr, pl };

const STORAGE_KEY = "orbit-files-lang";
const CODES = LANGUAGES.map((l) => l.code as string);

function storedLang(): Lang {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && CODES.includes(value)) return value as Lang;
  } catch {
    // Storage can be blocked; fall back to English.
  }
  return "en";
}

type Vars = Record<string, string | number>;

type I18n = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Text for a key, with {placeholders} filled from `vars`. */
  t: (key: Key, vars?: Vars) => string;
  /** The file-count text for `n`, in the right plural form for the language. */
  files: (n: number) => string;
};

const Ctx = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(storedLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Remembering the choice is optional.
    }
  }, []);

  const value = useMemo<I18n>(() => {
    const dict = dictionaries[lang];
    const t = (key: Key, vars?: Vars) => {
      let text: string = dict[key];
      if (vars) {
        for (const [name, v] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(v));
      }
      return text;
    };
    const files = (n: number) => {
      const rule = new Intl.PluralRules(lang).select(n);
      const key: Key = rule === "one" ? "fileOne" : rule === "few" ? "fileFew" : "fileOther";
      return t(key, { n });
    };
    return { lang, setLang, t, files };
  }, [lang, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(Ctx);
  if (!value) throw new Error("useI18n must be used inside LanguageProvider");
  return value;
}
