const COLORS = ["#ffffff", "#4d9fff", "#3ddc97", "#ff8a3d", "#ff5d8f", "#b07bff", "#ffe14a", "#ff4d4d", "#3ee0d2"];
const LOCAL = document.querySelector('meta[name="hooxie-local"]')?.content === "1";
const TOKEN = document.querySelector('meta[name="z-token"]')?.content || "";
const COPY = {
  en: {
    "nav.general": "Settings", "nav.onboarding": "Connections", "nav.keybinds": "Keybinds", "nav.profile": "Profile", "nav.language": "Language", "nav.billing": "Billing", "nav.support": "Support", "nav.releases": "Release notes", "nav.help": "Help center", "nav.contact": "Contact support", "nav.toggle": "Toggle Hooxie", "nav.quit": "Quit Hooxie",
    "general.title": "Settings", "general.intro": "Appearance, audio, and sounds for this computer.", "general.upload": "Upload a sound",
    "ide.title": "Connections", "ide.note": "Connect a service, pick an IDE, and choose a project file or folder.", "ide.browse": "Browse", "ide.clear": "Clear", "ide.connect": "Connect Cursor", "ide.save": "Save key", "ide.open": "Open IDE",
    "keybinds.title": "Keybinds", "keybinds.note": "These shortcuts work while Hooxie is running. Arrow moves stay off until you turn on Arrow keys in Settings.",
    "profile.title": "Profile", "profile.note": "Connect the email Stripe should use for this computer.", "profile.connect": "Connect account",
    "language.title": "Language", "language.note": "The dashboard language on this computer.",
    "billing.title": "Billing", "billing.note": "One purchase covers this computer. Copying the app or its files does not license another device.", "billing.plan": "This computer", "billing.once": "once", "billing.lead": "Included with Hooxie:", "billing.item1": "The widget, voice, and screen context", "billing.item2": "Undetectable mode on this computer", "billing.item3": "A license that stays on this device", "billing.subscribe": "Buy for this computer", "billing.paid": "Already paid", "billing.receipt": "Paid $5.99 once for the Hooxie license on this computer.", "billing.promo": "Promotional code",
    "releases.title": "Release notes", "releases.open": "Open the release notes page",
    "help.title": "Help center", "help.open": "Open the help center", "help.s1": "Start Hooxie", "help.p1": "Run Hooxie on Windows. The pill sits at the top center. Choose the project folder before the first prompt.", "help.s2": "Voice, screen, and files", "help.p2": "An empty prompt shows the microphone. Text turns that button into send. While the agent is working, the same button is a square and stops the run. “View the screen” attaches a screenshot. The plus button adds files or a folder.", "help.s3": "Hide from a call", "help.p3": "Turn Detectable off, or start a session with Ctrl+Shift+\\. You still see the pill and the dashboard. A normal screen share does not see either window.",
    "contact.title": "Contact support", "contact.note": "Email support@delexo.store.", "contact.open": "Open the contact form",
    "mode.light": "Light", "mode.dark": "Dark", "session.running": "Running", "session.stopped": "Stopped",
    "status.shown": "Hooxie is on screen.", "status.hidden": "Hooxie is hidden. Ctrl+\\ shows it again.", "status.desktop": "Toggle Hooxie from the desktop app.",
  },
  es: {
    "nav.general": "Ajustes", "nav.onboarding": "Conexiones", "nav.keybinds": "Atajos", "nav.profile": "Perfil", "nav.language": "Idioma", "nav.billing": "Facturación", "nav.support": "Soporte", "nav.releases": "Notas de versión", "nav.help": "Centro de ayuda", "nav.contact": "Contacto", "nav.toggle": "Mostrar u ocultar", "nav.quit": "Salir de Hooxie",
    "general.title": "Ajustes", "general.intro": "Apariencia, audio y sonidos de este equipo.", "general.upload": "Subir un sonido",
    "ide.title": "Conexiones", "ide.note": "Conecta un servicio, elige un IDE y un archivo o carpeta del proyecto.", "ide.browse": "Examinar", "ide.clear": "Borrar", "ide.connect": "Conectar Cursor", "ide.save": "Guardar clave", "ide.open": "Abrir IDE",
    "keybinds.title": "Atajos", "keybinds.note": "Estos atajos funcionan mientras Hooxie está abierto. Las flechas no mueven el widget hasta que actives las teclas de flecha en Ajustes.",
    "profile.title": "Perfil", "profile.note": "Conecta el correo que Stripe debe usar para este equipo.", "profile.connect": "Conectar cuenta",
    "language.title": "Idioma", "language.note": "El idioma del panel en este equipo.",
    "billing.title": "Facturación", "billing.note": "Una compra cubre este equipo. Copiar la aplicación o sus archivos no licencia otro dispositivo.", "billing.plan": "Este equipo", "billing.once": "una vez", "billing.lead": "Incluido con Hooxie:", "billing.item1": "El widget, la voz y el contexto de pantalla", "billing.item2": "Modo indetectable en este equipo", "billing.item3": "Una licencia que se queda en este dispositivo", "billing.subscribe": "Comprar para este equipo", "billing.paid": "Ya está pagado", "billing.receipt": "Pagado $5.99 una vez por la licencia de Hooxie en este equipo.", "billing.promo": "Código promocional",
    "releases.title": "Notas de versión", "releases.open": "Abrir la página de notas",
    "help.title": "Centro de ayuda", "help.open": "Abrir el centro de ayuda", "help.s1": "Inicia Hooxie", "help.p1": "Ejecuta Hooxie en Windows. La pastilla queda arriba, al centro. Elige la carpeta del proyecto antes del primer mensaje.", "help.s2": "Voz, pantalla y archivos", "help.p2": "Un mensaje vacío muestra el micrófono. El texto convierte ese botón en enviar. Mientras el agente trabaja, el mismo botón es un cuadrado y detiene la ejecución. “Ver la pantalla” adjunta una captura. El botón más añade archivos o una carpeta.", "help.s3": "Ocultar en una llamada", "help.p3": "Apaga Detectable, o inicia una sesión con Ctrl+Mayús+\\. Tú sigues viendo Hooxie. Una pantalla compartida normal no.",
    "contact.title": "Contactar soporte", "contact.note": "Escribe a support@delexo.store.", "contact.open": "Abrir el formulario",
    "mode.light": "Claro", "mode.dark": "Oscuro", "session.running": "En curso", "session.stopped": "Detenido",
    "status.shown": "Hooxie está en pantalla.", "status.hidden": "Hooxie está oculto. Ctrl+\\ lo muestra de nuevo.", "status.desktop": "Muestra u oculta Hooxie desde la aplicación.",
  },
  fr: {
    "nav.general": "Réglages", "nav.onboarding": "Connexions", "nav.keybinds": "Raccourcis", "nav.profile": "Profil", "nav.language": "Langue", "nav.billing": "Facturation", "nav.support": "Assistance", "nav.releases": "Notes de version", "nav.help": "Centre d'aide", "nav.contact": "Contact", "nav.toggle": "Afficher ou masquer", "nav.quit": "Quitter Hooxie",
    "general.title": "Réglages", "general.intro": "Apparence, audio et sons de cet ordinateur.", "general.upload": "Importer un son",
    "ide.title": "Connexions", "ide.note": "Connectez un service, choisissez un IDE et un fichier ou un dossier du projet.", "ide.browse": "Parcourir", "ide.clear": "Effacer", "ide.connect": "Connecter Cursor", "ide.save": "Enregistrer la clé", "ide.open": "Ouvrir l'IDE",
    "keybinds.title": "Raccourcis", "keybinds.note": "Ces raccourcis marchent tant que Hooxie est ouvert. Les flèches ne déplacent le widget qu'après avoir activé les touches fléchées dans Réglages.",
    "profile.title": "Profil", "profile.note": "Indiquez l'e-mail que Stripe doit utiliser pour cet ordinateur.", "profile.connect": "Connecter le compte",
    "language.title": "Langue", "language.note": "La langue du tableau de bord sur cet ordinateur.",
    "billing.title": "Facturation", "billing.note": "Un achat couvre cet ordinateur. Copier l'application ou ses fichiers ne donne pas de licence à un autre appareil.", "billing.plan": "Cet ordinateur", "billing.once": "une fois", "billing.lead": "Inclus avec Hooxie :", "billing.item1": "Le widget, la voix et le contexte d'écran", "billing.item2": "Le mode invisible sur cet ordinateur", "billing.item3": "Une licence qui reste sur cet appareil", "billing.subscribe": "Acheter pour cet ordinateur", "billing.paid": "Déjà payé", "billing.receipt": "Payé 5,99 $ une fois pour la licence Hooxie sur cet ordinateur.", "billing.promo": "Code promotionnel",
    "releases.title": "Notes de version", "releases.open": "Ouvrir la page des notes",
    "help.title": "Centre d'aide", "help.open": "Ouvrir le centre d'aide", "help.s1": "Démarrer Hooxie", "help.p1": "Lancez Hooxie sur Windows. La pilule se place en haut au centre. Choisissez le dossier du projet avant le premier message.", "help.s2": "Voix, écran et fichiers", "help.p2": "Un message vide affiche le microphone. Le texte transforme ce bouton en envoi. Pendant que l'agent travaille, le même bouton est un carré et arrête l'exécution. « Voir l'écran » joint une capture. Le bouton plus ajoute des fichiers ou un dossier.", "help.s3": "Masquer pendant un appel", "help.p3": "Désactivez Détectable, ou démarrez une session avec Ctrl+Maj+\\. Vous voyez toujours Hooxie. Un partage d'écran normal ne le voit pas.",
    "contact.title": "Contacter le support", "contact.note": "Écrivez à support@delexo.store.", "contact.open": "Ouvrir le formulaire",
    "mode.light": "Clair", "mode.dark": "Sombre", "session.running": "En cours", "session.stopped": "Arrêté",
    "status.shown": "Hooxie est à l'écran.", "status.hidden": "Hooxie est masqué. Ctrl+\\ le réaffiche.", "status.desktop": "Affichez ou masquez Hooxie depuis l'application.",
  },
  de: {
    "nav.general": "Einstellungen", "nav.onboarding": "Verbindungen", "nav.keybinds": "Tasten", "nav.profile": "Profil", "nav.language": "Sprache", "nav.billing": "Abrechnung", "nav.support": "Support", "nav.releases": "Versionshinweise", "nav.help": "Hilfe", "nav.contact": "Kontakt", "nav.toggle": "Ein- oder ausblenden", "nav.quit": "Hooxie beenden",
    "general.title": "Einstellungen", "general.intro": "Darstellung, Audio und Töne auf diesem Computer.", "general.upload": "Ton hochladen",
    "ide.title": "Verbindungen", "ide.note": "Verbinde einen Dienst, wähle eine IDE und eine Projektdatei oder einen Ordner.", "ide.browse": "Durchsuchen", "ide.clear": "Leeren", "ide.connect": "Cursor verbinden", "ide.save": "Schlüssel sichern", "ide.open": "IDE öffnen",
    "keybinds.title": "Tasten", "keybinds.note": "Diese Kürzel gelten, solange Hooxie läuft. Pfeiltasten bewegen das Widget erst, wenn du sie unter Einstellungen einschaltest.",
    "profile.title": "Profil", "profile.note": "Verbinde die E-Mail, die Stripe für diesen Computer nutzen soll.", "profile.connect": "Konto verbinden",
    "language.title": "Sprache", "language.note": "Die Sprache dieses Fensters auf diesem Computer.",
    "billing.title": "Abrechnung", "billing.note": "Ein Kauf gilt für diesen Computer. Das Kopieren der App oder ihrer Dateien lizenziert kein anderes Gerät.", "billing.plan": "Dieser Computer", "billing.once": "einmal", "billing.lead": "In Hooxie enthalten:", "billing.item1": "Widget, Sprache und Bildschirmkontext", "billing.item2": "Unsichtbarer Modus auf diesem Computer", "billing.item3": "Eine Lizenz, die auf diesem Gerät bleibt", "billing.subscribe": "Für diesen Computer kaufen", "billing.paid": "Bereits bezahlt", "billing.receipt": "5,99 $ einmal für die Hooxie-Lizenz auf diesem Computer bezahlt.", "billing.promo": "Aktionscode",
    "releases.title": "Versionshinweise", "releases.open": "Versionshinweise öffnen",
    "help.title": "Hilfe", "help.open": "Hilfe öffnen", "help.s1": "Hooxie starten", "help.p1": "Starte Hooxie unter Windows. Die Pille sitzt oben in der Mitte. Wähle den Projektordner vor der ersten Eingabe.", "help.s2": "Sprache, Bildschirm und Dateien", "help.p2": "Eine leere Eingabe zeigt das Mikrofon. Text macht aus dem Knopf Senden. Während der Agent arbeitet, ist derselbe Knopf ein Quadrat und stoppt den Lauf. „Bildschirm ansehen“ hängt einen Screenshot an. Plus fügt Dateien oder einen Ordner hinzu.", "help.s3": "In einem Anruf ausblenden", "help.p3": "Schalte Erkennbar aus, oder starte eine Sitzung mit Strg+Umschalt+\\. Du siehst Hooxie weiter. Eine normale Bildschirmfreigabe nicht.",
    "contact.title": "Support kontaktieren", "contact.note": "Schreib an support@delexo.store.", "contact.open": "Formular öffnen",
    "mode.light": "Hell", "mode.dark": "Dunkel", "session.running": "Läuft", "session.stopped": "Gestoppt",
    "status.shown": "Hooxie ist auf dem Bildschirm.", "status.hidden": "Hooxie ist ausgeblendet. Strg+\\ zeigt es wieder.", "status.desktop": "Blende Hooxie in der App ein oder aus.",
  },
  pt: {
    "nav.general": "Ajustes", "nav.onboarding": "Conexões", "nav.keybinds": "Atalhos", "nav.profile": "Perfil", "nav.language": "Idioma", "nav.billing": "Cobrança", "nav.support": "Suporte", "nav.releases": "Notas da versão", "nav.help": "Central de ajuda", "nav.contact": "Contato", "nav.toggle": "Mostrar ou ocultar", "nav.quit": "Sair do Hooxie",
    "general.title": "Ajustes", "general.intro": "Aparência, áudio e sons deste computador.", "general.upload": "Enviar um som",
    "ide.title": "Conexões", "ide.note": "Conecte um serviço, escolha um IDE e um arquivo ou pasta do projeto.", "ide.browse": "Procurar", "ide.clear": "Limpar", "ide.connect": "Conectar o Cursor", "ide.save": "Salvar chave", "ide.open": "Abrir o IDE",
    "keybinds.title": "Atalhos", "keybinds.note": "Estes atalhos funcionam enquanto o Hooxie está aberto. As setas só movem o widget depois que você liga as teclas de seta em Ajustes.",
    "profile.title": "Perfil", "profile.note": "Conecte o e-mail que o Stripe deve usar neste computador.", "profile.connect": "Conectar conta",
    "language.title": "Idioma", "language.note": "O idioma do painel neste computador.",
    "billing.title": "Cobrança", "billing.note": "Uma compra cobre este computador. Copiar o aplicativo ou os arquivos não licencia outro dispositivo.", "billing.plan": "Este computador", "billing.once": "uma vez", "billing.lead": "Incluído no Hooxie:", "billing.item1": "O widget, a voz e o contexto da tela", "billing.item2": "Modo indetectável neste computador", "billing.item3": "Uma licença que fica neste dispositivo", "billing.subscribe": "Comprar para este computador", "billing.paid": "Já pago", "billing.receipt": "Pago US$ 5,99 uma vez pela licença do Hooxie neste computador.", "billing.promo": "Código promocional",
    "releases.title": "Notas da versão", "releases.open": "Abrir as notas da versão",
    "help.title": "Central de ajuda", "help.open": "Abrir a central de ajuda", "help.s1": "Iniciar o Hooxie", "help.p1": "Execute o Hooxie no Windows. A pílula fica no topo, ao centro. Escolha a pasta do projeto antes do primeiro pedido.", "help.s2": "Voz, tela e arquivos", "help.p2": "Um pedido vazio mostra o microfone. O texto transforma esse botão em enviar. Enquanto o agente trabalha, o mesmo botão é um quadrado e interrompe a execução. “Ver a tela” anexa uma captura. O botão de mais adiciona arquivos ou uma pasta.", "help.s3": "Ocultar numa chamada", "help.p3": "Desligue Detectável, ou inicie uma sessão com Ctrl+Shift+\\. Você continua vendo o Hooxie. Um compartilhamento normal de tela não.",
    "contact.title": "Falar com o suporte", "contact.note": "Escreva para support@delexo.store.", "contact.open": "Abrir o formulário",
    "mode.light": "Claro", "mode.dark": "Escuro", "session.running": "Em execução", "session.stopped": "Parado",
    "status.shown": "O Hooxie está na tela.", "status.hidden": "O Hooxie está oculto. Ctrl+\\ mostra de novo.", "status.desktop": "Mostre ou oculte o Hooxie no aplicativo.",
  },
  ja: {
    "nav.general": "設定", "nav.onboarding": "接続", "nav.keybinds": "キー", "nav.profile": "プロフィール", "nav.language": "言語", "nav.billing": "料金", "nav.support": "サポート", "nav.releases": "リリースノート", "nav.help": "ヘルプ", "nav.contact": "連絡", "nav.toggle": "表示の切り替え", "nav.quit": "Hooxie を終了",
    "general.title": "設定", "general.intro": "このパソコンの外観、音声、効果音。", "general.upload": "音をアップロード",
    "ide.title": "接続", "ide.note": "サービスを接続し、IDE とプロジェクトのファイルまたはフォルダを選びます。", "ide.browse": "参照", "ide.clear": "クリア", "ide.connect": "Cursor を接続", "ide.save": "キーを保存", "ide.open": "IDE を開く",
    "keybinds.title": "キー", "keybinds.note": "Hooxie の実行中に使えるショートカットです。矢印キーは、設定で矢印キーをオンにするまでウィジェットを動かしません。",
    "profile.title": "プロフィール", "profile.note": "このパソコンの支払いに使うメールを接続します。", "profile.connect": "アカウントを接続",
    "language.title": "言語", "language.note": "このパソコンのダッシュボードの言語。",
    "billing.title": "料金", "billing.note": "1回の購入でこのパソコンを使えます。アプリやファイルをコピーしても、別の端末のライセンスにはなりません。", "billing.plan": "このパソコン", "billing.once": "1回", "billing.lead": "Hooxie に含まれるもの:", "billing.item1": "ウィジェット、音声、画面の内容", "billing.item2": "このパソコンでの検知されないモード", "billing.item3": "この端末に残るライセンス", "billing.subscribe": "このパソコン用に購入", "billing.paid": "支払い済み", "billing.receipt": "このパソコンの Hooxie ライセンスとして $5.99 を一度支払いました。", "billing.promo": "プロモーションコード",
    "releases.title": "リリースノート", "releases.open": "リリースノートを開く",
    "help.title": "ヘルプ", "help.open": "ヘルプを開く", "help.s1": "Hooxie を起動", "help.p1": "Windows で Hooxie を起動します。ピルは上中央にあります。最初のプロンプトの前にプロジェクトフォルダーを選びます。", "help.s2": "音声、画面、ファイル", "help.p2": "空のプロンプトではマイクが表示されます。文字を入れるとそのボタンが送信になります。エージェントの作業中は同じボタンが四角になり、実行を止めます。「画面を見る」はスクリーンショットを添付します。プラスはファイルやフォルダーを追加します。", "help.s3": "通話中に隠す", "help.p3": "検出可能をオフにするか、Ctrl+Shift+\\ でセッションを始めます。自分には見えます。通常の画面共有には映りません。",
    "contact.title": "サポートに連絡", "contact.note": "support@delexo.store にメールします。", "contact.open": "フォームを開く",
    "mode.light": "ライト", "mode.dark": "ダーク", "session.running": "実行中", "session.stopped": "停止",
    "status.shown": "Hooxie は画面に出ています。", "status.hidden": "Hooxie は隠れています。Ctrl+\\ で戻ります。", "status.desktop": "アプリから Hooxie の表示を切り替えます。",
  },
  zh: {
    "nav.general": "设置", "nav.onboarding": "连接", "nav.keybinds": "快捷键", "nav.profile": "账户", "nav.language": "语言", "nav.billing": "账单", "nav.support": "支持", "nav.releases": "更新说明", "nav.help": "帮助中心", "nav.contact": "联系支持", "nav.toggle": "显示或隐藏", "nav.quit": "退出 Hooxie",
    "general.title": "设置", "general.intro": "这台电脑的外观、音频和声音。", "general.upload": "上传声音",
    "ide.title": "连接", "ide.note": "连接服务，选择 IDE 和项目文件或文件夹。", "ide.browse": "浏览", "ide.clear": "清除", "ide.connect": "连接 Cursor", "ide.save": "保存密钥", "ide.open": "打开 IDE",
    "keybinds.title": "快捷键", "keybinds.note": "这些快捷键在 Hooxie 运行时可用。在“设置”里打开方向键之前，方向键不会移动小组件。",
    "profile.title": "账户", "profile.note": "填写这台电脑付款时 Stripe 要使用的邮箱。", "profile.connect": "连接账户",
    "language.title": "语言", "language.note": "这台电脑上的仪表盘语言。",
    "billing.title": "账单", "billing.note": "一次购买只覆盖这台电脑。复制应用或文件不能给另一台设备授权。", "billing.plan": "这台电脑", "billing.once": "一次", "billing.lead": "Hooxie 包含：", "billing.item1": "小组件、语音和屏幕内容", "billing.item2": "这台电脑上的不可检测模式", "billing.item3": "留在这台设备上的许可证", "billing.subscribe": "为这台电脑购买", "billing.paid": "已购买", "billing.receipt": "已为这台电脑的 Hooxie 许可证支付一次 $5.99。", "billing.promo": "优惠码",
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
  const success = document.querySelector("#contact-success");
  if (!form) return;
  const fields = ["name", "email", "message"];
  const showFieldError = (name, text) => {
    const input = form.querySelector(`[name="${name}"]`);
    const error = document.querySelector(`#contact-${name}-error`);
    if (input) input.setAttribute("aria-invalid", text ? "true" : "false");
    if (!error) return;
    error.hidden = !text;
    error.textContent = text || "";
  };
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (success) success.hidden = true;
    const submit = form.querySelector("button[type=submit]");
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Sending…";
    }
    try {
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();
      for (const field of fields) showFieldError(field, "");
      let payload = {};
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        });
        payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const problems = payload.fields || {};
          if (!Object.keys(problems).length) {
            showFieldError("message", payload.error || "The form could not be checked. Email support@delexo.store.");
            return;
          }
          for (const field of fields) showFieldError(field, problems[field] || "");
          return;
        }
      } catch {
        showFieldError("message", "The form could not be checked. Email support@delexo.store.");
        return;
      }
      if (success) success.hidden = false;
      const subject = encodeURIComponent(`Hooxie support from ${name}`);
      const body = encodeURIComponent(`${message}\n\n${email}`);
      location.href = `mailto:support@delexo.store?subject=${subject}&body=${body}`;
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Email support";
      }
    }
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
      status.classList.remove("is-error");
      status.textContent = widgetShown ? "" : t("status.hidden");
    } catch (error) {
      explainFailure(status, error);
    } finally {
      toggle.disabled = false;
    }
  });
  document.querySelector("#quit-hooxie")?.addEventListener("click", async () => {
    if (!LOCAL || !TOKEN) {
      status.textContent = t("status.desktop");
      return;
    }
    const quit = document.querySelector("#quit-hooxie");
    if (quit) quit.disabled = true;
    try {
      await request("/api/widget/exit", {});
    } catch (error) {
      explainFailure(status, error);
      if (quit) quit.disabled = false;
    }
  });
}

function explainFailure(status, error) {
  if (!status) return;
  const message = error?.message || "That request did not go through.";
  status.classList.add("is-error");
  status.textContent = /support@delexo\.store/.test(message) ? message : `${message} Try again, or email support@delexo.store.`;
}

function showPromoError(message) {
  const input = document.querySelector("#promo");
  const error = document.querySelector("#promo-error");
  if (input) {
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }
  if (!error) return;
  error.hidden = !message;
  error.textContent = message || "";
}

function bootDashboard() {
  if (!LOCAL) {
    document.title = "Hooxie";
    document.body.replaceChildren();
    const note = document.createElement("p");
    note.textContent = "The dashboard opens in the Hooxie app.";
    note.style.cssText = "margin:0;min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px";
    document.body.hidden = false;
    document.body.append(note);
    return;
  }
  document.body.hidden = false;
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
  const languageSelect = document.querySelector("#language-choices");
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
    negativePrompt: "",
    memoryId: "",
    memory: [],
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
  const keyed = new Set();

  for (const color of COLORS) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.dataset.color = color;
    swatch.style.background = color;
    swatch.setAttribute("aria-label", color);
    swatch.addEventListener("click", () => save({ button: color, lookReady: true }));
    swatches.append(swatch);
  }

  function show(name) {
    const aliases = { onboarding: "ide", widget: "ide", profile: "billing" };
    const sectionName = aliases[name] || name;
    const current = sections.find((section) => !section.hidden);
    if (current?.dataset.section === sectionName) return;
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
    const title = document.querySelector("#page-title");
    const openSection = sections.find((section) => section.dataset.section === sectionName);
    if (title && openSection) {
      const key = openSection.dataset.title;
      if (key) {
        title.dataset.i18n = key;
        title.textContent = t(key);
      }
      if (openSection.firstElementChild !== title) openSection.prepend(title);
    }
    const main = document.querySelector(".main");
    if (main) main.scrollTop = 0;
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
  mountPickMenu(document.querySelector("#key-service"));
  mountPickMenu(document.querySelector("#service-choice"));
  mountPickMenu(languageSelect);

  function paint() {
    detectable.checked = settings.detectable !== false;
    audio.checked = settings.audio !== false;
    const voiceActivation = document.querySelector("#voice-activation");
    if (voiceActivation) voiceActivation.checked = settings.voiceActivation === true;
    if (document.activeElement !== opacity) {
      opacity.value = String(settings.opacity ?? 50);
      opacityValue.textContent = `${opacity.value}%`;
    }
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
    const promo = document.querySelector("#promo");
    const promoLine = document.querySelector(".promo-line");
    const price = document.querySelector(".plan-price");
    if (!button) return;
    button.textContent = t(paid ? "billing.paid" : "billing.subscribe");
    button.disabled = paid;
    if (promo) promo.hidden = paid;
    if (promoLine) promoLine.hidden = paid;
    if (price) price.hidden = false;
    const receipt = document.querySelector("#receipt");
    if (receipt) receipt.hidden = !paid;
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
    const known = languageSelect && [...languageSelect.options].some((option) => option.value === code);
    const next = known ? code : "en";
    if (languageSelect && languageSelect.value !== next) languageSelect.value = next;
    languageSelect?.dispatchEvent(new Event("pick-sync"));
    applyLanguage(next);
  }

  function applyLanguage(code) {
    const lang = COPY[code] ? code : "en";
    const table = { ...COPY.en, ...(COPY[lang] || {}) };
    document.documentElement.lang = lang;
    for (const node of document.querySelectorAll("[data-i18n]")) {
      const next = table[node.dataset.i18n];
      if (!next || node.textContent === next) continue;
      node.textContent = next;
      const button = node.closest("button");
      if (button?.querySelector("[data-i18n]") === node && button.title !== next) button.title = next;
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
      explainFailure(status, error);
    }
  }

  detectable.addEventListener("change", () => save({ detectable: detectable.checked }));
  audio.addEventListener("change", () => save({ audio: audio.checked }));
  inputDevice?.addEventListener("change", () => save({ inputDevice: inputDevice.value }));
  outputDevice?.addEventListener("change", () => save({ outputDevice: outputDevice.value }));
  document.querySelector("#voice-activation").addEventListener("change", (event) => save({ voiceActivation: event.target.checked }));
  document.querySelector("#trace").addEventListener("change", (event) => save({ trace: event.target.checked, lookReady: true }));
  document.querySelector("#arrows").addEventListener("change", (event) => save({ arrows: event.target.checked }));
  let opacityTimer = 0;
  opacity.addEventListener("input", () => {
    opacityValue.textContent = `${opacity.value}%`;
    window.clearTimeout(opacityTimer);
    opacityTimer = window.setTimeout(() => save({ opacity: Number(opacity.value), lookReady: true }), 80);
  });
  languageSelect?.addEventListener("change", () => save({ language: languageSelect.value }));
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
    const button = document.querySelector("#subscribe");
    status.classList.remove("is-error");
    showPromoError("");
    status.textContent = "Opening checkout.";
    if (button) {
      button.disabled = true;
      button.textContent = "Opening checkout.";
    }
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
      if (/promotional code/i.test(error.message || "")) showPromoError(error.message);
      else explainFailure(status, error);
    } finally {
      paintBilling();
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
    if (result.licensed === true) paid = true;
    if (result.revision !== revision) {
      revision = result.revision;
      settings = result;
      paint();
      await loadRoutes();
    } else if (result.licensed === true) {
      paintBilling();
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
        status.classList.remove("is-error");
        status.textContent = result.active ? t("billing.receipt") : "Checkout is not complete yet.";
      }).catch((error) => { explainFailure(status, error); });
    }
  } else if (params.get("billing") === "cancel") {
    status.textContent = "Checkout was canceled.";
  }
  wireChimes();
  const SERVICES = [
    { id: "github", name: "GitHub", placeholder: "owner/repo" },
    { id: "gitlab", name: "GitLab", placeholder: "group/project" },
    { id: "bitbucket", name: "Bitbucket", placeholder: "owner/repo" },
    { id: "supabase", name: "Supabase", placeholder: "https://project.supabase.co" },
    { id: "vercel", name: "Vercel", placeholder: "https://example.com" },
    { id: "netlify", name: "Netlify", placeholder: "https://example.netlify.app" },
    { id: "cloudflare", name: "Cloudflare", placeholder: "example.com" },
    { id: "railway", name: "Railway", placeholder: "https://example.up.railway.app" },
    { id: "fly", name: "Fly.io", placeholder: "https://example.fly.dev" },
    { id: "shopify", name: "Shopify", placeholder: "example.myshopify.com" },
    { id: "render", name: "Render", link: true },
    { id: "neon", name: "Neon", link: true },
    { id: "planetscale", name: "PlanetScale", link: true },
    { id: "mongodb", name: "MongoDB", link: true },
    { id: "firebase", name: "Firebase", link: true },
    { id: "clerk", name: "Clerk", link: true },
    { id: "auth0", name: "Auth0", link: true },
    { id: "resend", name: "Resend", link: true },
    { id: "stripe", name: "Stripe", link: true },
    { id: "openai", name: "OpenAI", link: true },
    { id: "anthropic", name: "Anthropic", link: true },
    { id: "google", name: "Google Cloud", link: true },
    { id: "azure", name: "Azure", link: true },
    { id: "aws", name: "AWS", link: true },
    { id: "twilio", name: "Twilio", link: true },
    { id: "sendgrid", name: "SendGrid", link: true },
    { id: "postmark", name: "Postmark", link: true },
    { id: "sentry", name: "Sentry", link: true },
    { id: "datadog", name: "Datadog", link: true },
    { id: "linear", name: "Linear", link: true },
    { id: "notion", name: "Notion", link: true },
    { id: "slack", name: "Slack", link: true },
    { id: "discord", name: "Discord", link: true },
    { id: "figma", name: "Figma", link: true },
    { id: "huggingface", name: "Hugging Face", link: true },
    { id: "replicate", name: "Replicate", link: true },
    { id: "pinecone", name: "Pinecone", link: true },
    { id: "upstash", name: "Upstash", link: true },
    { id: "docker", name: "Docker Hub", link: true },
    { id: "npm", name: "npm", link: true },
  ];
  const KEY_TARGETS = [
    ["cursor", "Cursor"],
    ["vscode", "Visual Studio Code"],
    ["windsurf", "Windsurf"],
    ["jetbrains", "JetBrains"],
    ["visualstudio", "Visual Studio"],
    ["zed", "Zed"],
    ["sublime", "Sublime Text"],
    ["androidstudio", "Android Studio"],
    ["neovim", "Neovim"],
    ...SERVICES.map((service) => [service.id, service.name]),
  ];
  renderKeyChoices();
  renderServiceChoices();
  wireWidget();
  loadKeys().catch(() => undefined);
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
  let previewAudio = null;
  let previewUrl = "";
  wireSounds();
  refresh().catch((error) => { explainFailure(status, error); });
  loadAudioDevices().then(() => paint()).catch(() => undefined);
  if (LOCAL && TOKEN) window.setInterval(() => { refresh().catch(() => {}); }, 1500);

  function soundChoices() {
    const choices = SOUND_CHOICES.filter((item) => item[0] !== "off");
    if (settings.chimeCustom || settings.chime === "custom" || settings.openSound === "custom" || settings.closeSound === "custom") {
      choices.push(["custom", "Your sound"]);
    }
    choices.push(["off", "Off"]);
    return choices;
  }

  function paintSounds() {
    const choices = soundChoices();
    const signature = choices.map((item) => item[0]).join(",");
    for (const [slot, field] of Object.entries(SOUND_FIELDS)) {
      const select = document.querySelector(`#sound-${slot}`);
      if (!select) continue;
      if (select.dataset.signature !== signature) {
        select.dataset.signature = signature;
        select.replaceChildren(...choices.map(([id, label]) => {
          const option = document.createElement("option");
          option.value = id;
          option.textContent = label;
          return option;
        }));
      }
      const selected = settings[field] || (field === "chime" ? "blushing" : "off");
      if ([...select.options].some((item) => item.value === selected)) select.value = selected;
      select.dispatchEvent(new Event("pick-sync"));
      if (select.dataset.pickMenu !== "1") mountPickMenu(select);
    }
  }

  function wireSounds() {
    for (const [slot, field] of Object.entries(SOUND_FIELDS)) {
      const select = document.querySelector(`#sound-${slot}`);
      select?.addEventListener("change", () => save({ [field]: select.value }));
    }
    for (const button of document.querySelectorAll("[data-preview]")) {
      button.addEventListener("click", () => {
        const select = document.querySelector(`#sound-${button.dataset.preview}`);
        const id = select?.value;
        if (!id || id === "off") return;
        button.classList.add("is-playing");
        window.setTimeout(() => button.classList.remove("is-playing"), 700);
        previewChime(id).catch((error) => { explainFailure(status, error); });
      });
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
      previewChime(id).catch((error) => { explainFailure(status, error); });
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
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
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
    select.addEventListener("mousedown", (event) => event.preventDefault());
    select.before(wrap);
    wrap.append(select, button);
    document.body.append(list);

    function syncLabel() {
      const option = select.selectedOptions && select.selectedOptions[0];
      label.textContent = option ? option.textContent : "";
    }
    function rebuild() {
      const open = !list.hidden;
      const chosen = select.value;
      list.replaceChildren(...[...select.options].map((option) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "pick-menu-item";
        item.setAttribute("role", "option");
        item.dataset.value = option.value;
        item.textContent = option.textContent;
        item.setAttribute("aria-selected", String(option.value === chosen));
        item.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (select.value !== option.value) {
            select.value = option.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
          syncLabel();
          close();
        });
        return item;
      }));
      list.hidden = !open;
      syncLabel();
      if (open) place();
    }
    function place() {
      const box = button.getBoundingClientRect();
      const width = Math.max(box.width, 220);
      const left = Math.max(8, Math.min(box.left, window.innerWidth - width - 8));
      const below = window.innerHeight - box.bottom;
      const above = box.top;
      list.style.width = `${width}px`;
      list.style.left = `${left}px`;
      list.style.right = "auto";
      if (below < 220 && above > below) {
        list.style.top = "auto";
        list.style.bottom = `${window.innerHeight - box.top + 6}px`;
      } else {
        list.style.bottom = "auto";
        list.style.top = `${box.bottom + 6}px`;
      }
      const selected = list.querySelector(".pick-menu-item[aria-selected='true']");
      if (selected) {
        const top = selected.offsetTop;
        const bottom = top + selected.offsetHeight;
        if (top < list.scrollTop) list.scrollTop = top;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
      }
    }
    function close() {
      list.hidden = true;
      button.setAttribute("aria-expanded", "false");
    }
    function open() {
      for (const menu of document.querySelectorAll(".pick-menu-list")) menu.hidden = true;
      for (const opener of document.querySelectorAll(".pick-menu-btn")) opener.setAttribute("aria-expanded", "false");
      rebuild();
      list.hidden = false;
      button.setAttribute("aria-expanded", "true");
      place();
    }
    function toggle() {
      if (list.hidden) open();
      else close();
    }
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggle();
    });
    const fieldLabel = select.id ? document.querySelector(`label[for="${CSS.escape(select.id)}"]`) : null;
    fieldLabel?.addEventListener("click", (event) => {
      event.preventDefault();
      toggle();
    });
    document.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (button.contains(target) || list.contains(target)) return;
      close();
    }, true);
    document.addEventListener("keydown", (event) => {
      if (list.hidden) return;
      if (event.key === "Escape") {
        close();
        return;
      }
      const items = [...list.querySelectorAll(".pick-menu-item")];
      if (!items.length) return;
      const current = items.findIndex((item) => item.getAttribute("aria-selected") === "true");
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") return;
      event.preventDefault();
      if (event.key === "Enter") {
        const chosen = items[current] || items[0];
        chosen?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = items[(current + step + items.length) % items.length];
      items.forEach((item) => item.setAttribute("aria-selected", String(item === next)));
      next.focus();
    });
    const scroller = wrap.closest(".main");
    scroller?.addEventListener("scroll", () => {
      if (!list.hidden) place();
    }, { passive: true });
    window.addEventListener("resize", () => {
      if (!list.hidden) place();
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
    const negative = document.querySelector("#dash-negative");
    if (document.activeElement !== project) project.value = settings.project || "";
    if (negative && document.activeElement !== negative) negative.value = settings.negativePrompt || "";
    document.querySelector("#dash-include-path").checked = settings.includePath === true;
    document.querySelector("#dash-include-stack").checked = settings.includeStack === true;
    document.querySelector("#dash-unsandboxed").checked = settings.unsandboxed === true;
    document.querySelector("#dash-experimental").checked = settings.experimental === true;
    renderIdeChoices();
    renderInstallChoices();
    renderRouteChoices();
    renderWorkspaceChoices();
    renderMemory();
  }

  function paintAccount() {
    const connected = settings.cursorConnected === true;
    const button = document.querySelector("#dash-connect");
    const note = document.querySelector("#dash-key-note");
    if (button) button.hidden = connected;
    if (note && note.dataset.hold !== "1") {
      note.textContent = connected
        ? "Cursor is connected. Saved keys stay in your user profile when Remember is on."
        : "Saved keys stay in your user profile when Remember is on.";
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
    const signature = rows.map((ide) => `${ide.id}\t${ide.label}\t${ide.installed || ide.connected ? "1" : "0"}`).join("\n");
    if (select.dataset.signature !== signature) {
      select.dataset.signature = signature;
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
    }
    const next = [...select.options].some((option) => option.value === current) ? current : "";
    if (select.value !== next) select.value = next;
    select.dispatchEvent(new Event("pick-sync"));
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
    const sync = () => select.dispatchEvent(new Event("pick-sync"));
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
      sync();
      if (LOCAL && TOKEN) {
        try { await request("/api/ides/open", { ide }); } catch (error) {
          note.textContent = error.message;
        }
      }
      return;
    }
    select.value = ide;
    sync();
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
      if (previous !== ide) await save({ ide: previous, deliveryReady: true });
    }
  }

  function renderInstallChoices() {
    const box = document.querySelector("#dash-installs");
    const label = document.querySelector("#dash-install-label");
    const matches = (catalog.installations || []).filter((item) => item.ide === (settings.ide || "cursor"));
    label.hidden = matches.length === 0;
    box.hidden = matches.length === 0;
    const signature = matches.map((item) => `${item.id}\t${item.label}\t${settings.installationId === item.id ? "1" : "0"}`).join("\n");
    if (box.dataset.signature === signature) return;
    box.dataset.signature = signature;
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
    const signature = routes.map((route) => `${route.id}\t${route.label}\t${settings.route === route.id ? "1" : "0"}`).join("\n");
    if (box.dataset.signature !== signature) {
      box.dataset.signature = signature;
      box.replaceChildren(...routes.map((route) => choiceButton(route.label, settings.route === route.id, () => {
        save({ route: route.id, deliveryReady: true });
      })));
    }
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
    const signature = buttons.map((button) => `${button.textContent}\t${button.getAttribute("aria-checked")}`).join("\n");
    if (box.dataset.signature === signature) return;
    box.dataset.signature = signature;
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

  function composedInstructions(next) {
    const presets = Array.isArray(next.memory) ? next.memory : [];
    const chosen = presets.find((item) => item.id === next.memoryId);
    const parts = [];
    if (chosen?.text?.trim()) parts.push(chosen.text.trim());
    const negative = (next.negativePrompt || "").trim();
    if (negative) parts.push(`Do not:\n${negative}`);
    return parts.join("\n\n");
  }

  function applyMemory(partial) {
    const next = { ...settings, ...partial };
    return save({ ...partial, instructions: composedInstructions(next), deliveryReady: true });
  }

  function renderMemory() {
    const list = document.querySelector("#memory-list");
    if (!list) return;
    const presets = Array.isArray(settings.memory) ? settings.memory : [];
    const signature = presets.map((preset) => `${preset.id}\t${preset.name}\t${settings.memoryId === preset.id ? "1" : "0"}`).join("\n");
    if (list.dataset.signature === signature) return;
    list.dataset.signature = signature;
    list.replaceChildren(...presets.map((preset) => {
      const row = document.createElement("div");
      row.className = "field";
      const use = document.createElement("button");
      use.type = "button";
      use.className = settings.memoryId === preset.id ? "btn" : "ghost";
      use.textContent = preset.name;
      use.setAttribute("aria-pressed", settings.memoryId === preset.id ? "true" : "false");
      use.addEventListener("click", () => applyMemory({ memoryId: settings.memoryId === preset.id ? "" : preset.id }));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "ghost";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => {
        const memory = presets.filter((item) => item.id !== preset.id);
        applyMemory({ memory, memoryId: settings.memoryId === preset.id ? "" : settings.memoryId });
      });
      row.append(use, remove);
      return row;
    }));
  }

  function renderKeyChoices() {
    const select = document.querySelector("#key-service");
    if (!select) return;
    const current = select.value;
    select.replaceChildren(...KEY_TARGETS.map(([id, name]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name;
      return option;
    }));
    if ([...select.options].some((item) => item.value === current)) select.value = current;
    select.dispatchEvent(new Event("pick-sync"));
  }

  function renderServiceChoices() {
    const select = document.querySelector("#service-choice");
    if (!select) return;
    const current = select.value;
    select.replaceChildren(...SERVICES.map((service) => {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = service.name;
      return option;
    }));
    if ([...select.options].some((item) => item.value === current)) select.value = current;
    select.dispatchEvent(new Event("pick-sync"));
  }

  function selectedService() {
    const id = document.querySelector("#service-choice")?.value;
    return SERVICES.find((service) => service.id === id) || SERVICES[0];
  }

  let awaitingServiceKey = "";

  function serviceLinked(service) {
    return Boolean(service && keyed.has(service.id));
  }

  function resetServiceConnect(message) {
    awaitingServiceKey = "";
    const note = document.querySelector("#service-connect-note");
    const key = document.querySelector("#service-key");
    if (key && document.activeElement !== key) key.value = "";
    if (note) {
      note.textContent = message || "";
      if (message) {
        window.setTimeout(() => {
          if (note.textContent === message) note.textContent = "";
        }, 2800);
      }
    }
    syncServiceConnect();
  }

  function syncServiceConnect() {
    const service = selectedService();
    if (!service) return;
    const links = readLinks();
    const linked = serviceLinked(service);
    const awaiting = awaitingServiceKey === service.id && !linked;
    const input = document.querySelector("#service-ref");
    const key = document.querySelector("#service-key");
    const button = document.querySelector("#service-connect");
    if (!input || !key || !button) return;
    if (service.link) {
      input.hidden = true;
    } else {
      input.hidden = false;
      input.placeholder = service.placeholder || "";
      if (document.activeElement !== input) {
        const saved = links[service.id];
        input.value = saved && saved !== "linked" ? saved : "";
      }
    }
    key.hidden = linked || !awaiting;
    if (!awaiting && document.activeElement !== key) key.value = "";
    button.textContent = linked ? "Disconnect" : "Connect";
    button.className = linked ? "ghost" : "btn";
  }

  async function loadKeys() {
    if (!LOCAL || !TOKEN) return;
    const body = await request("/api/keys");
    keyed.clear();
    for (const id of body.services || []) keyed.add(id);
    renderServices();
  }

  function wireWidget() {
    const project = document.querySelector("#dash-project");
    const negative = document.querySelector("#dash-negative");
    let textTimer = 0;
    const later = (partial) => {
      window.clearTimeout(textTimer);
      textTimer = window.setTimeout(() => save({ ...partial, deliveryReady: true }), 250);
    };
    project.addEventListener("input", () => later({ project: project.value }));
    project.addEventListener("change", () => { save({ project: project.value, deliveryReady: true }); loadRoutes(); });
    negative.addEventListener("input", () => {
      window.clearTimeout(textTimer);
      textTimer = window.setTimeout(() => applyMemory({ negativePrompt: negative.value }), 250);
    });
    document.querySelector("#dash-include-path").addEventListener("change", (event) => save({ includePath: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-include-stack").addEventListener("change", (event) => save({ includeStack: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-unsandboxed").addEventListener("change", (event) => save({ unsandboxed: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-experimental").addEventListener("change", (event) => save({ experimental: event.target.checked, deliveryReady: true }));
    document.querySelector("#dash-ide").addEventListener("change", (event) => {
      switchIde(event.target.value).catch((error) => {
        explainFailure(status, error);
      });
    });
    document.querySelector("#dash-browse").addEventListener("click", async () => {
      try {
        const body = await request("/api/browse", { initialPath: project.value.trim() });
        if (!body.path) return;
        await save({ project: body.path, deliveryReady: true });
        loadRoutes();
      } catch (error) {
        explainFailure(status, error);
      }
    });
    document.querySelector("#dash-clear").addEventListener("click", () => {
      save({ project: "", deliveryReady: true });
      loadRoutes();
    });
    document.querySelector("#advanced-toggle").addEventListener("click", () => {
      const panel = document.querySelector("#advanced-panel");
      const open = panel.hidden;
      panel.hidden = !open;
      document.querySelector("#advanced-toggle").setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelector("#memory-save").addEventListener("click", () => {
      const name = document.querySelector("#memory-name").value.trim().slice(0, 80);
      const text = document.querySelector("#memory-text").value.trim().slice(0, 1200);
      if (!name || !text) return;
      const id = `m${Date.now().toString(36)}`;
      const memory = [...(Array.isArray(settings.memory) ? settings.memory : []), { id, name, text }].slice(-16);
      document.querySelector("#memory-name").value = "";
      document.querySelector("#memory-text").value = "";
      applyMemory({ memory, memoryId: id });
    });
    document.querySelector("#unlink-ides").addEventListener("click", () => {
      switchIde("").catch((error) => explainFailure(status, error));
    });
    document.querySelector("#service-choice").addEventListener("change", () => {
      awaitingServiceKey = "";
      const note = document.querySelector("#service-connect-note");
      if (note) note.textContent = "";
      syncServiceConnect();
    });
    document.querySelector("#service-connect").addEventListener("click", () => {
      connectChosenService().catch((error) => {
        resetServiceConnect(error.message);
      });
    });
    renderServices();
    document.querySelector("#save-contact")?.addEventListener("click", saveContactCard);
    document.querySelector("#dash-open-ide").addEventListener("click", async () => {
      try {
        const body = await request("/api/open", { installationId: settings.installationId, projectPath: settings.project || "" });
        status.textContent = body.detail || "Opened.";
      } catch (error) {
        explainFailure(status, error);
      }
    });
    document.querySelector("#dash-save-key").addEventListener("click", async () => {
      const note = document.querySelector("#dash-key-note");
      try {
        const service = document.querySelector("#key-service").value || "cursor";
        await request("/api/key", {
          apiKey: document.querySelector("#dash-key").value,
          remember: document.querySelector("#dash-remember-key").checked,
          service,
        });
        document.querySelector("#dash-key").value = "";
        if (service === "cursor") settings.cursorConnected = true;
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

  function readLinks() {
    try {
      const stored = JSON.parse(localStorage.getItem("hooxie-connections") || "{}");
      return stored && typeof stored === "object" ? stored : {};
    } catch {
      return {};
    }
  }

  function writeLink(id, value) {
    const links = readLinks();
    if (value) links[id] = value;
    else delete links[id];
    localStorage.setItem("hooxie-connections", JSON.stringify(links));
  }

  async function connectChosenService() {
    const service = selectedService();
    const note = document.querySelector("#service-connect-note");
    const keyInput = document.querySelector("#service-key");
    const button = document.querySelector("#service-connect");
    if (!service || !note || !keyInput || !button) return;
    if (serviceLinked(service)) {
      awaitingServiceKey = "";
      writeLink(service.id, "");
      keyed.delete(service.id);
      if (LOCAL && TOKEN) await request("/api/key", { service: service.id, forget: true });
      note.textContent = "";
      renderServices();
      return;
    }
    const apiKey = keyInput.value.trim();
    if (apiKey.length >= 8) {
      const refInput = document.querySelector("#service-ref");
      const ref = service.link ? "linked" : (refInput?.value.trim() || "");
      if (!service.link && !ref) {
        note.textContent = "Add the connection detail, then Connect.";
        refInput?.focus();
        return;
      }
      if (LOCAL && TOKEN) {
        await request("/api/key", {
          apiKey,
          remember: document.querySelector("#dash-remember-key").checked,
          service: service.id,
        });
      }
      keyed.add(service.id);
      writeLink(service.id, ref || "linked");
      keyInput.value = "";
      awaitingServiceKey = "";
      note.textContent = document.querySelector("#dash-remember-key").checked
        ? "Connected. The key is saved in your user profile."
        : "Connected for this session.";
      renderServices();
      return;
    }
    if (!LOCAL || !TOKEN) {
      resetServiceConnect("Open Hooxie on this computer to connect a service.");
      return;
    }
    button.disabled = true;
    try {
      await request("/api/connections/open", { service: service.id });
      awaitingServiceKey = service.id;
      note.textContent = "The browser is open. Create a key there, paste it, then Connect.";
      syncServiceConnect();
      keyInput.focus();
    } catch (error) {
      resetServiceConnect(error.message);
    } finally {
      button.disabled = false;
    }
  }

  function renderServices() {
    const list = document.querySelector("#service-list");
    if (!list) return;
    const links = readLinks();
    list.replaceChildren(...SERVICES.filter((service) => keyed.has(service.id)).map((service) => {
      const card = document.createElement("article");
      card.className = "service-card";
      const head = document.createElement("div");
      head.className = "service-head";
      const title = document.createElement("strong");
      const ref = links[service.id];
      title.textContent = !ref || ref === "linked" ? service.name : `${service.name} · ${ref}`;
      const status = document.createElement("span");
      status.className = "service-status";
      status.dataset.serviceStatus = service.id;
      status.textContent = "Not checked";
      status.dataset.state = "idle";
      head.append(title, status);
      const row = document.createElement("div");
      row.className = "field";
      const disconnect = document.createElement("button");
      disconnect.type = "button";
      disconnect.className = "ghost";
      disconnect.textContent = "Disconnect";
      disconnect.addEventListener("click", () => {
        writeLink(service.id, "");
        keyed.delete(service.id);
        const finish = () => renderServices();
        if (!LOCAL || !TOKEN) {
          finish();
          return;
        }
        request("/api/key", { service: service.id, forget: true }).then(finish, (error) => {
          const note = document.querySelector("#service-connect-note");
          if (note) note.textContent = error.message;
          finish();
        });
      });
      const check = document.createElement("button");
      check.type = "button";
      check.className = "ghost";
      check.textContent = "Check";
      check.addEventListener("click", () => checkService(service.id, check));
      row.append(disconnect, check);
      const detail = document.createElement("p");
      detail.className = "note";
      detail.dataset.serviceDetail = service.id;
      detail.hidden = true;
      card.append(head, row, detail);
      return card;
    }));
    syncServiceConnect();
  }

  async function checkService(id, button) {
    const links = readLinks();
    const ref = links[id] || "";
    const status = document.querySelector(`[data-service-status="${id}"]`);
    const detail = document.querySelector(`[data-service-detail="${id}"]`);
    if (!ref) {
      if (status) {
        status.textContent = "Not connected";
        status.dataset.state = "not-connected";
      }
      if (detail) {
        detail.textContent = "";
        detail.hidden = true;
      }
      return;
    }
    button.disabled = true;
    if (status) status.textContent = "Checking";
    try {
      const path = LOCAL && TOKEN ? "/api/connections/check" : "/api/connection";
      const result = await request(path, { service: id, ref });
      const labels = { online: "Online", offline: "Offline", problem: "Something is wrong", "not-connected": "Not connected" };
      if (status) {
        status.textContent = labels[result.status] || "Something is wrong";
        status.dataset.state = result.status || "problem";
      }
      if (detail) {
        detail.hidden = !result.detail;
        detail.textContent = result.detail || "";
      }
    } catch (error) {
      if (status) {
        status.textContent = "Offline";
        status.dataset.state = "offline";
      }
      if (detail) {
        detail.hidden = false;
        detail.textContent = error.message;
      }
    } finally {
      button.disabled = false;
    }
  }

  function saveContactCard() {
    const card = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:Delexo",
      "ORG:Hooxie",
      "TITLE:Hooxie support",
      "EMAIL:support@delexo.store",
      "URL:https://hooxie.com",
      "END:VCARD",
    ].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([card], { type: "text/vcard" }));
    link.download = "delexo.vcf";
    link.click();
    URL.revokeObjectURL(link.href);
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
        appendReleaseGroups(card, update.sections);
        article.append(mark, body);
        root.append(article);
      });
    })
    .catch(() => {
      root.textContent = "Release notes could not be loaded.";
    });
}

function appendReleaseGroups(card, sections) {
  for (const [label, key] of [["Added", "added"], ["Bug fixes", "fixes"]]) {
    const filled = (sections || []).filter((section) => (section[key] || []).length);
    if (!filled.length) continue;
    const heading = document.createElement("h3");
    heading.textContent = label;
    card.append(heading);
    for (const section of filled) {
      const area = document.createElement("h4");
      area.textContent = section.heading;
      const list = document.createElement("ul");
      for (const note of section[key]) {
        const item = document.createElement("li");
        item.textContent = note;
        list.append(item);
      }
      card.append(area, list);
    }
  }
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
    if (!response.ok) throw new Error(payload.error || "That request did not go through. Try again, or email support@delexo.store.");
  return payload;
}
