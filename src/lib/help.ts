import type { Lang } from "./i18n";

/** One part of the help guide: a heading, an optional intro, and a list of points. */
export type HelpSection = { title: string; intro?: string; items: string[] };

const en: HelpSection[] = [
  {
    title: "Getting started",
    intro: "Orbit Files shows the folders and files of a folder on your computer as points on a globe.",
    items: [
      "Click the folder button next to the search field to load a folder. Chrome, Edge and other Chromium browsers open the system folder picker. Firefox and Safari open a file dialog that reads the same folder.",
      "You can also drag a folder from Finder or Explorer and drop it anywhere on the page.",
      "Your files stay on your computer. Orbit Files reads them in the browser and never uploads them.",
      "Loading another folder replaces the current one.",
    ],
  },
  {
    title: "What the points mean",
    items: [
      "Each subfolder of the loaded folder is one point on the globe.",
      "Each file placed directly in the loaded folder (not inside a subfolder) is also a point.",
      "Files inside subfolders are not points. Find them with search, or open their folder.",
      "Hover over a point to see its name.",
      "The faint dots in the background are decoration.",
    ],
  },
  {
    title: "Rotating the globe",
    items: [
      "The globe turns by itself, one full turn every 60 seconds.",
      "Drag with the mouse, or with a finger on a touch screen, to turn the globe. Dragging up or down tilts it, within a limit.",
      "Auto-spin pauses while you drag and resumes 1.5 seconds after you let go.",
      "A press that barely moves counts as a click on the point under the pointer. Dragging does not select anything.",
      "Points send out soft radar pulses as they face you. This is visual only.",
      "Text is not selected while you drag.",
    ],
  },
  {
    title: "Opening folders and files",
    items: [
      "Click a folder point to list its files in the panel under the search field.",
      "Click a file point to open that file in the preview window.",
      "Click another folder point to switch. Click outside the panel to close it.",
      "Press Escape to clear the selection.",
    ],
  },
  {
    title: "Searching",
    intro: "Search finds folders and files anywhere in the loaded folder, including inside every subfolder.",
    items: [
      "Search matches names only, not what is inside the files.",
      "Every word you type must appear in the name. Names that start with your text are listed first.",
      "With an empty search, the first five folders are shown.",
      "The globe turns to the best match and marks it with a ring.",
      "Choose a result with the mouse, or move with the arrow keys and press Enter. A folder result selects that folder. A file result opens the file.",
      "Up to 40 results are listed. Type more words to narrow them down.",
      "When results include images, PDFs or audio, switch between list and thumbnail view above the results.",
    ],
  },
  {
    title: "Viewing files",
    items: [
      "In a folder's panel, use the List and Thumbnails buttons to change the view. Thumbnails appear when the folder has images, PDFs, Photoshop (PSD), TIFF or audio files.",
      "Click a file, or its thumbnail, to open it in the preview window.",
      "The preview shows images, PDFs, videos, audio and text files. Text previews show the first 200 KB. Other types have no preview.",
      "Close the preview with the close button, by clicking the dark background, or with Escape.",
    ],
  },
  {
    title: "Audio",
    items: [
      "Audio files show a waveform. The bars fill in as the track plays.",
      "Use the play button on an audio file in the list or thumbnail view to play it without opening the preview.",
      "Only one audio file plays at a time. Starting another one stops the current one.",
      "If the browser cannot decode an audio file, it shows a label instead of a waveform.",
    ],
  },
  {
    title: "Language and info",
    items: [
      "Use EN, PT, DE, ES, IT, FR and PL at the top right to change the language. Your choice is remembered in this browser.",
      "The question-mark button at the top right opens this guide.",
      "The info button next to the GitHub link shows the app version and creation date.",
    ],
  },
  {
    title: "Keyboard",
    items: [
      "Tab moves focus to the search field, the load button and the globe.",
      "On the globe: arrow keys move between folder points, Enter or Space selects the focused point, and Escape clears the selection.",
      "In the search field: arrow down opens the results, arrow keys move between them, Enter picks one, and Escape closes the list.",
      "In the preview window: Escape closes it.",
    ],
  },
  {
    title: "Good to know",
    items: [
      "The loaded folder is kept in the page's memory. Reloading the page clears it, so load the folder again.",
      "Firefox and Safari only report folders that contain files, so empty subfolders do not appear there.",
      "Very large folders take a moment to read before search finds every file.",
      "The browser can only preview formats it supports, so some files have no preview.",
    ],
  },
];

const pt: HelpSection[] = [
  {
    title: "Primeiros passos",
    intro: "O Orbit Files mostra as pastas e os arquivos de uma pasta do seu computador como pontos em um globo.",
    items: [
      "Clique no botão de pasta ao lado do campo de busca para carregar uma pasta. O Chrome, o Edge e outros navegadores baseados no Chromium abrem o seletor de pastas do sistema. O Firefox e o Safari abrem uma janela de arquivos que lê a mesma pasta.",
      "Você também pode arrastar uma pasta do Finder ou do Explorador de Arquivos e soltá-la em qualquer lugar da página.",
      "Seus arquivos continuam no seu computador. O Orbit Files lê os arquivos no navegador e nunca os envia para a internet.",
      "Carregar outra pasta substitui a atual.",
    ],
  },
  {
    title: "O que cada ponto representa",
    items: [
      "Cada subpasta da pasta carregada é um ponto no globo.",
      "Cada arquivo que está diretamente na pasta carregada (e não dentro de uma subpasta) também é um ponto.",
      "Arquivos dentro de subpastas não são pontos. Encontre-os pela busca ou abra a pasta deles.",
      "Passe o mouse sobre um ponto para ver o nome dele.",
      "Os pontos tênues no fundo são apenas decoração.",
    ],
  },
  {
    title: "Girando o globo",
    items: [
      "O globo gira sozinho, uma volta completa a cada 60 segundos.",
      "Arraste com o mouse (ou com o dedo, em telas sensíveis ao toque) para girar o globo. Arrastar para cima ou para baixo inclina o globo, até um limite.",
      "A rotação automática pausa enquanto você arrasta e recomeça 1,5 segundo depois de soltar.",
      "Um toque que quase não se move conta como clique no ponto sob o cursor. Arrastar não seleciona nada.",
      "Os pontos emitem pulsos suaves de radar quando estão voltados para você. É apenas visual.",
      "O texto não é selecionado enquanto você arrasta.",
    ],
  },
  {
    title: "Abrindo pastas e arquivos",
    items: [
      "Clique em um ponto de pasta para listar os arquivos dela no painel abaixo do campo de busca.",
      "Clique em um ponto de arquivo para abri-lo na janela de visualização.",
      "Clique em outro ponto de pasta para trocar. Clique fora do painel para fechá-lo.",
      "Pressione Esc para limpar a seleção.",
    ],
  },
  {
    title: "Pesquisando",
    intro: "A busca encontra pastas e arquivos em toda a pasta carregada, inclusive dentro de todas as subpastas.",
    items: [
      "A busca considera apenas os nomes, não o conteúdo dos arquivos.",
      "Todas as palavras digitadas precisam aparecer no nome. Os nomes que começam com o texto digitado aparecem primeiro.",
      "Com o campo vazio, são mostradas as cinco primeiras pastas.",
      "O globo gira até o melhor resultado e o marca com um anel.",
      "Escolha um resultado com o mouse, ou use as setas do teclado e pressione Enter. Uma pasta seleciona essa pasta no globo. Um arquivo abre o arquivo.",
      "São listados até 40 resultados. Digite mais palavras para refinar.",
      "Quando os resultados incluem imagens, PDFs ou áudios, alterne entre lista e miniaturas acima dos resultados.",
    ],
  },
  {
    title: "Visualizando arquivos",
    items: [
      "No painel de uma pasta, use os botões Lista e Miniaturas para trocar a visualização. As miniaturas aparecem quando a pasta tem imagens, PDFs, arquivos do Photoshop (PSD), TIFF ou áudio.",
      "Clique em um arquivo, ou na miniatura dele, para abri-lo na janela de visualização.",
      "A visualização mostra imagens, PDFs, vídeos, áudios e arquivos de texto. Textos mostram os primeiros 200 KB. Outros tipos não têm visualização.",
      "Feche a visualização com o botão fechar, clicando no fundo escuro ou com Esc.",
    ],
  },
  {
    title: "Áudio",
    items: [
      "Arquivos de áudio mostram uma forma de onda. As barras são preenchidas conforme a faixa toca.",
      "Use o botão de reproduzir em um áudio na lista ou nas miniaturas para tocá-lo sem abrir a visualização.",
      "Só um áudio toca por vez. Ao iniciar outro, o atual para.",
      "Se o navegador não conseguir decodificar um áudio, ele mostra um rótulo no lugar da forma de onda.",
    ],
  },
  {
    title: "Idioma e informações",
    items: [
      "Use EN, PT, DE, ES, IT, FR e PL no canto superior direito para mudar o idioma. Sua escolha fica salva neste navegador.",
      "O botão de interrogação no canto superior direito abre este guia.",
      "O botão de info ao lado do link do GitHub mostra a versão do app e a data de criação.",
    ],
  },
  {
    title: "Teclado",
    items: [
      "Tab move o foco entre o campo de busca, o botão de carregar pasta e o globo.",
      "No globo: as setas se movem entre os pontos de pasta, Enter ou Espaço seleciona o ponto em foco e Esc limpa a seleção.",
      "No campo de busca: a seta para baixo abre os resultados; as setas se movem entre eles; Enter escolhe um; Esc fecha a lista.",
      "Na visualização: Esc fecha.",
    ],
  },
  {
    title: "Bom saber",
    items: [
      "A pasta carregada fica na memória da página. Recarregar a página a limpa, então carregue a pasta de novo.",
      "Firefox e Safari só informam pastas que contêm arquivos, então subpastas vazias não aparecem nesses navegadores.",
      "Pastas muito grandes levam um tempo para serem lidas antes de a busca encontrar todos os arquivos.",
      "O navegador só visualiza formatos que ele suporta, então alguns arquivos não terão visualização.",
    ],
  },
];

const de: HelpSection[] = [
  {
    title: "Erste Schritte",
    intro: "Orbit Files zeigt die Ordner und Dateien eines Ordners auf deinem Computer als Punkte auf einem Globus.",
    items: [
      "Klicke auf die Ordner-Schaltfläche neben dem Suchfeld, um einen Ordner zu laden. Chrome, Edge und andere Chromium-Browser öffnen den Ordnerauswahldialog des Systems. Firefox und Safari öffnen einen Dateidialog, der denselben Ordner liest.",
      "Du kannst auch einen Ordner aus dem Finder oder dem Explorer auf die Seite ziehen und dort ablegen.",
      "Deine Dateien bleiben auf deinem Computer. Orbit Files liest sie im Browser und lädt sie nie hoch.",
      "Das Laden eines anderen Ordners ersetzt den aktuellen.",
    ],
  },
  {
    title: "Was die Punkte bedeuten",
    items: [
      "Jeder Unterordner des geladenen Ordners ist ein Punkt auf dem Globus.",
      "Jede Datei, die direkt im geladenen Ordner liegt (nicht in einem Unterordner), ist ebenfalls ein Punkt.",
      "Dateien in Unterordnern sind keine Punkte. Finde sie über die Suche oder öffne ihren Ordner.",
      "Fahre mit der Maus über einen Punkt, um seinen Namen zu sehen.",
      "Die schwachen Punkte im Hintergrund dienen nur der Dekoration.",
    ],
  },
  {
    title: "Den Globus drehen",
    items: [
      "Der Globus dreht sich von selbst, eine volle Umdrehung alle 60 Sekunden.",
      "Ziehe mit der Maus (auf Touchscreens mit dem Finger), um den Globus zu drehen. Nach oben oder unten ziehen neigt ihn, bis zu einer Grenze.",
      "Die automatische Drehung pausiert, während du ziehst, und läuft 1,5 Sekunden nach dem Loslassen weiter.",
      "Ein Druck, der sich kaum bewegt, zählt als Klick auf den Punkt unter dem Zeiger. Ziehen wählt nichts aus.",
      "Punkte senden leichte Radar-Impulse aus, wenn sie dir zugewandt sind. Das ist nur visuell.",
      "Beim Ziehen wird kein Text markiert.",
    ],
  },
  {
    title: "Ordner und Dateien öffnen",
    items: [
      "Klicke auf einen Ordnerpunkt, um seine Dateien im Feld unter der Suche aufzulisten.",
      "Klicke auf einen Dateipunkt, um die Datei im Vorschaufenster zu öffnen.",
      "Klicke auf einen anderen Ordnerpunkt, um zu wechseln. Klicke außerhalb des Feldes, um es zu schließen.",
      "Drücke Escape, um die Auswahl aufzuheben.",
    ],
  },
  {
    title: "Suchen",
    intro: "Die Suche findet Ordner und Dateien im gesamten geladenen Ordner, auch in allen Unterordnern.",
    items: [
      "Die Suche vergleicht nur Namen, nicht den Inhalt der Dateien.",
      "Jedes eingegebene Wort muss im Namen vorkommen. Namen, die mit deinem Text beginnen, stehen zuerst.",
      "Bei leerem Suchfeld werden die ersten fünf Ordner angezeigt.",
      "Der Globus dreht sich zum besten Treffer und markiert ihn mit einem Ring.",
      "Wähle ein Ergebnis mit der Maus, oder bewege dich mit den Pfeiltasten und drücke Enter. Ein Ordner wählt diesen Ordner aus, eine Datei öffnet die Datei.",
      "Es werden bis zu 40 Ergebnisse angezeigt. Gib mehr Wörter ein, um sie einzugrenzen.",
      "Wenn die Ergebnisse Bilder, PDFs oder Audiodateien enthalten, wechsle oberhalb der Ergebnisse zwischen Liste und Miniaturen.",
    ],
  },
  {
    title: "Dateien ansehen",
    items: [
      "Im Feld eines Ordners wechseln die Schaltflächen Liste und Miniaturen die Ansicht. Miniaturen erscheinen, wenn der Ordner Bilder, PDFs, Photoshop-Dateien (PSD), TIFF- oder Audiodateien enthält.",
      "Klicke auf eine Datei oder ihre Miniatur, um sie im Vorschaufenster zu öffnen.",
      "Die Vorschau zeigt Bilder, PDFs, Videos, Audio und Textdateien. Textvorschauen zeigen die ersten 200 KB. Andere Typen haben keine Vorschau.",
      "Schließe die Vorschau mit dem Schließen-Button, durch Klick auf den dunklen Hintergrund oder mit Escape.",
    ],
  },
  {
    title: "Audio",
    items: [
      "Audiodateien zeigen eine Wellenform. Die Balken füllen sich, während der Titel läuft.",
      "Nutze den Play-Button einer Audiodatei in der Liste oder den Miniaturen, um sie abzuspielen, ohne die Vorschau zu öffnen.",
      "Es spielt immer nur eine Audiodatei. Wenn du eine andere startest, stoppt die aktuelle.",
      "Kann der Browser eine Audiodatei nicht dekodieren, wird statt der Wellenform ein Hinweis angezeigt.",
    ],
  },
  {
    title: "Sprache und Infos",
    items: [
      "Mit EN, PT, DE, ES, IT, FR und PL oben rechts änderst du die Sprache. Deine Wahl wird in diesem Browser gespeichert.",
      "Die Fragezeichen-Schaltfläche oben rechts öffnet diese Anleitung.",
      "Die Info-Schaltfläche neben dem GitHub-Link zeigt die App-Version und das Erstellungsdatum.",
    ],
  },
  {
    title: "Tastatur",
    items: [
      "Tab verschiebt den Fokus auf das Suchfeld, die Schaltfläche zum Laden und den Globus.",
      "Auf dem Globus: Pfeiltasten wechseln zwischen den Ordnerpunkten, Enter oder Leertaste wählt den markierten Punkt, Escape hebt die Auswahl auf.",
      "Im Suchfeld: Pfeil nach unten öffnet die Ergebnisse, die Pfeiltasten bewegen sich zwischen ihnen, Enter wählt einen aus, Escape schließt die Liste.",
      "Im Vorschaufenster: Escape schließt es.",
    ],
  },
  {
    title: "Gut zu wissen",
    items: [
      "Der geladene Ordner wird im Speicher der Seite gehalten. Ein Neuladen der Seite leert ihn, lade den Ordner dann erneut.",
      "Firefox und Safari melden nur Ordner mit Dateien, leere Unterordner erscheinen dort daher nicht.",
      "Sehr große Ordner brauchen einen Moment zum Einlesen, bevor die Suche alle Dateien findet.",
      "Der Browser kann nur Formate anzeigen, die er unterstützt. Manche Dateien haben deshalb keine Vorschau.",
    ],
  },
];

const es: HelpSection[] = [
  {
    title: "Primeros pasos",
    intro: "Orbit Files muestra las carpetas y los archivos de una carpeta de tu ordenador como puntos en un globo.",
    items: [
      "Haz clic en el botón de carpeta junto al campo de búsqueda para cargar una carpeta. Chrome, Edge y otros navegadores basados en Chromium abren el selector de carpetas del sistema. Firefox y Safari abren un cuadro de archivos que lee la misma carpeta.",
      "También puedes arrastrar una carpeta desde el Finder o el Explorador de archivos y soltarla en cualquier parte de la página.",
      "Tus archivos se quedan en tu ordenador. Orbit Files los lee en el navegador y nunca los sube.",
      "Cargar otra carpeta reemplaza la actual.",
    ],
  },
  {
    title: "Qué significa cada punto",
    items: [
      "Cada subcarpeta de la carpeta cargada es un punto en el globo.",
      "Cada archivo que está directamente en la carpeta cargada (no dentro de una subcarpeta) también es un punto.",
      "Los archivos dentro de subcarpetas no son puntos. Encuéntralos con la búsqueda o abre su carpeta.",
      "Pasa el ratón sobre un punto para ver su nombre.",
      "Los puntos tenues del fondo son solo decoración.",
    ],
  },
  {
    title: "Girar el globo",
    items: [
      "El globo gira solo, una vuelta completa cada 60 segundos.",
      "Arrastra con el ratón (o con el dedo, en pantallas táctiles) para girar el globo. Arrastrar hacia arriba o abajo lo inclina, dentro de un límite.",
      "El giro automático se pausa mientras arrastras y se reanuda 1,5 segundos después de soltar.",
      "Una pulsación que apenas se mueve cuenta como clic en el punto bajo el cursor. Arrastrar no selecciona nada.",
      "Los puntos emiten pulsos suaves de radar cuando miran hacia ti. Es solo visual.",
      "No se selecciona texto mientras arrastras.",
    ],
  },
  {
    title: "Abrir carpetas y archivos",
    items: [
      "Haz clic en un punto de carpeta para listar sus archivos en el panel bajo el campo de búsqueda.",
      "Haz clic en un punto de archivo para abrirlo en la ventana de vista previa.",
      "Haz clic en otro punto de carpeta para cambiar. Haz clic fuera del panel para cerrarlo.",
      "Pulsa Escape para borrar la selección.",
    ],
  },
  {
    title: "Buscar",
    intro: "La búsqueda encuentra carpetas y archivos en toda la carpeta cargada, incluidas todas las subcarpetas.",
    items: [
      "La búsqueda solo compara nombres, no el contenido de los archivos.",
      "Cada palabra que escribas debe aparecer en el nombre. Los nombres que empiezan por tu texto aparecen primero.",
      "Con la búsqueda vacía se muestran las cinco primeras carpetas.",
      "El globo gira hacia la mejor coincidencia y la marca con un anillo.",
      "Elige un resultado con el ratón, o muévete con las flechas y pulsa Enter. Una carpeta selecciona esa carpeta; un archivo abre el archivo.",
      "Se muestran hasta 40 resultados. Escribe más palabras para afinarlos.",
      "Cuando los resultados incluyen imágenes, PDF o audios, cambia entre lista y miniaturas encima de los resultados.",
    ],
  },
  {
    title: "Ver archivos",
    items: [
      "En el panel de una carpeta, usa los botones Lista y Miniaturas para cambiar la vista. Las miniaturas aparecen cuando la carpeta tiene imágenes, PDF, archivos de Photoshop (PSD), TIFF o audio.",
      "Haz clic en un archivo, o en su miniatura, para abrirlo en la vista previa.",
      "La vista previa muestra imágenes, PDF, vídeos, audio y archivos de texto. Los textos muestran los primeros 200 KB. Otros tipos no tienen vista previa.",
      "Cierra la vista previa con el botón de cerrar, haciendo clic en el fondo oscuro o con Escape.",
    ],
  },
  {
    title: "Audio",
    items: [
      "Los archivos de audio muestran una forma de onda. Las barras se llenan mientras suena la pista.",
      "Usa el botón de reproducir de un audio en la lista o en las miniaturas para escucharlo sin abrir la vista previa.",
      "Solo suena un audio a la vez. Al empezar otro, el actual se detiene.",
      "Si el navegador no puede decodificar un audio, muestra una etiqueta en lugar de la forma de onda.",
    ],
  },
  {
    title: "Idioma e información",
    items: [
      "Usa EN, PT, DE, ES, IT, FR y PL arriba a la derecha para cambiar el idioma. Tu elección se recuerda en este navegador.",
      "El botón de interrogación arriba a la derecha abre esta guía.",
      "El botón de información junto al enlace de GitHub muestra la versión de la app y la fecha de creación.",
    ],
  },
  {
    title: "Teclado",
    items: [
      "Tab mueve el foco entre el campo de búsqueda, el botón de cargar y el globo.",
      "En el globo: las flechas se mueven entre los puntos de carpeta, Enter o Espacio selecciona el punto enfocado y Escape borra la selección.",
      "En el campo de búsqueda: la flecha abajo abre los resultados; las flechas se mueven entre ellos; Enter elige uno; Escape cierra la lista.",
      "En la vista previa: Escape la cierra.",
    ],
  },
  {
    title: "Para tener en cuenta",
    items: [
      "La carpeta cargada se guarda en la memoria de la página. Recargar la página la borra, así que vuelve a cargarla.",
      "Firefox y Safari solo informan carpetas que contienen archivos, así que las subcarpetas vacías no aparecen allí.",
      "Las carpetas muy grandes tardan un momento en leerse antes de que la búsqueda encuentre todos los archivos.",
      "El navegador solo puede mostrar vistas previas de los formatos que soporta. Algunos archivos no tendrán vista previa.",
    ],
  },
];

const it: HelpSection[] = [
  {
    title: "Primi passi",
    intro: "Orbit Files mostra le cartelle e i file di una cartella del tuo computer come punti su un globo.",
    items: [
      "Fai clic sul pulsante cartella accanto al campo di ricerca per caricare una cartella. Chrome, Edge e gli altri browser basati su Chromium aprono il selettore di cartelle del sistema. Firefox e Safari aprono una finestra di file che legge la stessa cartella.",
      "Puoi anche trascinare una cartella dal Finder o da Esplora file e rilasciarla in un punto qualsiasi della pagina.",
      "I tuoi file restano sul computer. Orbit Files li legge nel browser e non li carica mai.",
      "Caricare un'altra cartella sostituisce quella attuale.",
    ],
  },
  {
    title: "Che cosa significa ogni punto",
    items: [
      "Ogni sottocartella della cartella caricata è un punto sul globo.",
      "Ogni file che si trova direttamente nella cartella caricata (non in una sottocartella) è anch'esso un punto.",
      "I file dentro le sottocartelle non sono punti. Trovali con la ricerca o apri la loro cartella.",
      "Passa il mouse su un punto per vederne il nome.",
      "I puntini sfumati sullo sfondo sono solo decorativi.",
    ],
  },
  {
    title: "Ruotare il globo",
    items: [
      "Il globo gira da solo, un giro completo ogni 60 secondi.",
      "Trascina con il mouse (o con il dito, sui touchscreen) per ruotare il globo. Trascinare su o giù lo inclina, entro un limite.",
      "La rotazione automatica si ferma mentre trascini e riprende 1,5 secondi dopo il rilascio.",
      "Una pressione che si muove appena conta come clic sul punto sotto il puntatore. Trascinare non seleziona nulla.",
      "I punti emettono deboli impulsi radar quando sono rivolti verso di te. È solo visivo.",
      "Durante il trascinamento il testo non viene selezionato.",
    ],
  },
  {
    title: "Aprire cartelle e file",
    items: [
      "Fai clic su un punto cartella per elencarne i file nel pannello sotto il campo di ricerca.",
      "Fai clic su un punto file per aprirlo nella finestra di anteprima.",
      "Fai clic su un altro punto cartella per cambiare. Fai clic fuori dal pannello per chiuderlo.",
      "Premi Esc per annullare la selezione.",
    ],
  },
  {
    title: "Cercare",
    intro: "La ricerca trova cartelle e file in tutta la cartella caricata, comprese tutte le sottocartelle.",
    items: [
      "La ricerca confronta solo i nomi, non il contenuto dei file.",
      "Ogni parola digitata deve comparire nel nome. I nomi che iniziano con il testo digitato compaiono per primi.",
      "Con il campo vuoto vengono mostrate le prime cinque cartelle.",
      "Il globo ruota verso la corrispondenza migliore e la segna con un anello.",
      "Scegli un risultato con il mouse, oppure muoviti con le frecce e premi Invio. Una cartella seleziona quella cartella; un file apre il file.",
      "Vengono elencati fino a 40 risultati. Scrivi altre parole per restringerli.",
      "Quando i risultati includono immagini, PDF o audio, passa tra elenco e miniature sopra i risultati.",
    ],
  },
  {
    title: "Visualizzare i file",
    items: [
      "Nel pannello di una cartella, usa i pulsanti Elenco e Miniature per cambiare vista. Le miniature compaiono quando la cartella contiene immagini, PDF, file Photoshop (PSD), TIFF o audio.",
      "Fai clic su un file, o sulla sua miniatura, per aprirlo nella finestra di anteprima.",
      "L'anteprima mostra immagini, PDF, video, audio e file di testo. I testi mostrano i primi 200 KB. Gli altri tipi non hanno anteprima.",
      "Chiudi l'anteprima con il pulsante di chiusura, facendo clic sullo sfondo scuro o con Esc.",
    ],
  },
  {
    title: "Audio",
    items: [
      "I file audio mostrano una forma d'onda. Le barre si riempiono mentre la traccia suona.",
      "Usa il pulsante di riproduzione su un file audio nell'elenco o nelle miniature per ascoltarlo senza aprire l'anteprima.",
      "Suona un solo file audio alla volta. Avviandone un altro, quello in corso si ferma.",
      "Se il browser non riesce a decodificare un file audio, mostra un'etichetta al posto della forma d'onda.",
    ],
  },
  {
    title: "Lingua e informazioni",
    items: [
      "Usa EN, PT, DE, ES, IT, FR e PL in alto a destra per cambiare lingua. La scelta viene ricordata in questo browser.",
      "Il pulsante con il punto interrogativo in alto a destra apre questa guida.",
      "Il pulsante info accanto al link GitHub mostra la versione dell'app e la data di creazione.",
    ],
  },
  {
    title: "Tastiera",
    items: [
      "Tab sposta il focus tra il campo di ricerca, il pulsante di caricamento e il globo.",
      "Sul globo: le frecce si spostano tra i punti cartella, Invio o Spazio seleziona il punto a fuoco, Esc annulla la selezione.",
      "Nel campo di ricerca: la freccia giù apre i risultati, le frecce si spostano tra di essi, Invio ne sceglie uno, Esc chiude l'elenco.",
      "Nell'anteprima: Esc la chiude.",
    ],
  },
  {
    title: "Da sapere",
    items: [
      "La cartella caricata resta in memoria nella pagina. Ricaricare la pagina la svuota, quindi caricala di nuovo.",
      "Firefox e Safari segnalano solo le cartelle che contengono file, quindi lì le sottocartelle vuote non compaiono.",
      "Le cartelle molto grandi richiedono un momento di lettura prima che la ricerca trovi tutti i file.",
      "Il browser può mostrare in anteprima solo i formati che supporta. Alcuni file non avranno anteprima.",
    ],
  },
];

const fr: HelpSection[] = [
  {
    title: "Premiers pas",
    intro: "Orbit Files affiche les dossiers et les fichiers d'un dossier de votre ordinateur sous forme de points sur un globe.",
    items: [
      "Cliquez sur le bouton dossier à côté du champ de recherche pour charger un dossier. Chrome, Edge et les autres navigateurs Chromium ouvrent le sélecteur de dossiers du système. Firefox et Safari ouvrent une boîte de dialogue de fichiers qui lit le même dossier.",
      "Vous pouvez aussi glisser un dossier depuis le Finder ou l'Explorateur et le déposer n'importe où sur la page.",
      "Vos fichiers restent sur votre ordinateur. Orbit Files les lit dans le navigateur et ne les envoie jamais.",
      "Charger un autre dossier remplace le dossier actuel.",
    ],
  },
  {
    title: "Ce que représente chaque point",
    items: [
      "Chaque sous-dossier du dossier chargé est un point sur le globe.",
      "Chaque fichier placé directement dans le dossier chargé (et non dans un sous-dossier) est aussi un point.",
      "Les fichiers situés dans les sous-dossiers ne sont pas des points. Trouvez-les avec la recherche ou ouvrez leur dossier.",
      "Survolez un point pour voir son nom.",
      "Les points discrets en arrière-plan sont purement décoratifs.",
    ],
  },
  {
    title: "Faire tourner le globe",
    items: [
      "Le globe tourne tout seul, un tour complet toutes les 60 secondes.",
      "Faites glisser avec la souris (ou avec le doigt sur un écran tactile) pour faire tourner le globe. Glisser vers le haut ou le bas l'incline, dans une certaine limite.",
      "La rotation automatique se met en pause pendant que vous glissez et reprend 1,5 seconde après que vous relâchez.",
      "Un clic qui bouge à peine compte comme un clic sur le point sous le curseur. Glisser ne sélectionne rien.",
      "Les points émettent de légères impulsions radar lorsqu'ils vous font face. C'est purement visuel.",
      "Le texte n'est pas sélectionné pendant que vous glissez.",
    ],
  },
  {
    title: "Ouvrir dossiers et fichiers",
    items: [
      "Cliquez sur un point dossier pour lister ses fichiers dans le panneau sous le champ de recherche.",
      "Cliquez sur un point fichier pour l'ouvrir dans la fenêtre d'aperçu.",
      "Cliquez sur un autre point dossier pour changer. Cliquez en dehors du panneau pour le fermer.",
      "Appuyez sur Échap pour effacer la sélection.",
    ],
  },
  {
    title: "Rechercher",
    intro: "La recherche trouve dossiers et fichiers dans tout le dossier chargé, y compris dans tous les sous-dossiers.",
    items: [
      "La recherche porte uniquement sur les noms, pas sur le contenu des fichiers.",
      "Chaque mot saisi doit apparaître dans le nom. Les noms qui commencent par votre texte sont listés en premier.",
      "Avec un champ vide, les cinq premiers dossiers sont affichés.",
      "Le globe tourne vers la meilleure correspondance et la marque d'un anneau.",
      "Choisissez un résultat à la souris, ou déplacez-vous avec les flèches et appuyez sur Entrée. Un dossier le sélectionne ; un fichier l'ouvre.",
      "Jusqu'à 40 résultats sont listés. Ajoutez des mots pour affiner.",
      "Lorsque les résultats incluent des images, des PDF ou des fichiers audio, basculez entre liste et miniatures au-dessus des résultats.",
    ],
  },
  {
    title: "Voir les fichiers",
    items: [
      "Dans le panneau d'un dossier, utilisez les boutons Liste et Miniatures pour changer l'affichage. Les miniatures apparaissent lorsque le dossier contient des images, des PDF, des fichiers Photoshop (PSD), TIFF ou audio.",
      "Cliquez sur un fichier, ou sur sa miniature, pour l'ouvrir dans la fenêtre d'aperçu.",
      "L'aperçu affiche les images, PDF, vidéos, fichiers audio et textes. Les textes montrent les 200 premiers Ko. Les autres types n'ont pas d'aperçu.",
      "Fermez l'aperçu avec le bouton fermer, en cliquant sur le fond sombre ou avec Échap.",
    ],
  },
  {
    title: "Audio",
    items: [
      "Les fichiers audio affichent une forme d'onde. Les barres se remplissent pendant la lecture.",
      "Utilisez le bouton lecture d'un fichier audio dans la liste ou les miniatures pour l'écouter sans ouvrir l'aperçu.",
      "Un seul fichier audio joue à la fois. En lancer un autre arrête celui en cours.",
      "Si le navigateur ne peut pas décoder un fichier audio, il affiche une étiquette à la place de la forme d'onde.",
    ],
  },
  {
    title: "Langue et informations",
    items: [
      "Utilisez EN, PT, DE, ES, IT, FR et PL en haut à droite pour changer de langue. Votre choix est mémorisé dans ce navigateur.",
      "Le bouton point d'interrogation en haut à droite ouvre ce guide.",
      "Le bouton info à côté du lien GitHub affiche la version de l'application et la date de création.",
    ],
  },
  {
    title: "Clavier",
    items: [
      "Tab déplace le focus entre le champ de recherche, le bouton de chargement et le globe.",
      "Sur le globe : les flèches passent d'un point dossier à l'autre, Entrée ou Espace sélectionne le point actif, Échap efface la sélection.",
      "Dans le champ de recherche : la flèche bas ouvre les résultats, les flèches se déplacent entre eux, Entrée en choisit un, Échap ferme la liste.",
      "Dans l'aperçu : Échap le ferme.",
    ],
  },
  {
    title: "Bon à savoir",
    items: [
      "Le dossier chargé est conservé en mémoire par la page. Recharger la page l'efface, il faut donc le charger à nouveau.",
      "Firefox et Safari ne signalent que les dossiers contenant des fichiers : les sous-dossiers vides n'apparaissent donc pas.",
      "Les très gros dossiers prennent un moment à être lus avant que la recherche trouve tous les fichiers.",
      "Le navigateur ne peut afficher en aperçu que les formats qu'il prend en charge. Certains fichiers n'auront pas d'aperçu.",
    ],
  },
];

const pl: HelpSection[] = [
  {
    title: "Pierwsze kroki",
    intro: "Orbit Files pokazuje foldery i pliki z wybranego folderu na komputerze jako punkty na globusie.",
    items: [
      "Kliknij przycisk folderu obok pola wyszukiwania, aby wczytać folder. Chrome, Edge i inne przeglądarki oparte na Chromium otwierają systemowy wybór folderów. Firefox i Safari otwierają okno plików, które odczytuje ten sam folder.",
      "Możesz też przeciągnąć folder z Findera lub Eksploratora plików i upuścić go w dowolnym miejscu strony.",
      "Twoje pliki zostają na komputerze. Orbit Files odczytuje je w przeglądarce i nigdy ich nie wysyła.",
      "Wczytanie innego folderu zastępuje bieżący.",
    ],
  },
  {
    title: "Co oznacza każdy punkt",
    items: [
      "Każdy podfolder wczytanego folderu to jeden punkt na globusie.",
      "Każdy plik znajdujący się bezpośrednio we wczytanym folderze (nie w podfolderze) też jest punktem.",
      "Pliki w podfolderach nie są punktami. Znajdź je wyszukiwarką albo otwórz ich folder.",
      "Najedź myszką na punkt, aby zobaczyć jego nazwę.",
      "Słabe kropki w tle są tylko dekoracją.",
    ],
  },
  {
    title: "Obracanie globusa",
    items: [
      "Globus obraca się sam, jeden pełny obrót co 60 sekund.",
      "Przeciągnij myszką (lub palcem na ekranach dotykowych), aby obrócić globus. Przeciąganie w górę lub w dół pochyla go, w określonych granicach.",
      "Automatyczne obracanie wstrzymuje się podczas przeciągania i wznawia 1,5 sekundy po puszczeniu.",
      "Naciśnięcie, które prawie się nie rusza, liczy się jako kliknięcie punktu pod kursorem. Przeciąganie niczego nie zaznacza.",
      "Punkty wysyłają delikatne impulsy radarowe, gdy są zwrócone w Twoją stronę. To tylko efekt wizualny.",
      "Podczas przeciągania tekst nie jest zaznaczany.",
    ],
  },
  {
    title: "Otwieranie folderów i plików",
    items: [
      "Kliknij punkt folderu, aby wyświetlić jego pliki w panelu pod polem wyszukiwania.",
      "Kliknij punkt pliku, aby otworzyć go w oknie podglądu.",
      "Kliknij inny punkt folderu, aby przełączyć. Kliknij poza panelem, aby go zamknąć.",
      "Naciśnij Escape, aby wyczyścić zaznaczenie.",
    ],
  },
  {
    title: "Wyszukiwanie",
    intro: "Wyszukiwarka znajduje foldery i pliki w całym wczytanym folderze, także we wszystkich podfolderach.",
    items: [
      "Wyszukiwanie dotyczy tylko nazw, nie zawartości plików.",
      "Każde wpisane słowo musi występować w nazwie. Nazwy zaczynające się od wpisanego tekstu są wymienione jako pierwsze.",
      "Przy pustym polu pokazuje się pierwsze pięć folderów.",
      "Globus obraca się do najlepszego trafienia i oznacza je pierścieniem.",
      "Wybierz wynik myszką albo przesuwaj się strzałkami i naciśnij Enter. Folder zaznacza ten folder, plik otwiera plik.",
      "Wyświetlanych jest do 40 wyników. Wpisz więcej słów, aby je zawęzić.",
      "Gdy wyniki zawierają obrazy, PDF-y lub audio, przełączaj widok listy i miniatur nad wynikami.",
    ],
  },
  {
    title: "Przeglądanie plików",
    items: [
      "W panelu folderu przyciski Lista i Miniatury zmieniają widok. Miniatury pojawiają się, gdy folder zawiera obrazy, PDF-y, pliki Photoshopa (PSD), TIFF lub audio.",
      "Kliknij plik albo jego miniaturę, aby otworzyć go w oknie podglądu.",
      "Podgląd pokazuje obrazy, PDF-y, wideo, audio i pliki tekstowe. Pliki tekstowe pokazują pierwsze 200 KB. Inne typy nie mają podglądu.",
      "Zamknij podgląd przyciskiem zamknięcia, klikając ciemne tło lub klawiszem Escape.",
    ],
  },
  {
    title: "Audio",
    items: [
      "Pliki audio pokazują przebieg fali. Słupki wypełniają się w trakcie odtwarzania.",
      "Użyj przycisku odtwarzania przy pliku audio na liście lub w miniaturach, aby go odtworzyć bez otwierania podglądu.",
      "Jednocześnie odtwarza się tylko jeden plik audio. Uruchomienie kolejnego zatrzymuje bieżący.",
      "Jeśli przeglądarka nie może zdekodować pliku audio, zamiast przebiegu fali pokazuje etykietę.",
    ],
  },
  {
    title: "Język i informacje",
    items: [
      "Użyj przycisków EN, PT, DE, ES, IT, FR i PL w prawym górnym rogu, aby zmienić język. Twój wybór jest zapamiętywany w tej przeglądarce.",
      "Przycisk ze znakiem zapytania w prawym górnym rogu otwiera ten przewodnik.",
      "Przycisk info obok linku do GitHuba pokazuje wersję aplikacji i datę utworzenia.",
    ],
  },
  {
    title: "Klawiatura",
    items: [
      "Tab przenosi fokus między polem wyszukiwania, przyciskiem wczytywania a globusem.",
      "Na globusie: strzałki przechodzą między punktami folderów, Enter lub Spacja wybiera aktywny punkt, Escape czyści zaznaczenie.",
      "W polu wyszukiwania: strzałka w dół otwiera wyniki, strzałki poruszają się po nich, Enter wybiera jeden, Escape zamyka listę.",
      "W podglądzie: Escape go zamyka.",
    ],
  },
  {
    title: "Warto wiedzieć",
    items: [
      "Wczytany folder jest przechowywany w pamięci strony. Przeładowanie strony go czyści, więc wczytaj folder ponownie.",
      "Firefox i Safari zgłaszają tylko foldery zawierające pliki, więc puste podfoldery tam się nie pojawią.",
      "Bardzo duże foldery potrzebują chwili na odczyt, zanim wyszukiwarka znajdzie wszystkie pliki.",
      "Przeglądarka pokaże podgląd tylko w obsługiwanych formatach. Niektóre pliki nie będą miały podglądu.",
    ],
  },
];

/** The help guide in every supported language. */
export const HELP: Record<Lang, HelpSection[]> = { en, pt, de, es, it, fr, pl };
