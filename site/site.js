const COLORS = ["#ffffff", "#4d9fff", "#3ddc97", "#ff8a3d", "#ff5d8f", "#b07bff", "#ffe14a", "#ff4d4d", "#3ee0d2"];
const LOCAL = document.querySelector('meta[name="hooxie-local"]')?.content === "1";
const TOKEN = document.querySelector('meta[name="z-token"]')?.content || "";
const COPY = {
  en: {
    "nav.general": "General", "nav.onboarding": "IDE", "nav.keybinds": "Keybinds", "nav.profile": "Profile", "nav.language": "Language", "nav.billing": "Billing", "nav.support": "Support", "nav.releases": "Release notes", "nav.help": "Help center", "nav.contact": "Contact support", "nav.toggle": "Toggle Hooxie",
    "general.title": "General", "general.intro": "Hooxie version, whether a screen share can see the widget, the color theme, and the microphone.", "general.upload": "Upload a sound",
    "ide.title": "IDE", "ide.note": "Pick an IDE. The widget uses that one. Switch it any time.", "ide.browse": "Browse", "ide.clear": "Clear", "ide.connect": "Connect Cursor", "ide.save": "Save key", "ide.open": "Open IDE",
    "keybinds.title": "Keybinds", "keybinds.note": "These shortcuts work while Hooxie is running. Arrow moves stay off until you turn on Arrow keys in General.",
    "profile.title": "Profile", "profile.note": "Connect the email Stripe should use for this computer.", "profile.connect": "Connect account",
    "language.title": "Language", "language.note": "The dashboard language on this computer.",
    "billing.title": "Billing", "billing.note": "One purchase covers this computer. Copying the app or its files does not license another device.", "billing.plan": "This computer", "billing.once": "once", "billing.lead": "Included with Hooxie:", "billing.item1": "The widget, voice, and screen context", "billing.item2": "Undetectable mode on this computer", "billing.item3": "A license that stays on this device", "billing.subscribe": "Buy for this computer", "billing.paid": "Already paid",
    "releases.title": "Release notes", "releases.open": "Open the release notes page",
    "help.title": "Help center", "help.open": "Open the help center", "help.s1": "Start Hooxie", "help.p1": "Run Hooxie on Windows. The pill sits at the top center. Choose the project folder before the first prompt.", "help.s2": "Voice, screen, and files", "help.p2": "An empty prompt shows the microphone. Text turns that button into send. While the agent is working, the same button is a square and stops the run. “View the screen” attaches a screenshot. The plus button adds files or a folder.", "help.s3": "Hide from a call", "help.p3": "Turn Detectable off, or start a session with Ctrl+Shift+\\. You still see Hooxie. A normal screen share does not.",
    "contact.title": "Contact support", "contact.note": "Email support@delexo.store.", "contact.open": "Open the contact form",
    "mode.light": "Light", "mode.dark": "Dark", "session.running": "Running", "session.stopped": "Stopped",
    "status.shown": "Hooxie is on screen.", "status.hidden": "Hooxie is hidden. Ctrl+\\ shows it again.", "status.desktop": "Toggle Hooxie from the desktop app.",
  },
  es: {
    "nav.general": "General", "nav.onboarding": "IDE", "nav.keybinds": "Atajos", "nav.profile": "Perfil", "nav.language": "Idioma", "nav.billing": "Facturación", "nav.support": "Soporte", "nav.releases": "Notas de versión", "nav.help": "Centro de ayuda", "nav.contact": "Contacto", "nav.toggle": "Mostrar u ocultar",
    "general.title": "General", "general.intro": "Versión de Hooxie, si una pantalla compartida puede ver el widget, el color y el micrófono.", "general.upload": "Subir un sonido",
    "ide.title": "IDE", "ide.note": "Elige un IDE. El widget usa ese. Puedes cambiarlo cuando quieras.", "ide.browse": "Examinar", "ide.clear": "Borrar", "ide.connect": "Conectar Cursor", "ide.save": "Guardar clave", "ide.open": "Abrir IDE",
    "keybinds.title": "Atajos", "keybinds.note": "Estos atajos funcionan mientras Hooxie está abierto. Las flechas no mueven el widget hasta que actives las teclas de flecha en General.",
    "profile.title": "Perfil", "profile.note": "Conecta el correo que Stripe debe usar para este equipo.", "profile.connect": "Conectar cuenta",
    "language.title": "Idioma", "language.note": "El idioma del panel en este equipo.",
    "billing.title": "Facturación", "billing.note": "Una compra cubre este equipo. Copiar la aplicación o sus archivos no licencia otro dispositivo.", "billing.plan": "Este equipo", "billing.once": "una vez", "billing.lead": "Incluido con Hooxie:", "billing.item1": "El widget, la voz y el contexto de pantalla", "billing.item2": "Modo indetectable en este equipo", "billing.item3": "Una licencia que se queda en este dispositivo", "billing.subscribe": "Comprar para este equipo", "billing.paid": "Ya está pagado",
    "releases.title": "Notas de versión", "releases.open": "Abrir la página de notas",
    "help.title": "Centro de ayuda", "help.open": "Abrir el centro de ayuda", "help.s1": "Inicia Hooxie", "help.p1": "Ejecuta Hooxie en Windows. La pastilla queda arriba, al centro. Elige la carpeta del proyecto antes del primer mensaje.", "help.s2": "Voz, pantalla y archivos", "help.p2": "Un mensaje vacío muestra el micrófono. El texto convierte ese botón en enviar. Mientras el agente trabaja, el mismo botón es un cuadrado y detiene la ejecución. “Ver la pantalla” adjunta una captura. El botón más añade archivos o una carpeta.", "help.s3": "Ocultar en una llamada", "help.p3": "Apaga Detectable, o inicia una sesión con Ctrl+Mayús+\\. Tú sigues viendo Hooxie. Una pantalla compartida normal no.",
    "contact.title": "Contactar soporte", "contact.note": "Escribe a support@delexo.store.", "contact.open": "Abrir el formulario",
    "mode.light": "Claro", "mode.dark": "Oscuro", "session.running": "En curso", "session.stopped": "Detenido",
    "status.shown": "Hooxie está en pantalla.", "status.hidden": "Hooxie está oculto. Ctrl+\\ lo muestra de nuevo.", "status.desktop": "Muestra u oculta Hooxie desde la aplicación.",
  },
  fr: {
    "nav.general": "Général", "nav.onboarding": "IDE", "nav.keybinds": "Raccourcis", "nav.profile": "Profil", "nav.language": "Langue", "nav.billing": "Facturation", "nav.support": "Assistance", "nav.releases": "Notes de version", "nav.help": "Centre d'aide", "nav.contact": "Contact", "nav.toggle": "Afficher ou masquer",
    "general.title": "Général", "general.intro": "Version de Hooxie, visibilité pendant un partage d'écran, couleur et microphone.", "general.upload": "Importer un son",
    "ide.title": "IDE", "ide.note": "Choisissez un IDE. Le widget utilise celui-là. Vous pouvez en changer à tout moment.", "ide.browse": "Parcourir", "ide.clear": "Effacer", "ide.connect": "Connecter Cursor", "ide.save": "Enregistrer la clé", "ide.open": "Ouvrir l'IDE",
    "keybinds.title": "Raccourcis", "keybinds.note": "Ces raccourcis marchent tant que Hooxie est ouvert. Les flèches ne déplacent le widget qu'après avoir activé les touches fléchées dans Général.",
    "profile.title": "Profil", "profile.note": "Indiquez l'e-mail que Stripe doit utiliser pour cet ordinateur.", "profile.connect": "Connecter le compte",
    "language.title": "Langue", "language.note": "La langue du tableau de bord sur cet ordinateur.",
    "billing.title": "Facturation", "billing.note": "Un achat couvre cet ordinateur. Copier l'application ou ses fichiers ne donne pas de licence à un autre appareil.", "billing.plan": "Cet ordinateur", "billing.once": "une fois", "billing.lead": "Inclus avec Hooxie :", "billing.item1": "Le widget, la voix et le contexte d'écran", "billing.item2": "Le mode invisible sur cet ordinateur", "billing.item3": "Une licence qui reste sur cet appareil", "billing.subscribe": "Acheter pour cet ordinateur", "billing.paid": "Déjà payé",
    "releases.title": "Notes de version", "releases.open": "Ouvrir la page des notes",
    "help.title": "Centre d'aide", "help.open": "Ouvrir le centre d'aide", "help.s1": "Démarrer Hooxie", "help.p1": "Lancez Hooxie sur Windows. La pilule se place en haut au centre. Choisissez le dossier du projet avant le premier message.", "help.s2": "Voix, écran et fichiers", "help.p2": "Un message vide affiche le microphone. Le texte transforme ce bouton en envoi. Pendant que l'agent travaille, le même bouton est un carré et arrête l'exécution. « Voir l'écran » joint une capture. Le bouton plus ajoute des fichiers ou un dossier.", "help.s3": "Masquer pendant un appel", "help.p3": "Désactivez Détectable, ou démarrez une session avec Ctrl+Maj+\\. Vous voyez toujours Hooxie. Un partage d'écran normal ne le voit pas.",
    "contact.title": "Contacter le support", "contact.note": "Écrivez à support@delexo.store.", "contact.open": "Ouvrir le formulaire",
    "mode.light": "Clair", "mode.dark": "Sombre", "session.running": "En cours", "session.stopped": "Arrêté",
    "status.shown": "Hooxie est à l'écran.", "status.hidden": "Hooxie est masqué. Ctrl+\\ le réaffiche.", "status.desktop": "Affichez ou masquez Hooxie depuis l'application.",
  },
  de: {
    "nav.general": "Allgemein", "nav.onboarding": "IDE", "nav.keybinds": "Tasten", "nav.profile": "Profil", "nav.language": "Sprache", "nav.billing": "Abrechnung", "nav.support": "Support", "nav.releases": "Versionshinweise", "nav.help": "Hilfe", "nav.contact": "Kontakt", "nav.toggle": "Ein- oder ausblenden",
    "general.title": "Allgemein", "general.intro": "Hooxie-Version, Sichtbarkeit bei der Bildschirmfreigabe, Farbe und Mikrofon.", "general.upload": "Ton hochladen",
    "ide.title": "IDE", "ide.note": "Wähle eine IDE. Das Widget nutzt genau diese. Du kannst sie jederzeit wechseln.", "ide.browse": "Durchsuchen", "ide.clear": "Leeren", "ide.connect": "Cursor verbinden", "ide.save": "Schlüssel sichern", "ide.open": "IDE öffnen",
    "keybinds.title": "Tasten", "keybinds.note": "Diese Kürzel gelten, solange Hooxie läuft. Pfeiltasten bewegen das Widget erst, wenn du sie unter Allgemein einschaltest.",
    "profile.title": "Profil", "profile.note": "Verbinde die E-Mail, die Stripe für diesen Computer nutzen soll.", "profile.connect": "Konto verbinden",
    "language.title": "Sprache", "language.note": "Die Sprache dieses Fensters auf diesem Computer.",
    "billing.title": "Abrechnung", "billing.note": "Ein Kauf gilt für diesen Computer. Das Kopieren der App oder ihrer Dateien lizenziert kein anderes Gerät.", "billing.plan": "Dieser Computer", "billing.once": "einmal", "billing.lead": "In Hooxie enthalten:", "billing.item1": "Widget, Sprache und Bildschirmkontext", "billing.item2": "Unsichtbarer Modus auf diesem Computer", "billing.item3": "Eine Lizenz, die auf diesem Gerät bleibt", "billing.subscribe": "Für diesen Computer kaufen", "billing.paid": "Bereits bezahlt",
    "releases.title": "Versionshinweise", "releases.open": "Versionshinweise öffnen",
    "help.title": "Hilfe", "help.open": "Hilfe öffnen", "help.s1": "Hooxie starten", "help.p1": "Starte Hooxie unter Windows. Die Pille sitzt oben in der Mitte. Wähle den Projektordner vor der ersten Eingabe.", "help.s2": "Sprache, Bildschirm und Dateien", "help.p2": "Eine leere Eingabe zeigt das Mikrofon. Text macht aus dem Knopf Senden. Während der Agent arbeitet, ist derselbe Knopf ein Quadrat und stoppt den Lauf. „Bildschirm ansehen“ hängt einen Screenshot an. Plus fügt Dateien oder einen Ordner hinzu.", "help.s3": "In einem Anruf ausblenden", "help.p3": "Schalte Erkennbar aus, oder starte eine Sitzung mit Strg+Umschalt+\\. Du siehst Hooxie weiter. Eine normale Bildschirmfreigabe nicht.",
    "contact.title": "Support kontaktieren", "contact.note": "Schreib an support@delexo.store.", "contact.open": "Formular öffnen",
    "mode.light": "Hell", "mode.dark": "Dunkel", "session.running": "Läuft", "session.stopped": "Gestoppt",
    "status.shown": "Hooxie ist auf dem Bildschirm.", "status.hidden": "Hooxie ist ausgeblendet. Strg+\\ zeigt es wieder.", "status.desktop": "Blende Hooxie in der App ein oder aus.",
  },
  pt: {
    "nav.general": "Geral", "nav.onboarding": "IDE", "nav.keybinds": "Atalhos", "nav.profile": "Perfil", "nav.language": "Idioma", "nav.billing": "Cobrança", "nav.support": "Suporte", "nav.releases": "Notas da versão", "nav.help": "Central de ajuda", "nav.contact": "Contato", "nav.toggle": "Mostrar ou ocultar",
    "general.title": "Geral", "general.intro": "Versão do Hooxie, se um compartilhamento de tela vê o widget, a cor e o microfone.", "general.upload": "Enviar um som",
    "ide.title": "IDE", "ide.note": "Escolha um IDE. O widget usa esse. Você pode trocar quando quiser.", "ide.browse": "Procurar", "ide.clear": "Limpar", "ide.connect": "Conectar o Cursor", "ide.save": "Salvar chave", "ide.open": "Abrir o IDE",
    "keybinds.title": "Atalhos", "keybinds.note": "Estes atalhos funcionam enquanto o Hooxie está aberto. As setas só movem o widget depois que você liga as teclas de seta em Geral.",
    "profile.title": "Perfil", "profile.note": "Conecte o e-mail que o Stripe deve usar neste computador.", "profile.connect": "Conectar conta",
    "language.title": "Idioma", "language.note": "O idioma do painel neste computador.",
    "billing.title": "Cobrança", "billing.note": "Uma compra cobre este computador. Copiar o aplicativo ou os arquivos não licencia outro dispositivo.", "billing.plan": "Este computador", "billing.once": "uma vez", "billing.lead": "Incluído no Hooxie:", "billing.item1": "O widget, a voz e o contexto da tela", "billing.item2": "Modo indetectável neste computador", "billing.item3": "Uma licença que fica neste dispositivo", "billing.subscribe": "Comprar para este computador", "billing.paid": "Já pago",
    "releases.title": "Notas da versão", "releases.open": "Abrir as notas da versão",
    "help.title": "Central de ajuda", "help.open": "Abrir a central de ajuda", "help.s1": "Iniciar o Hooxie", "help.p1": "Execute o Hooxie no Windows. A pílula fica no topo, ao centro. Escolha a pasta do projeto antes do primeiro pedido.", "help.s2": "Voz, tela e arquivos", "help.p2": "Um pedido vazio mostra o microfone. O texto transforma esse botão em enviar. Enquanto o agente trabalha, o mesmo botão é um quadrado e interrompe a execução. “Ver a tela” anexa uma captura. O botão de mais adiciona arquivos ou uma pasta.", "help.s3": "Ocultar numa chamada", "help.p3": "Desligue Detectável, ou inicie uma sessão com Ctrl+Shift+\\. Você continua vendo o Hooxie. Um compartilhamento normal de tela não.",
    "contact.title": "Falar com o suporte", "contact.note": "Escreva para support@delexo.store.", "contact.open": "Abrir o formulário",
    "mode.light": "Claro", "mode.dark": "Escuro", "session.running": "Em execução", "session.stopped": "Parado",
    "status.shown": "O Hooxie está na tela.", "status.hidden": "O Hooxie está oculto. Ctrl+\\ mostra de novo.", "status.desktop": "Mostre ou oculte o Hooxie no aplicativo.",
  },
  ja: {
    "nav.general": "一般", "nav.onboarding": "IDE", "nav.keybinds": "キー", "nav.profile": "プロフィール", "nav.language": "言語", "nav.billing": "料金", "nav.support": "サポート", "nav.releases": "リリースノート", "nav.help": "ヘルプ", "nav.contact": "連絡", "nav.toggle": "表示の切り替え",
    "general.title": "一般", "general.intro": "Hooxie のバージョン、画面共有での見え方、色、マイク。", "general.upload": "音をアップロード",
    "ide.title": "IDE", "ide.note": "IDE を選びます。ウィジェットはその IDE を使います。いつでも切り替えられます。", "ide.browse": "参照", "ide.clear": "クリア", "ide.connect": "Cursor を接続", "ide.save": "キーを保存", "ide.open": "IDE を開く",
    "keybinds.title": "キー", "keybinds.note": "Hooxie の実行中に使えるショートカットです。矢印キーは、一般で矢印キーをオンにするまでウィジェットを動かしません。",
    "profile.title": "プロフィール", "profile.note": "このパソコンの支払いに使うメールを接続します。", "profile.connect": "アカウントを接続",
    "language.title": "言語", "language.note": "このパソコンのダッシュボードの言語。",
    "billing.title": "料金", "billing.note": "1回の購入でこのパソコンを使えます。アプリやファイルをコピーしても、別の端末のライセンスにはなりません。", "billing.plan": "このパソコン", "billing.once": "1回", "billing.lead": "Hooxie に含まれるもの:", "billing.item1": "ウィジェット、音声、画面の内容", "billing.item2": "このパソコンでの検知されないモード", "billing.item3": "この端末に残るライセンス", "billing.subscribe": "このパソコン用に購入", "billing.paid": "支払い済み",
    "releases.title": "リリースノート", "releases.open": "リリースノートを開く",
    "help.title": "ヘルプ", "help.open": "ヘルプを開く", "help.s1": "Hooxie を起動", "help.p1": "Windows で Hooxie を起動します。ピルは上中央にあります。最初のプロンプトの前にプロジェクトフォルダーを選びます。", "help.s2": "音声、画面、ファイル", "help.p2": "空のプロンプトではマイクが表示されます。文字を入れるとそのボタンが送信になります。エージェントの作業中は同じボタンが四角になり、実行を止めます。「画面を見る」はスクリーンショットを添付します。プラスはファイルやフォルダーを追加します。", "help.s3": "通話中に隠す", "help.p3": "検出可能をオフにするか、Ctrl+Shift+\\ でセッションを始めます。自分には見えます。通常の画面共有には映りません。",
    "contact.title": "サポートに連絡", "contact.note": "support@delexo.store にメールします。", "contact.open": "フォームを開く",
    "mode.light": "ライト", "mode.dark": "ダーク", "session.running": "実行中", "session.stopped": "停止",
    "status.shown": "Hooxie は画面に出ています。", "status.hidden": "Hooxie は隠れています。Ctrl+\\ で戻ります。", "status.desktop": "アプリから Hooxie の表示を切り替えます。",
  },
  zh: {
    "nav.general": "通用", "nav.onboarding": "IDE", "nav.keybinds": "快捷键", "nav.profile": "账户", "nav.language": "语言", "nav.billing": "账单", "nav.support": "支持", "nav.releases": "更新说明", "nav.help": "帮助中心", "nav.contact": "联系支持", "nav.toggle": "显示或隐藏",
    "general.title": "通用", "general.intro": "Hooxie 的版本、屏幕共享是否能看到小组件、颜色和麦克风。", "general.upload": "上传声音",
    "ide.title": "IDE", "ide.note": "选择一个 IDE。小组件会使用它。随时可以更换。", "ide.browse": "浏览", "ide.clear": "清除", "ide.connect": "连接 Cursor", "ide.save": "保存密钥", "ide.open": "打开 IDE",
    "keybinds.title": "快捷键", "keybinds.note": "这些快捷键在 Hooxie 运行时可用。在“通用”里打开方向键之前，方向键不会移动小组件。",
    "profile.title": "账户", "profile.note": "填写这台电脑付款时 Stripe 要使用的邮箱。", "profile.connect": "连接账户",
    "language.title": "语言", "language.note": "这台电脑上的仪表盘语言。",
    "billing.title": "账单", "billing.note": "一次购买只覆盖这台电脑。复制应用或文件不能给另一台设备授权。", "billing.plan": "这台电脑", "billing.once": "一次", "billing.lead": "Hooxie 包含：", "billing.item1": "小组件、语音和屏幕内容", "billing.item2": "这台电脑上的不可检测模式", "billing.item3": "留在这台设备上的许可证", "billing.subscribe": "为这台电脑购买", "billing.paid": "已购买",
    "releases.title": "更新说明", "releases.open": "打开更新说明",
    "help.title": "帮助中心", "help.open": "打开帮助中心", "help.s1": "启动 Hooxie", "help.p1": "在 Windows 上运行 Hooxie。胶囊位于顶部居中。第一次提问前先选择项目文件夹。", "help.s2": "语音、屏幕和文件", "help.p2": "提示为空时显示麦克风。输入文字后，这个按钮变成发送。代理工作时，同一个按钮变成方块并停止运行。“查看屏幕”会附上截图。加号可以添加文件或文件夹。", "help.s3": "通话时隐藏", "help.p3": "关闭“可被检测”，或用 Ctrl+Shift+\\ 开始会话。你仍然看得到 Hooxie。普通的屏幕共享看不到。",
    "contact.title": "联系支持", "contact.note": "发邮件到 support@delexo.store。", "contact.open": "打开联系表单",
    "mode.light": "浅色", "mode.dark": "深色", "session.running": "运行中", "session.stopped": "已停止",
    "status.shown": "Hooxie 已显示在屏幕上。", "status.hidden": "Hooxie 已隐藏。Ctrl+\\ 会再次显示。", "status.desktop": "请在桌面应用里切换 Hooxie。",
  },
};

function t(key) {
  const code = document.documentElement.lang || "en";
  return COPY[code]?.[key] || COPY.en[key] || key;
}

bootChrome();

function bootKineticMenu() {
  const navWrap = document.querySelector(".nav-overlay-wrapper");
  const menuButton = document.querySelector(".nav-close-btn");
  const bar = document.querySelector(".topbar");
  if (!navWrap || !menuButton) return;

  const menu = navWrap.querySelector(".menu-content");
  const overlay = navWrap.querySelector(".overlay");
  const bgPanels = navWrap.querySelectorAll(".backdrop-layer");
  const menuLinks = navWrap.querySelectorAll(".nav-link");
  const menuButtonTexts = menuButton.querySelectorAll("p");
  const menuButtonIcon = menuButton.querySelector(".menu-button-icon");
  const shapesContainer = navWrap.querySelector(".ambient-background-shapes");
  const live = menuButton.querySelector(".sr");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let open = false;
  let tl = null;

  const paint = (next) => {
    open = next;
    navWrap.setAttribute("data-nav", next ? "open" : "closed");
    bar?.classList.toggle("is-open", next);
    document.documentElement.classList.toggle("menu-open", next);
    menuButton.setAttribute("aria-expanded", String(next));
    if (live) live.textContent = next ? "Close" : "Menu";
    navWrap.style.display = next ? "block" : "none";
  };

  const openNav = () => {
    if (!window.gsap || reduce) {
      paint(true);
      return;
    }
    open = true;
    navWrap.setAttribute("data-nav", "open");
    bar?.classList.add("is-open");
    document.documentElement.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded", "true");
    if (live) live.textContent = "Close";
    tl.clear();
    tl.set(navWrap, { display: "block" })
      .set(menu, { xPercent: 0 }, "<")
      .fromTo(menuButtonTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
      .fromTo(menuButtonIcon, { rotate: 0 }, { rotate: 315 }, "<")
      .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
      .fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
      .fromTo(menuLinks, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.35");
  };

  const closeNav = () => {
    if (!open) return;
    if (!window.gsap || reduce) {
      paint(false);
      return;
    }
    open = false;
    navWrap.setAttribute("data-nav", "closed");
    menuButton.setAttribute("aria-expanded", "false");
    if (live) live.textContent = "Menu";
    tl.clear();
    tl.to(overlay, { autoAlpha: 0 })
      .to(menu, { xPercent: 120 }, "<")
      .to(menuButtonTexts, { yPercent: 0 }, "<")
      .to(menuButtonIcon, { rotate: 0 }, "<")
      .set(navWrap, { display: "none" })
      .add(() => {
        if (open) return;
        bar?.classList.remove("is-open");
        document.documentElement.classList.remove("menu-open");
      });
  };

  const toggleMenu = () => (open ? closeNav() : openNav());

  if (window.gsap && !reduce) {
    const gsap = window.gsap;
    if (window.CustomEase) {
      gsap.registerPlugin(window.CustomEase);
      try {
        window.CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
        gsap.defaults({ ease: "main", duration: 0.7 });
      } catch (error) {
        gsap.defaults({ ease: "power2.out", duration: 0.7 });
      }
    } else {
      gsap.defaults({ ease: "power2.out", duration: 0.7 });
    }
    gsap.set(navWrap, { display: "none" });
    tl = gsap.timeline();
    navWrap.querySelectorAll(".menu-list-item[data-shape]").forEach((item) => {
      const shape = shapesContainer?.querySelector(`.bg-shape-${item.getAttribute("data-shape")}`);
      if (!shape) return;
      const shapeEls = shape.querySelectorAll(".shape-element");
      item.addEventListener("mouseenter", () => {
        shapesContainer.querySelectorAll(".bg-shape").forEach((node) => node.classList.remove("active"));
        shape.classList.add("active");
        gsap.fromTo(shapeEls, { scale: 0.5, opacity: 0, rotation: -10 }, {
          scale: 1, opacity: 1, rotation: 0, duration: 0.6, stagger: 0.08, ease: "back.out(1.7)", overwrite: "auto",
        });
      });
      item.addEventListener("mouseleave", () => {
        gsap.to(shapeEls, {
          scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in", overwrite: "auto",
          onComplete: () => shape.classList.remove("active"),
        });
      });
    });
  }

  menuButton.addEventListener("click", toggleMenu);
  overlay?.addEventListener("click", closeNav);
  navWrap.querySelectorAll("[data-menu-toggle]").forEach((node) => {
    if (node === menuButton || node === overlay) return;
    node.addEventListener("click", toggleMenu);
  });
  menuLinks.forEach((anchor) => anchor.addEventListener("click", () => {
    document.documentElement.classList.remove("menu-open");
    closeNav();
  }));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

const page = document.querySelector("[data-page]");
if (page?.dataset.page === "dashboard") bootDashboard();
if (page?.dataset.page === "contact") bootContact();
if (page?.dataset.page === "home") bootHome();

function bootChrome() {
  if (document.querySelector("[data-page]")?.dataset.page === "dashboard") return;
}

function bootDownloadButtons() {
  for (const button of document.querySelectorAll(".dl-btn")) {
    let phase = "idle";
    let timer = 0;
    const live = button.querySelector("[aria-live]");
    const setPhase = (next) => {
      phase = next;
      button.dataset.phase = next;
      button.setAttribute("aria-busy", next === "downloading" ? "true" : "false");
      if (live) {
        live.textContent = next === "downloading" ? "Downloading" : next === "done" ? "Downloaded" : "";
      }
    };
    button.addEventListener("click", () => {
      if (phase !== "idle") return;
      setPhase("downloading");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setPhase("done");
        timer = window.setTimeout(() => setPhase("idle"), 1800);
      }, 700);
    });
  }
}

function bootHome() {
  bootDownloadButtons();
  const prompt = document.querySelector("#demo-prompt");
  const send = document.querySelector("#demo-send");
  const status = document.querySelector("#demo-status");
  const paintSend = () => {
    if (!prompt || !send) return;
    send.textContent = prompt.value.trim() ? "Send" : "Mic";
  };
  prompt?.addEventListener("input", paintSend);
  paintSend();
  send?.addEventListener("click", () => {
    const text = prompt?.value.trim();
    if (!text) {
      status.textContent = "Voice would start on the real widget. Type a prompt to preview send.";
      return;
    }
    status.textContent = `Queued for C:\\work\\app — “${text.slice(0, 72)}”. Install Hooxie to send it.`;
    prompt.value = "";
    paintSend();
  });
  prompt?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    send?.click();
  });
}

function bootContact() {
  const form = document.querySelector("#contact-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(name ? `Hooxie support from ${name}` : "Hooxie support");
    const body = encodeURIComponent(`${message}\n\n${email}`);
    location.href = `mailto:support@delexo.store?subject=${subject}&body=${body}`;
  });
}

function wireSidebar(status) {
  const dash = document.querySelector(".dash");
  const collapseBtn = document.querySelector("#side-collapse");
  const toggle = document.querySelector("#toggle-hooxie");
  let widgetShown = true;

  collapseBtn?.addEventListener("click", () => {
    const collapsed = dash.classList.toggle("is-collapsed");
    collapseBtn.setAttribute("aria-expanded", String(!collapsed));
    collapseBtn.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  });
  toggle?.addEventListener("click", async () => {
    if (!LOCAL || !TOKEN) {
      status.textContent = t("status.desktop");
      return;
    }
    const next = !widgetShown;
    toggle.disabled = true;
    try {
      const result = await request("/api/widget/visible", { shown: next });
      widgetShown = result.shown !== false;
      status.textContent = widgetShown ? t("status.shown") : t("status.hidden");
    } catch (error) {
      status.textContent = error.message;
    } finally {
      toggle.disabled = false;
    }
  });
}

function bootDashboard() {
  document.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;
    let url;
    try { url = new URL(link.getAttribute("href"), location.href); }
    catch { return; }
    const path = url.pathname.replace(/\/$/, "") || "/";
    if (url.origin === location.origin && path === "/dashboard") return;
    event.preventDefault();
  });
  const buttons = [...document.querySelectorAll(".side button[data-open]")];
  const sections = [...document.querySelectorAll("[data-section]")];
  const status = document.querySelector("#status");
  const detectable = document.querySelector("#detectable");
  const audio = document.querySelector("#audio");
  const inputDevice = document.querySelector("#input-device");
  const outputDevice = document.querySelector("#output-device");
  let audioInputs = [];
  let audioOutputs = [];
  const opacity = document.querySelector("#opacity");
  const opacityValue = document.querySelector("#opacity-value");
  const swatches = document.querySelector("#swatches");
  const languageButtons = [...document.querySelectorAll("#language-choices button")];
  const promo = document.querySelector("#promo");
  const session = document.querySelector("#session-state");
  let paid = false;
  let revision = 0;
  let settings = {
    detectable: true,
    button: "#ffffff",
    opacity: 50,
    audio: true,
    voiceActivation: false,
    inputDevice: "",
    outputDevice: "",
    session: false,
    language: "en",
    trace: true,
    ide: "cursor",
    installationId: "",
    project: "",
    route: "",
    instructions: "",
    files: "",
    includePath: false,
    includeStack: false,
    unsandboxed: false,
    experimental: false,
    chime: "blushing",
    openSound: "notification",
    closeSound: "pluck-off",
    chimeCustom: false,
    arrows: false,
    dashboardMode: "light",
    widgetMode: "dark",
  };
  let setupIdes = [];
  let routes = [];
  let catalog = { ides: [], installations: [], sessions: [] };

  for (const color of COLORS) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.dataset.color = color;
    swatch.style.background = color;
    swatch.setAttribute("aria-label", color);
    swatch.addEventListener("click", () => save({ button: color }));
    swatches.append(swatch);
  }

  function show(name) {
    const aliases = { onboarding: "ide", widget: "ide", profile: "billing" };
    const sectionName = aliases[name] || name;
    for (const section of sections) {
      const open = section.dataset.section === sectionName;
      section.hidden = !open;
      section.classList.toggle("is-in", open);
    }
    for (const button of buttons) {
      if (button.dataset.open === sectionName) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
    history.replaceState(null, "", `#${sectionName}`);
  }
    for (const button of buttons) button.addEventListener("click", () => {
      show(button.dataset.open);
      if (button.dataset.open === "general") {
        loadAudioDevices().then(() => {
          fillDeviceSelect(inputDevice, audioInputs, settings.inputDevice || "");
          fillDeviceSelect(outputDevice, audioOutputs, settings.outputDevice || "");
        }).catch(() => undefined);
      }
      if (button.dataset.open === "billing") loadSetupIdes().catch(() => undefined);
    });
  show((location.hash || "#general").slice(1) || "general");
  wireSidebar(status);
  mountPickMenu(inputDevice);
  mountPickMenu(outputDevice);
  mountPickMenu(document.querySelector("#dash-ide"));

  function paint() {
    detectable.checked = settings.detectable !== false;
    audio.checked = settings.audio !== false;
    const voiceActivation = document.querySelector("#voice-activation");
    if (voiceActivation) voiceActivation.checked = settings.voiceActivation === true;
    opacity.value = String(settings.opacity ?? 50);
    opacityValue.textContent = `${opacity.value}%`;
    setLanguage(settings.language || "en");
    session.textContent = settings.session ? t("session.running") : t("session.stopped");
    const version = document.querySelector("#version");
    if (settings.version && version) version.textContent = settings.version;
    for (const swatch of swatches.children) {
      swatch.setAttribute("aria-checked", String(swatch.dataset.color === settings.button));
    }
    document.documentElement.style.setProperty("--button", COLORS.includes(settings.button) ? settings.button : "#ffffff");
    const trace = document.querySelector("#trace");
    if (trace) trace.checked = settings.trace !== false;
    const arrows = document.querySelector("#arrows");
    if (arrows) arrows.checked = settings.arrows === true;
    fillDeviceSelect(inputDevice, audioInputs, settings.inputDevice || "");
    fillDeviceSelect(outputDevice, audioOutputs, settings.outputDevice || "");
    paintSounds();
    paintWidget();
    paintAccount();
    paintModes();
    paintBilling();
  }

  function paintBilling() {
    const button = document.querySelector("#subscribe");
    const promoField = document.querySelector(".promo-field");
    const price = document.querySelector(".plan-price");
    if (!button) return;
    button.textContent = t(paid ? "billing.paid" : "billing.subscribe");
    button.disabled = paid;
    if (promoField) promoField.hidden = paid;
    if (price) price.hidden = paid;
  }

  function paintModes() {
    const dashboardMode = settings.dashboardMode === "dark" ? "dark" : "light";
    const widgetMode = settings.widgetMode === "light" ? "light" : "dark";
    document.documentElement.dataset.appearance = dashboardMode;
    for (const button of document.querySelectorAll("[data-dashboard-mode]")) {
      button.setAttribute("aria-checked", String(button.dataset.dashboardMode === dashboardMode));
    }
    for (const button of document.querySelectorAll("[data-widget-mode]")) {
      button.setAttribute("aria-checked", String(button.dataset.widgetMode === widgetMode));
    }
  }

  function setLanguage(code) {
    const next = languageButtons.some((button) => button.dataset.lang === code) ? code : "en";
    for (const button of languageButtons) button.setAttribute("aria-checked", String(button.dataset.lang === next));
    applyLanguage(next);
  }

  function applyLanguage(code) {
    const lang = COPY[code] ? code : "en";
    const table = { ...COPY.en, ...(COPY[lang] || {}) };
    document.documentElement.lang = lang;
    for (const node of document.querySelectorAll("[data-i18n]")) {
      const next = table[node.dataset.i18n];
      if (!next) continue;
      node.textContent = next;
      const button = node.closest("button");
      if (button?.querySelector("[data-i18n]") === node) button.title = next;
    }
    if (session) session.textContent = settings.session ? t("session.running") : t("session.stopped");
  }

  async function save(partial) {
    settings = { ...settings, ...partial };
    if ("detectable" in partial) settings.session = partial.detectable === false;
    if ("session" in partial) settings.detectable = partial.session !== true;
    paint();
    if (!LOCAL || !TOKEN) {
      localStorage.setItem("hooxie-dash", JSON.stringify(settings));
      return;
    }
    try {
      const result = await request("/api/settings", settings);
      revision = result.revision;
      settings = result;
      paint();
    } catch (error) {
      status.textContent = error.message;
    }
  }

  detectable.addEventListener("change", () => save({ detectable: detectable.checked }));
  audio.addEventListener("change", () => save({ audio: audio.checked }));
  inputDevice?.addEventListener("change", () => save({ inputDevice: inputDevice.value }));
  outputDevice?.addEventListener("change", () => save({ outputDevice: outputDevice.value }));
  document.querySelector("#voice-activation").addEventListener("change", (event) => save({ voiceActivation: event.target.checked }));
  document.querySelector("#trace").addEventListener("change", (event) => save({ trace: event.target.checked, lookReady: true }));
  document.querySelector("#arrows").addEventListener("change", (event) => save({ arrows: event.target.checked }));
  opacity.addEventListener("input", () => {
    opacityValue.textContent = `${opacity.value}%`;
    save({ opacity: Number(opacity.value) });
  });
  for (const button of languageButtons) {
    button.addEventListener("click", () => save({ language: button.dataset.lang }));
  }
  for (const button of document.querySelectorAll("[data-dashboard-mode]")) {
    button.addEventListener("click", () => save({ dashboardMode: button.dataset.dashboardMode }));
  }
  for (const button of document.querySelectorAll("[data-widget-mode]")) {
    button.addEventListener("click", () => save({ widgetMode: button.dataset.widgetMode }));
  }
  document.querySelector("#subscribe").addEventListener("click", () => {
    if (paid) return;
    startCheckout(localStorage.getItem("hooxie-account-email") || "", promo.value);
  });

  async function startCheckout(accountEmail, code) {
    status.textContent = "Opening checkout.";
    try {
      if (accountEmail) localStorage.setItem("hooxie-account-email", accountEmail.trim());
      const path = LOCAL ? "/api/billing/checkout" : "/api/checkout";
      const result = await request(path, LOCAL ? { email: accountEmail, promo: code, present: "dashboard" } : { email: accountEmail, promo: code });
      if (result.paid === true || result.active === true) {
        paid = true;
        paintBilling();
        status.textContent = t("billing.paid");
        return;
      }
      if (LOCAL) {
        status.textContent = "Checkout is open in the browser.";
        return;
      }
      const tab = window.open(result.url, "_blank", "noopener");
      if (tab) {
        status.textContent = "Checkout is open in a new tab.";
        return;
      }
      location.href = result.url;
    } catch (error) {
      status.textContent = error.message;
    }
  }

  async function refresh() {
    if (!LOCAL || !TOKEN) {
      const saved = localStorage.getItem("hooxie-dash");
      if (saved) settings = { ...settings, ...JSON.parse(saved) };
      paint();
      return;
    }
    const result = await request("/api/settings");
    if (result.revision !== revision) {
      revision = result.revision;
      settings = result;
      paint();
      await loadRoutes();
    }
    if (!catalog.ides.length) {
      catalog = await request("/api/state");
      if (catalog.cursorKeyConfigured) settings.cursorConnected = true;
      paintWidget();
      paintAccount();
      await loadSetupIdes();
    }
  }

  const params = new URLSearchParams(location.search);
  if (params.get("billing") === "success") {
    status.textContent = "Checking the license for this computer.";
    const sessionId = params.get("session_id");
    if (LOCAL && sessionId) {
      request("/api/billing/confirm", { sessionId }).then((result) => {
        if (result.active) {
          paid = true;
          paintBilling();
        }
        status.textContent = result.active ? "This computer is licensed." : "Checkout is not complete yet.";
      }).catch((error) => { status.textContent = error.message; });
    }
  } else if (params.get("billing") === "cancel") {
    status.textContent = "Checkout was canceled.";
  }
  wireChimes();
  wireWidget();
  paintReleaseNotes();

  const SOUND_FIELDS = { open: "openSound", close: "closeSound", done: "chime" };
  const SOUND_CHOICES = [
    ["blushing", "Blushing"],
    ["xtreme-bass", "Xtreme bass"],
    ["undertaker", "Undertaker"],
    ["ekh", "Ekh"],
    ["cat-choke", "Cat choke"],
    ["alert", "Alert"],
    ["pluck-off", "Pluck off"],
    ["notification", "Notification"],
    ["new-notification", "New notification"],
    ["menu-open", "Menu open"],
    ["holographic-open", "Holographic open"],
    ["off", "Off"],
  ];
  const SOUND_FILES = {
    blushing: "blushing-sound.mp3",
    "xtreme-bass": "xtreme-bass-effect.mp3",
    undertaker: "undertaker-cloche.mp3",
    ekh: "ekh.mp3",
    "cat-choke": "cat-choke.mp3",
    alert: "notification-alert.mp3",
    "pluck-off": "notification-pluck-off.mp3",
    notification: "notification-2.mp3",
    "new-notification": "new-notification.mp3",
    "menu-open": "menu-open.mp3",
    "holographic-open": "menu-open-holographic.mp3",
  };
  const waveCache = new Map();
  let soundSignature = "";
  let previewAudio = null;
  let previewUrl = "";
  refresh().catch((error) => { status.textContent = error.message; });
  loadAudioDevices().then(() => paint()).catch(() => undefined);
  if (LOCAL && TOKEN) window.setInterval(() => { refresh().catch(() => {}); }, 1500);

  function paintSounds() {
    const board = document.querySelector("#sound-board");
    if (!board) return;
    const choices = SOUND_CHOICES.filter((item) => item[0] !== "off");
    if (settings.chimeCustom || settings.chime === "custom" || settings.openSound === "custom" || settings.closeSound === "custom") {
      choices.push(["custom", "Your sound"]);
    }
    const signature = `${choices.map((item) => item[0]).join(",")}|${settings.openSound}|${settings.closeSound}|${settings.chime}`;
    if (signature !== soundSignature) {
      soundSignature = signature;
      for (const section of board.querySelectorAll("[data-sound]")) {
        const field = SOUND_FIELDS[section.dataset.sound];
        const list = section.querySelector(".sound-list");
        list.replaceChildren();
        for (const [id, label] of choices) list.append(soundRow(id, label, field));
        list.append(soundOff(field));
      }
    }
    for (const section of board.querySelectorAll("[data-sound]")) {
      const field = SOUND_FIELDS[section.dataset.sound];
      const selected = settings[field] || (field === "chime" ? "blushing" : "off");
      for (const button of section.querySelectorAll("[data-sound-id]")) {
        button.setAttribute("aria-checked", String(button.dataset.soundId === selected));
      }
    }
  }

  function soundRow(id, label, field) {
    const row = document.createElement("div");
    row.className = "sound-row";
    const pick = document.createElement("button");
    pick.type = "button";
    pick.className = "sound-pick";
    pick.dataset.soundId = id;
    const wave = document.createElement("span");
    wave.className = "wave";
    wave.setAttribute("aria-hidden", "true");
    drawWave(wave, id);
    const name = document.createElement("span");
    name.className = "sound-name";
    name.textContent = label;
    pick.append(wave, name);
    pick.addEventListener("click", () => save({ [field]: id }));
    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "sound-play";
    preview.setAttribute("aria-label", `Play ${label}`);
    preview.innerHTML = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.2 1.6v8.8L10.4 6z"/></svg>';
    preview.addEventListener("click", () => {
      row.classList.add("is-playing");
      window.setTimeout(() => row.classList.remove("is-playing"), 1600);
      previewChime(id).catch((error) => { status.textContent = error.message; });
    });
    row.append(pick, preview);
    return row;
  }

  function soundOff(field) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sound-off";
    button.dataset.soundId = "off";
    button.textContent = "Off";
    button.addEventListener("click", () => save({ [field]: "off" }));
    return button;
  }

  function drawWave(wave, id) {
    const paint = (peaks) => {
      wave.replaceChildren(...peaks.map((peak, index) => {
        const bar = document.createElement("i");
        bar.style.setProperty("--h", `${Math.max(3, Math.round(peak * 26))}px`);
        bar.style.setProperty("--i", String(index));
        return bar;
      }));
    };
    paint(fallbackPeaks(id));
    if (id === "custom" || !SOUND_FILES[id]) return;
    wavePeaks(`/sounds/${SOUND_FILES[id]}`).then((peaks) => {
      if (peaks) paint(peaks);
    }).catch(() => undefined);
  }

  function fallbackPeaks(id) {
    let seed = 0;
    for (const char of id) seed = (seed * 33 + char.charCodeAt(0)) >>> 0;
    return Array.from({ length: 28 }, (_, index) => 0.18 + Math.abs(Math.sin((index + (seed % 9)) * 0.62 + seed / 40)) * 0.82);
  }

  function wavePeaks(src) {
    if (waveCache.has(src)) return waveCache.get(src);
    const pending = fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error("missing sound");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const context = new AudioContext();
        return context.decodeAudioData(buffer.slice(0)).finally(() => context.close());
      })
      .then((audio) => {
        const data = audio.getChannelData(0);
        const bars = 28;
        const size = Math.max(1, Math.floor(data.length / bars));
        const peaks = [];
        for (let index = 0; index < bars; index += 1) {
          let sum = 0;
          let count = 0;
          for (let sample = 0; sample < size; sample += 16) {
            sum += Math.abs(data[index * size + sample] || 0);
            count += 1;
          }
          peaks.push(sum / Math.max(1, count));
        }
        const max = Math.max(...peaks, 0.01);
        return peaks.map((peak) => Math.max(0.12, peak / max));
      })
      .catch(() => null);
    waveCache.set(src, pending);
    return pending;
  }

  function mountPickMenu(select) {
    if (!select || select.dataset.pickMenu === "1") return;
    select.dataset.pickMenu = "1";
    const wrap = document.createElement("div");
    wrap.className = "pick-menu";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pick-menu-btn";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    if (select.getAttribute("aria-label")) button.setAttribute("aria-label", select.getAttribute("aria-label"));
    const label = document.createElement("span");
    const list = document.createElement("div");
    list.className = "pick-menu-list";
    list.hidden = true;
    list.setAttribute("role", "listbox");
    button.append(label);
    select.classList.add("pick-menu-native");
    select.before(wrap);
    wrap.append(select, button, list);

    function syncLabel() {
      const option = select.selectedOptions && select.selectedOptions[0];
      label.textContent = option ? option.textContent : "";
    }
    function rebuild() {
      const open = !list.hidden;
      list.replaceChildren(...[...select.options].map((option) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "pick-menu-item";
        item.setAttribute("role", "option");
        item.textContent = option.textContent;
        item.setAttribute("aria-selected", String(option.value === select.value));
        item.addEventListener("click", (event) => {
          event.stopPropagation();
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          close();
        });
        return item;
      }));
      list.hidden = !open;
      syncLabel();
    }
    function place() {
      const main = wrap.closest(".main");
      const box = button.getBoundingClientRect();
      const limit = main ? main.getBoundingClientRect().bottom : window.innerHeight;
      list.classList.toggle("is-up", limit - box.bottom < 200);
    }
    function close() {
      list.hidden = true;
      button.setAttribute("aria-expanded", "false");
    }
    function open() {
      for (const menu of document.querySelectorAll(".pick-menu-list")) menu.hidden = true;
      for (const opener of document.querySelectorAll(".pick-menu-btn")) opener.setAttribute("aria-expanded", "false");
      rebuild();
      place();
      list.hidden = false;
      button.setAttribute("aria-expanded", "true");
    }
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (list.hidden) open();
      else close();
    });
    document.addEventListener("click", (event) => {
      if (!wrap.contains(event.target)) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
    select.addEventListener("pick-sync", syncLabel);
    new MutationObserver(rebuild).observe(select, { childList: true });
    syncLabel();
  }

  function fillDeviceSelect(select, devices, selected) {
    if (!select) return;
    const options = [{ id: "", name: "Windows default" }, ...devices];
    const known = options.some((item) => item.id === selected);
    const next = known ? selected : "";
    const same = select.options.length === options.length && options.every((item, index) => select.options[index].value === item.id && select.options[index].textContent === item.name);
    if (!same) {
      select.replaceChildren(...options.map((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        return option;
      }));
    }
    if (select.value !== next) select.value = next;
    select.dispatchEvent(new Event("pick-sync"));
  }

  async function loadAudioDevices() {
    const note = document.querySelector("#audio-device-note");
    if (!LOCAL || !TOKEN) {
      if (note) note.textContent = "";
      return;
    }
    try {
      const listed = await request("/api/audio/devices");
      audioInputs = Array.isArray(listed.inputs) ? listed.inputs.filter((item) => item && item.id && item.name) : [];
      audioOutputs = Array.isArray(listed.outputs) ? listed.outputs.filter((item) => item && item.id && item.name) : [];
      if (note) note.textContent = audioInputs.length || audioOutputs.length ? "" : "No audio devices were found.";
    } catch (error) {
      if (note) note.textContent = error.message;
    }
  }

  async function previewChime(id) {
    if (previewAudio) previewAudio.pause();
    if (id !== "off") {
      try {
        await request("/api/widget/play", id === "custom" ? { custom: true } : { file: SOUND_FILES[id] });
        return;
      } catch {
        /* The browser player is the fallback when the widget is closed. */
      }
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }
    let src = "";
    if (id === "custom") {
      const response = await fetch("/api/chime", { headers: TOKEN ? { authorization: `Bearer ${TOKEN}` } : {} });
      if (!response.ok) throw new Error("Upload a sound before previewing it.");
      previewUrl = URL.createObjectURL(await response.blob());
      src = previewUrl;
    } else {
      src = `/sounds/${SOUND_FILES[id]}`;
    }
    previewAudio = new Audio(src);
    await previewAudio.play();
  }

  function wireChimes() {
    const input = document.querySelector("#chime-file");
    document.querySelector("#chime-upload").addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      input.value = "";
      const note = document.querySelector("#chime-note");
      if (!file) return;
      if (file.size > 8_000_000) {
        note.textContent = "That sound is larger than 8 MB.";
        return;
      }
      if (!LOCAL || !TOKEN) {
        note.textContent = "Uploaded sounds are saved in the desktop app.";
        return;
      }
      try {
        const response = await fetch("/api/chime", {
          method: "POST",
          headers: {
            authorization: `Bearer ${TOKEN}`,
            "content-type": file.type || "application/octet-stream",
          },
          body: file,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Upload failed.");
        revision = payload.revision;
        settings = payload;
        paint();
        note.textContent = "Your sound is ready. It is selected as the done sound, and you can use it for opening or closing too.";
      } catch (error) {
        note.textContent = error.message;
      }
    });
  }

  function paintWidget() {
    const project = document.querySelector("#dash-project");
    const instructions = document.querySelector("#dash-instructions");
    const files = document.querySelector("#dash-files");
    if (document.activeElement !== project) project.value = settings.project || "";
    if (document.activeElement !== instructions) instructions.value = settings.instructions || "";
    if (document.activeElement !== files) files.value = settings.files || "";
    document.querySelector("#dash-include-path").checked = settings.includePath === true;
    document.querySelector("#dash-include-stack").checked = settings.includeStack === true;
    document.querySelector("#dash-unsandboxed").checked = settings.unsandboxed === true;
    document.querySelector("#dash-experimental").checked = settings.experimental === true;
    renderIdeChoices();
    renderInstallChoices();
    renderRouteChoices();
    renderWorkspaceChoices();
  }

  function paintAccount() {
    const connected = settings.cursorConnected === true;
    const button = document.querySelector("#dash-connect");
    const note = document.querySelector("#dash-key-note");
    if (button) button.hidden = connected;
    if (note && note.dataset.hold !== "1") {
      note.textContent = connected
        ? "Cursor is connected. Hooxie can send."
        : "Press Connect Cursor. Sign-in opens in the browser.";
    }
  }

  function choiceButton(label, checked, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-checked", String(checked));
    button.addEventListener("click", onClick);
    return button;
  }

  function renderIdeChoices() {
    const select = document.querySelector("#dash-ide");
    if (!select) return;
    const rows = setupIdes.length
      ? setupIdes
      : (catalog.ides || []).map((ide) => ({ id: ide.ide, label: ide.label, installed: true }));
    const current = settings.ide || settings.connectedIde || "";
    select.replaceChildren();
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Choose an IDE";
    select.append(blank);
    for (const ide of rows) {
      const option = document.createElement("option");
      option.value = ide.id;
      option.dataset.installed = ide.installed || ide.connected ? "true" : "false";
      option.textContent = ide.installed || ide.connected ? ide.label : `${ide.label} · download`;
      select.append(option);
    }
    select.value = [...select.options].some((option) => option.value === current) ? current : "";
    const note = document.querySelector("#ide-note");
    const chosen = rows.find((ide) => ide.id === select.value);
    if (note && note.dataset.hold !== "1") {
      note.textContent = !chosen
        ? "The widget uses the IDE you pick."
        : chosen.connected
          ? "The widget uses this IDE."
          : chosen.installed
            ? "Installed. This choice connects it."
            : "Not on this computer. Choosing it opens the download.";
    }
  }

  async function loadSetupIdes() {
    if (!LOCAL || !TOKEN) {
      renderIdeChoices();
      return;
    }
    try {
      const report = await request("/api/setup");
      paid = report.licensed === true;
      paintBilling();
      setupIdes = [
        ...(report.ides || []).map((ide) => ({
          id: ide.ide,
          label: ide.label,
          installed: ide.installed === true,
          connected: ide.ide === report.connectedIde,
        })),
        ...(report.more || []).map((ide) => ({ id: ide.id, label: ide.label, installed: false })),
      ];
      renderIdeChoices();
    } catch {
      renderIdeChoices();
    }
  }

  async function switchIde(ide) {
    const select = document.querySelector("#dash-ide");
    const note = document.querySelector("#ide-note");
    const option = [...select.options].find((item) => item.value === ide);
    const installed = option?.dataset.installed === "true";
    const previous = settings.connectedIde || settings.ide || "";
    if (!ide) {
      if (previous && LOCAL && TOKEN) {
        try { await request("/api/ide/disconnect", { ide: previous }); } catch { /* The setting still clears below. */ }
      }
      delete note.dataset.hold;
      await save({ ide: "", installationId: "", connectedIde: "", route: "", deliveryReady: true });
      renderIdeChoices();
      return;
    }
    if (!installed) {
      if (note) {
        note.dataset.hold = "1";
        note.textContent = "Opening the download. The widget stays on the IDE that is already connected.";
      }
      select.value = previous;
      if (LOCAL && TOKEN) {
        try { await request("/api/ides/open", { ide }); } catch (error) {
          note.textContent = error.message;
        }
      }
      return;
    }
    await save({ ide, installationId: "", route: "", deliveryReady: true });
    loadRoutes();
    if (!LOCAL || !TOKEN) return;
    try {
      await request("/api/ide/connect", { ide });
      settings.connectedIde = ide;
      delete note.dataset.hold;
      await loadSetupIdes();
    } catch (error) {
      if (note) {
        note.dataset.hold = "1";
        note.textContent = error.message;
      }
    }
  }

  function renderInstallChoices() {
    const box = document.querySelector("#dash-installs");
    const label = document.querySelector("#dash-install-label");
    const matches = (catalog.installations || []).filter((item) => item.ide === (settings.ide || "cursor"));
    label.hidden = matches.length === 0;
    box.hidden = matches.length === 0;
    box.replaceChildren(...matches.map((item) => choiceButton(item.label, settings.installationId === item.id, () => {
      save({ installationId: item.id, deliveryReady: true });
    })));
  }

  function renderRouteChoices() {
    const box = document.querySelector("#dash-routes");
    const label = document.querySelector("#dash-route-label");
    const direct = (settings.ide || "cursor") === "cursor";
    label.hidden = direct || routes.length === 0;
    box.hidden = direct || routes.length === 0;
    box.replaceChildren(...routes.map((route) => choiceButton(route.label, settings.route === route.id, () => {
      save({ route: route.id, deliveryReady: true });
    })));
    const note = document.querySelector("#dash-route-note");
    const current = routes.find((route) => route.id === settings.route) || routes.find((route) => route.recommended);
    note.textContent = current && current.available === false ? (current.reason || "") : "";
    document.querySelector("#dash-sandbox-row").hidden = !current || current.id !== "cursor-sdk";
    document.querySelector("#dash-experimental-row").hidden = !current || current.id !== "companion";
  }

  function renderWorkspaceChoices() {
    const box = document.querySelector("#dash-workspaces");
    const buttons = [];
    for (const session of catalog.sessions || []) {
      for (const workspace of session.workspaces || []) {
        buttons.push(choiceButton(`${session.ide}: ${workspace.name}`, settings.project === workspace.path, () => {
          save({ ide: session.ide, project: workspace.path, deliveryReady: true });
          loadRoutes();
        }));
      }
    }
    box.replaceChildren(...buttons);
  }

  async function loadRoutes() {
    const project = (settings.project || "").trim();
    if (!LOCAL || !TOKEN || !project) {
      routes = [];
      renderRouteChoices();
      return;
    }
    try {
      const body = await request(`/api/routes?ide=${encodeURIComponent(settings.ide || "cursor")}&projectPath=${encodeURIComponent(project)}`);
      routes = body.routes || [];
      if (!routes.some((route) => route.id === settings.route)) {
        const agent = routes.find((route) => route.id === "cursor-sdk");
        const recommended = routes.find((route) => route.recommended);
        const next = settings.ide === "cursor" && agent ? agent.id : (recommended ? recommended.id : "");
        if (next && next !== settings.route) {
          save({ route: next, deliveryReady: true });
          return;
        }
      }
      renderRouteChoices();
    } catch (error) {
      routes = [];
      document.querySelector("#dash-route-note").textContent = error.message;
    }
  }

  function wireWidget() {
    const project = document.querySelector("#dash-project");
    const instructions = document.querySelector("#dash-instructions");
    const files = document.querySelector("#dash-files");
    let textTimer = 0;
    const later = (partial) => {
      window.clearTimeout(textTimer);
      textTimer = window.setTimeout(() => save({ ...partial, deliveryReady: true }), 250);
    };
    project.addEventListener("input", () => later({ project: project.value }));
    project.addEventListener("change", () => { save({ project: project.value, deliveryReady: true }); loadRoutes(); });
    instructions.addEventListener("input", () => later({ instructions: instructions.value }));
    files.addEventListener("input", () => later({ files: files.value }));
    document.querySelector("#dash-include-path").addEventListener("change", (event) => save({ includePath: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-include-stack").addEventListener("change", (event) => save({ includeStack: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-unsandboxed").addEventListener("change", (event) => save({ unsandboxed: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-experimental").addEventListener("change", (event) => save({ experimental: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-ide").addEventListener("change", (event) => {
      switchIde(event.target.value).catch((error) => {
        status.textContent = error.message;
      });
    });
    document.querySelector("#dash-browse").addEventListener("click", async () => {
      try {
        const body = await request("/api/browse", { initialPath: project.value.trim() });
        if (!body.path) return;
        await save({ project: body.path, deliveryReady: true });
        loadRoutes();
      } catch (error) {
        status.textContent = error.message;
      }
    });
    document.querySelector("#dash-clear").addEventListener("click", () => {
      save({ project: "", files: "", deliveryReady: true });
      loadRoutes();
    });
    document.querySelector("#dash-open-ide").addEventListener("click", async () => {
      try {
        const body = await request("/api/open", { installationId: settings.installationId, projectPath: settings.project || "" });
        status.textContent = body.detail || "Opened.";
      } catch (error) {
        status.textContent = error.message;
      }
    });
    document.querySelector("#dash-save-key").addEventListener("click", async () => {
      const note = document.querySelector("#dash-key-note");
      try {
        await request("/api/key", {
          apiKey: document.querySelector("#dash-key").value,
          remember: document.querySelector("#dash-remember-key").checked,
        });
        document.querySelector("#dash-key").value = "";
        settings.cursorConnected = true;
        delete note.dataset.hold;
        paint();
        loadRoutes();
      } catch (error) {
        note.dataset.hold = "1";
        note.textContent = error.message;
      }
    });
    document.querySelector("#dash-connect").addEventListener("click", async () => {
      const note = document.querySelector("#dash-key-note");
      const button = document.querySelector("#dash-connect");
      button.disabled = true;
      note.dataset.hold = "1";
      note.textContent = "Finish sign-in in the browser.";
      try {
        const result = await request("/api/cursor/connect", {});
        settings.cursorConnected = result.connected === true;
        delete note.dataset.hold;
        paint();
        loadRoutes();
      } catch (error) {
        note.textContent = error.message;
      } finally {
        button.disabled = false;
        if (settings.cursorConnected === true) delete note.dataset.hold;
      }
    });
  }
}

function paintReleaseNotes() {
  const root = document.querySelector("#release-notes");
  if (!root) return;
  fetch("/releases.json")
    .then((response) => response.json())
    .then((log) => {
      root.replaceChildren();
      (log.updates || []).forEach((update, index) => {
        const article = document.createElement("article");
        article.className = "release";
        article.id = `v${update.version}`;
        const mark = document.createElement("div");
        mark.className = "release-mark";
        mark.setAttribute("aria-hidden", "true");
        const body = document.createElement("div");
        body.className = "release-body";
        const card = document.createElement("div");
        card.className = "release-card";
        const meta = document.createElement("header");
        meta.className = "release-meta";
        const tag = document.createElement("span");
        tag.className = "release-tag";
        tag.textContent = update.tag || `v${update.version}`;
        meta.append(tag);
        if (index === 0) {
          const latest = document.createElement("span");
          latest.className = "release-latest";
          latest.textContent = "Latest";
          meta.append(latest);
        }
        const [year, month, day] = String(update.date).split("-").map(Number);
        const time = document.createElement("time");
        time.dateTime = update.date;
        time.textContent = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
        });
        meta.append(time);
        const title = document.createElement("h2");
        title.textContent = update.title || update.version;
        card.append(title);
        body.append(meta, card);
        for (const section of update.sections || []) {
          const heading = document.createElement("h3");
          heading.textContent = section.heading;
          const list = document.createElement("ul");
          for (const note of section.notes || []) {
            const item = document.createElement("li");
            item.textContent = note;
            list.append(item);
          }
          card.append(heading, list);
        }
        article.append(mark, body);
        root.append(article);
      });
    })
    .catch(() => {
      root.textContent = "Release notes could not be loaded.";
    });
}

async function request(path, body) {
  const headers = { "content-type": "application/json" };
  if (LOCAL && TOKEN) headers.authorization = `Bearer ${TOKEN}`;
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}
