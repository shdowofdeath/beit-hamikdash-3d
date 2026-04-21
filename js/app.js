import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ─── Scale & Coordinate Constants ────────────────────────────
// 1 unit ≈ 5 cubits (2.5m). East = +X, North = -Z, Up = +Y
// Based on Mishnayot Middot, Jewish Encyclopedia, Josephus

const Y_GROUND = -0.5;
const Y_MOUNT = 0;
const Y_CHEIL = 0.8;
const Y_NASHIM = 1.5;
const Y_AZARAH = 3;
const Y_KOHANIM = 3.2;
const Y_ULAM = 4.4;

const MT_SIZE = 100;
const MT_CX = 12;
const MT_X1 = MT_CX - MT_SIZE / 2;
const MT_X2 = MT_CX + MT_SIZE / 2;
const MT_Z1 = -MT_SIZE / 2;
const MT_Z2 = MT_SIZE / 2;

const AZ_X1 = -19, AZ_X2 = 18, AZ_Z1 = -13.5, AZ_Z2 = 13.5;
const WC_X1 = 18, WC_X2 = 45, WC_Z1 = -13.5, WC_Z2 = 13.5;

// ─── Tour Stop Data ─────────────────────────────────────────
const TOUR_STOPS = [
  {
    id: 'temple-mount',
    hebrew: 'הַר הַבַּיִת',
    title: 'הר הבית',
    body: 'הר הבית — רחבת 500 על 500 אמות (כ-250 מטר) — היה המתחם המקודש שעליו עמד בית המקדש כולו. הוקף בחומות תמך ענקיות והכיל אכסדראות מפוארות. בצד דרום עמדה הסטיו המלכותית בעלת 162 העמודים.',
    details: [
      'מידות: 500 × 500 אמות — ריבוע מושלם (משנה מידות ב:א)',
      'שערים: 5 שערים — חולדה (2 בדרום), שושן (מזרח), טדי (צפון), קיפונוס (מערב)',
      'גובה: נמוך במזרח ועולה בהדרגה לכיוון מערב',
    ],
    camera: { x: 70, y: 50, z: 55 },
    target: { x: 5, y: 0, z: 0 },
    markerPos: { x: 55, y: 3, z: 40 },
  },
  {
    id: 'royal-stoa',
    hebrew: 'סְטָיו מַלְכוּתִית',
    title: 'הסטיו המלכותית',
    body: 'הסטיו המלכותית (סטיו בסיליקה) הייתה מבנה העמודים הענק שנמתח לכל אורך חומת הדרום. יוסף בן מתתיהו תיאר אותה כמבנה מרהיב עם 162 עמודים ב-4 שורות, גבוהים כל כך שאם הסתכלת מלמעלה — נתקפת בסחרחורת.',
    details: [
      'עמודים: 162 עמודים קורינתיים ב-4 שורות',
      'גובה: כ-30 אמות (15 מטר)',
      'שימוש: מסחר, בתי דין, מפגש ציבורי',
    ],
    camera: { x: 12, y: 6, z: 40 },
    target: { x: 12, y: 3, z: 48 },
    markerPos: { x: 12, y: 6, z: 45 },
  },
  {
    id: 'soreg-cheil',
    hebrew: 'סוֹרֵג וְחֵיל',
    title: 'הסורג והחיל',
    body: 'הסורג היה גדר סבכה נמוכה (10 טפחים) שהקיפה את המקדש. מעבר לגדר הונחו שלטי אזהרה ביוונית ובלטינית האוסרים על גויים לעבור. בין הסורג לחומות העזרות נמתח החיל — רחבת 10 אמות עם 12 מעלות שיש.',
    details: [
      'סורג: גדר סבכה, 10 טפחים גובה, 10 אמות מחומת העזרות',
      'חיל: מדרגה/רחבה ברוחב 10 אמות',
      '12 מעלות שיש: כל מעלה חצי אמה, להגיע מהחיל לעזרות',
    ],
    camera: { x: 35, y: 10, z: 22 },
    target: { x: 18, y: 2, z: 0 },
    markerPos: { x: 48, y: 3, z: 15 },
  },
  {
    id: 'ezrat-nashim',
    hebrew: 'עֶזְרַת נָשִׁים',
    title: 'עזרת נשים',
    body: 'עזרת נשים הייתה החצר המזרחית — ריבוע מושלם של 135×135 אמות. גם גברים וגם נשים נכנסו. ארבע לשכות גדולות (40×40 אמות כל אחת) תפסו את הפינות, כל אחת לייעוד שונה. בסוכות הוסיפו גזוזטראות (מרפסות) לנשים.',
    details: [
      'מידות: 135 × 135 אמות (ריבוע)',
      'לשכות: נזירים (דרום-מזרח), עצים (צפון-מזרח), מצורעים (צפון-מערב), שמנים (דרום-מערב)',
      'מאפיין: נמוכה 7.5 אמות מהעזרה הפנימית',
    ],
    camera: { x: 40, y: 12, z: 18 },
    target: { x: 31, y: 2, z: 0 },
    markerPos: { x: 31, y: 5, z: 0 },
  },
  {
    id: 'nikanor-gate',
    hebrew: 'שַׁעַר נִיקָנוֹר',
    title: 'שער ניקנור וט"ו מעלות',
    body: 'שער ניקנור המפואר חיבר בין עזרת נשים לעזרה. 15 מעלות חצי-עגולות הובילו אליו — עליהן עמדו הלוויים ושרו את 15 שירי המעלות (תהילים ק"כ-קל"ד). השער היה מנחושת קורינתית ונדרשו 20 איש לפותחו.',
    details: [
      'מידות: 20 אמות רוחב, 40 אמות גובה',
      '15 מעלות: חצי-עגולות, חצי אמה כל אחת — "שיר המעלות"',
      'לשכות: לשכת פנחס (מלבוש) מימין, לשכת עושי חביתין משמאל',
    ],
    camera: { x: 24, y: 8, z: 10 },
    target: { x: 18, y: 5, z: 0 },
    markerPos: { x: 18, y: 8, z: 0 },
  },
  {
    id: 'azarah',
    hebrew: 'עֲזָרָה',
    title: 'העזרה',
    body: 'העזרה (135×187 אמות) הייתה לב המקדש. חולקה לעזרת ישראל (11 אמות רוחב, מזרח) ולעזרת הכוהנים (גבוהה אמה אחת). 7 שערים — 3 בדרום, 3 בצפון, ואחד (ניקנור) במזרח. כאן התקיימה כל עבודת הקודש.',
    details: [
      'מידות: 187 × 135 אמות',
      'חלוקה: עזרת ישראל (11 אמות) + עזרת כוהנים (גבוהה אמה)',
      '7 שערים: דלק, בכורות, מים (דרום); ניצוץ, קרבן, בית המוקד (צפון); ניקנור (מזרח)',
    ],
    camera: { x: 15, y: 18, z: 20 },
    target: { x: 0, y: 3, z: 0 },
    markerPos: { x: 10, y: 5, z: 10 },
  },
  {
    id: 'slaughter-area',
    hebrew: 'בֵּית הַמִּטְבְּחַיִם',
    title: 'בית המטבחיים',
    body: 'צפונית למזבח נמצא אזור השחיטה המסודר: 24 טבעות ב-4 שורות לקשירת הבהמות, 8 שולחנות שיש לשטיפה, ו-4 שורות עמודים נמוכים עם ווים לתליית הקורבנות והפשטתם.',
    details: [
      'טבעות: 24 ב-4 שורות, לקשירת בהמות לשחיטה',
      'שולחנות: 8 שולחנות שיש ב-2 שורות',
      'עמודים: 4 שורות עמודים נמוכים עם ווים לתליית בשר',
    ],
    camera: { x: 8, y: 8, z: -10 },
    target: { x: 1, y: 4, z: -6 },
    markerPos: { x: 1, y: 5, z: -8 },
  },
  {
    id: 'mizbeach',
    hebrew: 'מִזְבֵּחַ',
    title: 'המזבח',
    body: 'המזבח הגדול (32×32 אמות בבסיס) נבנה מאבנים שלמות ללא נגיעת ברזל. היה בנוי במדרגות: יסוד, סובב (מעבר היקפי), ומערכה. קו אדום (חוט הסיקרא) חילק בין דמים עליונים לתחתונים. כבש בדרום, ללא מדרגות.',
    details: [
      'מידות: 32×32 אמות בבסיס, 24×24 בראש, גובה 10 אמות',
      'יסוד: בולט בצפון ובמערב בלבד',
      'סובב: מעבר היקפי באמצע הגובה',
      'חוט הסיקרא: קו אדום חוצה — מפריד דמים עליונים מתחתונים',
      'כבש: 32 אמות בדרום, ללא מדרגות (ציווי התורה)',
    ],
    camera: { x: 8, y: 10, z: 8 },
    target: { x: 1, y: 5, z: 0 },
    markerPos: { x: 1, y: 10, z: 0 },
  },
  {
    id: 'kiyor',
    hebrew: 'כִּיּוֹר',
    title: 'הכיור',
    body: 'הכיור (כיור הנחושת) עמד בין המזבח לאולם, מעט לדרום. שימש לנטילת ידיים ורגליים של הכוהנים לפני העבודה. היו לו 12 ברזים כדי ש-12 כוהנים יוכלו לרחוץ בו-זמנית. בלילה הורד לבור מים באמצעות מכונת "מוכני".',
    details: [
      'חומר: נחושת',
      'ברזים: 12 — לרחיצה בו-זמנית של 12 כוהנים',
      'מוכני: מכונת עץ להורדת הכיור לבור בלילה (שמירת טריות המים)',
    ],
    camera: { x: 0, y: 6, z: -3 },
    target: { x: -2, y: 5, z: -5 },
    markerPos: { x: -2, y: 6, z: -5 },
  },
  {
    id: 'bet-hamoked',
    hebrew: 'בֵּית הַמּוֹקֵד',
    title: 'בית המוקד',
    body: 'בית המוקד ("לשכת האש") היה מבנה גדול מכוסה כיפה בצפון העזרה. כאן ישנו הכוהנים. הכיל 4 לשכות משנה: כבשי הקורבן (דרום-מערב), לחם הפנים (דרום-מזרח), אבני המזבח שטימאו היוונים (צפון-מזרח), ובית הטבילה (צפון-מערב).',
    details: [
      'מבנה: כיפה גדולה, חציו בקודש וחציו בחול',
      '4 לשכות: כבשים, לחם הפנים, אבני מזבח, בית טבילה',
      'שימוש: לינת הכוהנים, משמרות הלילה',
    ],
    camera: { x: -4, y: 8, z: -18 },
    target: { x: -8, y: 4, z: -14 },
    markerPos: { x: -8, y: 8, z: -16 },
  },
  {
    id: 'lishkat-hagazit',
    hebrew: 'לִשְׁכַּת הַגָּזִית',
    title: 'לשכת הגזית',
    body: 'לשכת הגזית הייתה מקום מושבו של הסנהדרין הגדולה — בית הדין העליון בן 71 הדיינים. נבנתה חציה בקודש (בתוך העזרה) וחציה בחול. משם יצאה תורה לכל ישראל.',
    details: [
      'מיקום: חציה בעזרה, חציה מחוצה לה (צד דרום)',
      'שימוש: מושב הסנהדרין הגדולה (71 דיינים)',
      'חשיבות: משם יצאה הוראה לכל ישראל',
    ],
    camera: { x: 2, y: 8, z: 18 },
    target: { x: 5, y: 4, z: 14 },
    markerPos: { x: 5, y: 5, z: 15 },
  },
  {
    id: 'ulam',
    hebrew: 'אוּלָם',
    title: 'האולם',
    body: 'האולם היה אולם הכניסה המרהיב. חזיתו — 100 אמות רוחב ו-100 אמות גובה — התנשאה מעל הכל. לפתח (20 אמות רוחב, 40 גובה) לא היו דלתות — פתוח תמיד. בפנים: שולחנות שיש וזהב ללחם הפנים, גפן זהב מעוטרת, ושרשראות זהב.',
    details: [
      'חזית: 100 × 100 אמות (המבנה הגבוה ביותר)',
      'פתח: 20 × 40 אמות — ללא דלתות, עם פרוכת רקומה',
      'גפן זהב: תלויה מעל הפתח — תורמים תלו עליה "ענבים" מזהב',
      'שרשראות זהב: כוהנים צעירים טיפסו עליהן לראות עטרות בחלונות',
      'לשכות סכינים: 2 חדרי סכינים (בית חליפות) משני הצדדים',
    ],
    camera: { x: 3, y: 10, z: 12 },
    target: { x: -5, y: 10, z: 0 },
    markerPos: { x: -5, y: 14, z: 0 },
  },
  {
    id: 'heichal',
    hebrew: 'הֵיכָל',
    title: 'ההיכל',
    body: 'ההיכל (40×20 אמות, 40 אמות גובה) היה הקודש — רק כוהנים נכנסו. קירותיו צופו ארז מעליו זהב. בתוכו: מנורת הזהב (דרום), שולחן לחם הפנים (צפון), מזבח הקטורת (מרכז). שלמה הוסיף עוד 5 שולחנות ו-5 מנורות מכל צד. 38 תאים הקיפו אותו ב-3 קומות.',
    details: [
      'מידות: 40 × 20 × 40 אמות',
      'כלים: מנורה, שולחן, מזבח קטורת + 10 נוספים משלמה',
      'קירות: ארז מצופה זהב, לוחות זהב על הקירות',
      '38 תאים: 15 בצפון, 15 בדרום, 8 במערב — ב-3 קומות',
      'כניסה: דלת כפולה 10 × 20 אמות',
    ],
    camera: { x: -10, y: 14, z: 4 },
    target: { x: -11.5, y: 5, z: 0 },
    markerPos: { x: -11, y: 10, z: 0 },
  },
  {
    id: 'menorah',
    hebrew: 'מְנוֹרָה',
    title: 'מנורת הזהב',
    body: 'מנורת הזהב עמדה בצד דרום של ההיכל. נעשתה מקשה אחת מזהב טהור — 7 קנים, 22 גביעים, 11 כפתורים ו-9 פרחים. משקלה: ככר זהב (כ-34 ק"ג). הכוהנים הדליקו אותה בכל ערב, ונר המערבי היה דולק בנס.',
    details: [
      'חומר: זהב טהור, מקשה אחת (לא מחוברת מחלקים)',
      '7 קנים: 3 מכל צד וקנה אמצעי',
      'נר המערבי: דלק בנס — עדות שהשכינה שורה בישראל',
      'גובה: 18 טפחים (כ-1.5 מטר)',
      'מיקום: בצד דרום ההיכל, מול שולחן לחם הפנים',
    ],
    camera: { x: -10, y: 7, z: 5 },
    target: { x: -10.2, y: 5.2, z: 1.2 },
    markerPos: { x: -10.2, y: 9, z: 1.2 },
  },
  {
    id: 'kodesh-hakodashim',
    hebrew: 'קֹדֶשׁ הַקֳּדָשִׁים',
    title: 'קודש הקודשים',
    body: 'קודש הקודשים (20×20 אמות) — החדר הפנימי ביותר. בבית ראשון שכן בו ארון הברית. בבית שני הארון נגנז ונותרה רק אבן השתייה — בולטת 3 אצבעות מהרצפה. הופרד בשתי פרוכות עם רווח של אמה ביניהן ("אמת טרקסין" — אמת הספק). רק הכוהן הגדול נכנס, פעם בשנה, ביום הכיפורים.',
    details: [
      'מידות: 20 × 20 אמות, גובה 40 אמות',
      'שתי פרוכות: רווח אמה ביניהן — "אמה טרקסין"',
      'אבן השתייה: בולטת 3 אצבעות מהרצפה, עליה לפי המסורת נברא העולם',
      'כניסה: הכוהן הגדול בלבד, ביום הכיפורים בלבד',
    ],
    camera: { x: -16, y: 12, z: 5 },
    target: { x: -17.2, y: 5, z: 0 },
    markerPos: { x: -17.2, y: 8, z: 0 },
  },
];

// ─── Globals ────────────────────────────────────────────────
let scene, camera, renderer, labelRenderer, controls;
let currentStop = 0;
let markers = [];
let isAnimating = false;

// ─── Materials Library ──────────────────────────────────────
// Cached singletons — call MAT.limestone() etc. to get a shared instance
const _matCache = {};
function _mat(key, factory) {
  if (!_matCache[key]) _matCache[key] = factory();
  return _matCache[key];
}

const MAT = {
  limestone:    () => _mat('limestone',    () => new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.85, metalness: 0.02 })),
  limestoneDark:() => _mat('limestoneDark',() => new THREE.MeshStandardMaterial({ color: 0xc9bda6, roughness: 0.9,  metalness: 0.02 })),
  gold:         () => _mat('gold',         () => new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.3,  metalness: 0.85 })),
  goldBright:   () => _mat('goldBright',   () => new THREE.MeshStandardMaterial({ color: 0xe8d48b, roughness: 0.2,  metalness: 0.9, emissive: 0x3a2a00, emissiveIntensity: 0.2 })),
  bronze:       () => _mat('bronze',       () => new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.4,  metalness: 0.7 })),
  marble:       () => _mat('marble',       () => new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.3,  metalness: 0.05 })),
  wood:         () => _mat('wood',         () => new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.8,  metalness: 0.0 })),
  cedar:        () => _mat('cedar',        () => new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7,  metalness: 0.0 })),
  ground:       () => _mat('ground',       () => new THREE.MeshStandardMaterial({ color: 0xc4b48a, roughness: 1.0,  metalness: 0.0 })),
  water:        () => _mat('water',        () => new THREE.MeshPhysicalMaterial({
    color: 0x2288bb, roughness: 0.05, metalness: 0.1,
    transparent: true, opacity: 0.7, transmission: 0.3,
    clearcoat: 1.0, clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
  })),
  fire:         () => new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 1.0, transparent: true, opacity: 0.8, name: 'fireMat' }),
  curtain:      () => _mat('curtain',      () => new THREE.MeshStandardMaterial({ color: 0x2a1050, roughness: 0.9, metalness: 0.1, side: THREE.DoubleSide })),
  curtainBlue:  () => _mat('curtainBlue',  () => new THREE.MeshStandardMaterial({ color: 0x1a2a6a, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide })),
  redLine:      () => _mat('redLine',      () => new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.6, metalness: 0.0 })),
};

// ─── Init ───────────────────────────────────────────────────
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.FogExp2(0xc8d8e8, 0.0008);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 800);
  camera.position.set(80, 60, 80);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.getElementById('app').appendChild(labelRenderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 2;
  controls.maxDistance = 250;
  controls.target.set(12, 5, 0);

  setupLighting();
  buildTemple();
  createMarkers();
  setupSkyGradient();
  setupMinimapClick();

  window.addEventListener('resize', onResize);
  animate();
  hideLoading();
}

// ─── Lighting ───────────────────────────────────────────────
function setupLighting() {
  const ambient = new THREE.AmbientLight(0xffeedd, 0.5);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
  sun.position.set(60, 80, 40);
  sun.castShadow = true;
  const shadowRes = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 1024 : 2048;
  sun.shadow.mapSize.set(shadowRes, shadowRes);
  sun.shadow.camera.left = -120;
  sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120;
  sun.shadow.camera.bottom = -120;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 300;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xaabbcc, 0.4);
  fill.position.set(-40, 30, -30);
  scene.add(fill);

  const hemi = new THREE.HemisphereLight(0x87CEEB, 0xc4b48a, 0.6);
  scene.add(hemi);
}

// ─── Sky Gradient ───────────────────────────────────────────
function setupSkyGradient() {
  const skyGeo = new THREE.SphereGeometry(400, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x4a8ecc) },
      bottomColor: { value: new THREE.Color(0xd4c8a0) },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        float t = smoothstep(-0.1, 0.5, h);
        gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
      }
    `,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));
}

// ─── Procedural Textures ────────────────────────────────────
function createStoneTexture() {
  const w = 512, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#b8a88a';
  ctx.fillRect(0, 0, w, h);
  const rows = 8, rowH = h / rows, mortarW = 3;
  for (let row = 0; row < rows; row++) {
    const y = row * rowH;
    const cols = 3 + Math.floor(Math.random() * 3);
    const offset = (row % 2 === 1) ? (w / cols) * 0.5 : 0;
    let x = -offset;
    for (let col = 0; col <= cols + 1; col++) {
      const blockW = (w / cols) + (Math.random() - 0.5) * (w / cols) * 0.3;
      const bx = x + mortarW, by = y + mortarW;
      const bw = blockW - mortarW * 2, bh = rowH - mortarW * 2;
      if (bx + bw > 0 && bx < w && bw > 5) {
        const base = 190 + Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgb(${base + Math.floor(Math.random() * 15)},${base - 10 + Math.floor(Math.random() * 10)},${base - 30 + Math.floor(Math.random() * 10)})`;
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(bx, by, bw, bh * 0.15);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(bx, by + bh * 0.85, bw, bh * 0.15);
        ctx.strokeStyle = 'rgba(160,140,110,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
      }
      x += blockW;
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createStoneBumpMap() {
  const w = 512, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  const rows = 8, rowH = h / rows;
  for (let row = 0; row < rows; row++) {
    const y = row * rowH;
    const cols = 3 + Math.floor(Math.random() * 3);
    const offset = (row % 2 === 1) ? (w / cols) * 0.5 : 0;
    let x = -offset;
    for (let col = 0; col <= cols + 1; col++) {
      const blockW = (w / cols) + (Math.random() - 0.5) * (w / cols) * 0.3;
      const bx = x + 3, by = y + 3, bw = blockW - 6, bh = rowH - 6;
      if (bx + bw > 0 && bx < w && bw > 5) {
        const gray = 180 + Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
        ctx.fillRect(bx, by, bw, bh);
      }
      x += blockW;
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function stoneWallMaterial(repeatX, repeatY) {
  const map = createStoneTexture();
  map.repeat.set(repeatX || 1, repeatY || 1);
  const bump = createStoneBumpMap();
  bump.repeat.set(repeatX || 1, repeatY || 1);
  return new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 0.3, roughness: 0.88, metalness: 0.02 });
}

function createFloorTexture() {
  const w = 512, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c8bca0';
  ctx.fillRect(0, 0, w, h);
  const tileSize = 64, gap = 2;
  for (let ty = 0; ty < h; ty += tileSize) {
    for (let tx = 0; tx < w; tx += tileSize) {
      const base = 185 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgb(${base + Math.floor(Math.random() * 10)},${base - 5 + Math.floor(Math.random() * 8)},${base - 20 + Math.floor(Math.random() * 8)})`;
      ctx.fillRect(tx + gap, ty + gap, tileSize - gap * 2, tileSize - gap * 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function tiledFloorMaterial(repX, repY) {
  const map = createFloorTexture();
  map.repeat.set(repX || 2, repY || 2);
  return new THREE.MeshStandardMaterial({ map, roughness: 0.55, metalness: 0.05 });
}

// ─── Helpers ────────────────────────────────────────────────
function addStoneWall(parent, sx, sy, sz, px, py, pz, repX, repY) {
  const mat = stoneWallMaterial(repX || Math.max(1, Math.round(Math.max(sx, sz) / 8)), repY || Math.max(1, Math.round(sy / 5)));
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  mesh.position.set(px, py, pz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addBox(parent, geo, mat, x, y, z, shadow) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (shadow !== false) { m.castShadow = true; m.receiveShadow = true; }
  parent.add(m);
  return m;
}

function addColumn(parent, mat, x, y, z, radius, height) {
  const r = radius || 0.5;
  const h = height || 8;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r, h, 12), mat);
  col.position.set(x, y + h / 2, z);
  col.castShadow = true;
  parent.add(col);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.3, r * 0.9, h * 0.08, 12), mat);
  cap.position.set(x, y + h + h * 0.04, z);
  parent.add(cap);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.2, r * 1.2, h * 0.06, 12), mat);
  base.position.set(x, y + h * 0.03, z);
  parent.add(base);
}

// ─── Temple Builder ─────────────────────────────────────────
function buildTemple() {
  const temple = new THREE.Group();
  temple.name = 'temple';

  buildGround(temple);
  buildTempleMountPlatform(temple);
  buildTempleMountWalls(temple);
  buildRoyalStoa(temple);
  buildSolomonsPorch(temple);
  buildSoreg(temple);
  buildWomensCourt(temple);
  buildNikanorGate(temple);
  buildAzarah(temple);
  buildSlaughterArea(temple);
  buildAltar(temple);
  buildKiyor(temple);
  buildSanctuary(temple);
  buildBetHaMoked(temple);
  buildLishkatHaGazit(temple);
  buildServiceChambers(temple);
  buildDecorations(temple);
  buildPeople(temple);

  scene.add(temple);
}

// ─── Ground ─────────────────────────────────────────────────
function buildGround(parent) {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), MAT.ground());
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = Y_GROUND;
  ground.receiveShadow = true;
  parent.add(ground);

  for (let i = 0; i < 12; i++) {
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(20 + Math.random() * 25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      MAT.ground()
    );
    const angle = (i / 12) * Math.PI * 2;
    const dist = 140 + Math.random() * 60;
    hill.position.set(MT_CX + Math.cos(angle) * dist, Y_GROUND, Math.sin(angle) * dist);
    hill.receiveShadow = true;
    parent.add(hill);
  }
}

// ─── Temple Mount — 500×500 cubit SQUARE platform ──────────
function buildTempleMountPlatform(parent) {
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(MT_SIZE, 2, MT_SIZE),
    MAT.limestone()
  );
  platform.position.set(MT_CX, Y_MOUNT - 0.5, 0);
  platform.receiveShadow = true;
  platform.castShadow = true;
  parent.add(platform);
}

// ─── Temple Mount Walls + 5 Gates ──────────────────────────
function buildTempleMountWalls(parent) {
  const wH = 8;
  const wT = 1.5;

  addStoneWall(parent, MT_SIZE, wH, wT, MT_CX, wH / 2, MT_Z2, 12, 2);
  addStoneWall(parent, MT_SIZE, wH, wT, MT_CX, wH / 2, MT_Z1, 12, 2);
  addStoneWall(parent, wT, wH, MT_SIZE, MT_X2, wH / 2, 0, 2, 12);
  addStoneWall(parent, wT, wH, MT_SIZE, MT_X1, wH / 2, 0, 2, 12);

  buildMountGate(parent, MT_CX - 5, wH / 2, MT_Z2, 0, 'חולדה א');
  buildMountGate(parent, MT_CX + 10, wH / 2, MT_Z2, 0, 'חולדה ב');
  buildMountGate(parent, MT_X2, wH / 2, 0, Math.PI / 2, 'שושן');
  buildMountGateTri(parent, MT_CX, wH / 2, MT_Z1, 0);
  buildMountGate(parent, MT_X1, wH / 2, 0, Math.PI / 2, 'קיפונוס');
}

function buildMountGate(parent, x, y, z, rotY, _name) {
  const g = new THREE.Group();
  addStoneWall(g, 1.2, 6, 2, 0, 0, 3);
  addStoneWall(g, 1.2, 6, 2, 0, 0, -3);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 7), stoneWallMaterial(1, 1));
  top.position.set(0, 4, 0);
  top.castShadow = true;
  g.add(top);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 4), MAT.bronze());
  door.position.set(0, -0.5, 0);
  g.add(door);
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
}

function buildMountGateTri(parent, x, y, z, rotY) {
  const g = new THREE.Group();
  addStoneWall(g, 1.2, 6, 2, 0, 0, 3);
  addStoneWall(g, 1.2, 6, 2, 0, 0, -3);
  const triGeo = new THREE.BufferGeometry();
  const verts = new Float32Array([
    -0.6, 3, -3.5,  -0.6, 3, 3.5,  -0.6, 6, 0,
     0.6, 3, -3.5,   0.6, 3, 3.5,   0.6, 6, 0,
  ]);
  const indices = [0,1,2, 3,5,4, 0,3,4, 0,4,1, 1,4,5, 1,5,2, 0,2,5, 0,5,3];
  triGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  triGeo.setIndex(indices);
  triGeo.computeVertexNormals();
  g.add(new THREE.Mesh(triGeo, stoneWallMaterial(1, 1)));
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 4), MAT.bronze());
  door.position.set(0, 0, 0);
  g.add(door);
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
}

// ─── Royal Stoa — South Colonnade (162 columns) ────────────
function buildRoyalStoa(parent) {
  const stoa = new THREE.Group();
  const mat = MAT.marble();
  const colH = 6;
  const z = MT_Z2 - 4;
  const numCols = 40;
  const spacing = (MT_SIZE - 8) / numCols;

  for (let row = 0; row < 4; row++) {
    const zz = z - row * 2.5;
    for (let i = 0; i < numCols; i++) {
      const xx = MT_X1 + 4 + i * spacing;
      addColumn(stoa, mat, xx, Y_MOUNT + 0.5, zz, 0.4, colH);
    }
  }

  const roofGeo = new THREE.BoxGeometry(MT_SIZE - 6, 0.6, 10);
  const roof = new THREE.Mesh(roofGeo, MAT.limestone());
  roof.position.set(MT_CX, Y_MOUNT + 0.5 + colH + 0.3, z - 3.5);
  roof.castShadow = true;
  roof.receiveShadow = true;
  stoa.add(roof);

  parent.add(stoa);
}

// ─── Solomon's Porch — East Colonnade ──────────────────────
function buildSolomonsPorch(parent) {
  const porch = new THREE.Group();
  const mat = MAT.marble();
  const colH = 5;
  const x = MT_X2 - 3;
  const numCols = 25;
  const spacing = (MT_SIZE - 20) / numCols;

  for (let row = 0; row < 2; row++) {
    const xx = x - row * 2.5;
    for (let i = 0; i < numCols; i++) {
      const zz = MT_Z1 + 10 + i * spacing;
      addColumn(porch, mat, xx, Y_MOUNT + 0.5, zz, 0.35, colH);
    }
  }

  const roof = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, MT_SIZE - 18), MAT.limestone());
  roof.position.set(x - 1.25, Y_MOUNT + 0.5 + colH + 0.25, 0);
  roof.castShadow = true;
  porch.add(roof);

  parent.add(porch);
}

// ─── Soreg — Low Lattice Fence ─────────────────────────────
function buildSoreg(parent) {
  const soregH = 0.4;
  const soregT = 0.15;
  const inset = 4;
  const cx = (AZ_X1 + WC_X2) / 2;
  const totalW = (WC_X2 - AZ_X1) + 2 * inset;
  const totalH = (AZ_Z2 - AZ_Z1) + 2 * inset;

  const soregMat = new THREE.MeshStandardMaterial({ color: 0xd4c8a0, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.7 });

  [AZ_Z2 + inset, AZ_Z1 - inset].forEach(z => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(totalW, soregH, soregT), soregMat);
    m.position.set(cx, Y_CHEIL + soregH / 2, z);
    parent.add(m);
  });
  [WC_X2 + inset, AZ_X1 - inset].forEach(x => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(soregT, soregH, totalH), soregMat);
    m.position.set(x, Y_CHEIL + soregH / 2, 0);
    parent.add(m);
  });

  for (let i = -6; i <= 6; i++) {
    const cheilStep = new THREE.Mesh(
      new THREE.BoxGeometry(totalW + 1, 0.08, 0.6),
      MAT.marble()
    );
    cheilStep.position.set(cx, Y_CHEIL + 0.04 + i * 0.08, AZ_Z2 + inset + 1 + i * 0.6);
    cheilStep.receiveShadow = true;
    parent.add(cheilStep);
  }
}

// ─── Women's Court — 135×135 cubit square ──────────────────
function buildWomensCourt(parent) {
  const wcW = WC_X2 - WC_X1;
  const wcH = WC_Z2 - WC_Z1;
  const cx = (WC_X1 + WC_X2) / 2;
  const floorY = Y_NASHIM;

  const floor = new THREE.Mesh(new THREE.BoxGeometry(wcW, 0.3, wcH), tiledFloorMaterial(5, 5));
  floor.position.set(cx, floorY, 0);
  floor.receiveShadow = true;
  parent.add(floor);

  const wallH = 8;
  const wallT = 0.8;

  addStoneWall(parent, wcW, wallH, wallT, cx, floorY + wallH / 2, WC_Z2, 4, 2);
  addStoneWall(parent, wcW, wallH, wallT, cx, floorY + wallH / 2, WC_Z1, 4, 2);
  addStoneWall(parent, wallT, wallH, wcH, WC_X2, floorY + wallH / 2, 0, 2, 4);

  const chamberSize = 8;
  const chamberH = 5;
  const chamberInset = 1;
  const chambers = [
    { x: WC_X2 - chamberInset - chamberSize / 2, z: WC_Z2 - chamberInset - chamberSize / 2, name: 'נזירים' },
    { x: WC_X2 - chamberInset - chamberSize / 2, z: WC_Z1 + chamberInset + chamberSize / 2, name: 'עצים' },
    { x: WC_X1 + chamberInset + chamberSize / 2, z: WC_Z1 + chamberInset + chamberSize / 2, name: 'מצורעים' },
    { x: WC_X1 + chamberInset + chamberSize / 2, z: WC_Z2 - chamberInset - chamberSize / 2, name: 'שמנים' },
  ];

  chambers.forEach(ch => {
    const wallMat = stoneWallMaterial(2, 1);
    addStoneWall(parent, chamberSize, chamberH, wallT / 2, ch.x, floorY + chamberH / 2, ch.z + chamberSize / 2, 2, 1);
    addStoneWall(parent, chamberSize, chamberH, wallT / 2, ch.x, floorY + chamberH / 2, ch.z - chamberSize / 2, 2, 1);
    addStoneWall(parent, wallT / 2, chamberH, chamberSize, ch.x + chamberSize / 2, floorY + chamberH / 2, ch.z, 1, 2);
    addStoneWall(parent, wallT / 2, chamberH, chamberSize, ch.x - chamberSize / 2, floorY + chamberH / 2, ch.z, 1, 2);
  });

  const balconyH = 6;
  const balconyD = 1.5;
  [WC_Z2 - 0.5, WC_Z1 + 0.5].forEach(z => {
    const balc = new THREE.Mesh(
      new THREE.BoxGeometry(wcW - 2, 0.3, balconyD),
      MAT.wood()
    );
    balc.position.set(cx, floorY + balconyH, z + (z > 0 ? -balconyD / 2 : balconyD / 2));
    balc.castShadow = true;
    parent.add(balc);

    for (let i = 0; i < 8; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6), MAT.wood());
      post.position.set(cx - wcW / 2 + 2 + i * (wcW - 4) / 7, floorY + balconyH + 0.75, z + (z > 0 ? -balconyD / 2 : balconyD / 2));
      parent.add(post);
    }
  });

  buildMountGate(parent, WC_X2, floorY + 4, 0, Math.PI / 2, 'שער המזרח');
}

// ─── Nikanor Gate + 15 Semicircular Steps ──────────────────
function buildNikanorGate(parent) {
  const gateX = WC_X1;
  const gateY = Y_NASHIM;

  for (let i = 0; i < 15; i++) {
    const stepR = 6 - i * 0.15;
    const stepGeo = new THREE.CylinderGeometry(stepR, stepR, 0.1, 24, 1, false, 0, Math.PI);
    const step = new THREE.Mesh(stepGeo, MAT.marble());
    step.position.set(gateX + 0.3, gateY + i * 0.1, 0);
    step.rotation.y = Math.PI / 2;
    step.receiveShadow = true;
    step.castShadow = true;
    parent.add(step);
  }

  const gateH = 10;
  const gateW = 4;
  const pillarW = 1.5;
  const gateTop = Y_AZARAH;

  addStoneWall(parent, pillarW, gateH, 2, gateX, gateTop + gateH / 2, gateW / 2 + 1, 1, 2);
  addStoneWall(parent, pillarW, gateH, 2, gateX, gateTop + gateH / 2, -gateW / 2 - 1, 1, 2);

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(pillarW, 2, gateW + 4), stoneWallMaterial(1, 1));
  lintel.position.set(gateX, gateTop + gateH, 0);
  lintel.castShadow = true;
  parent.add(lintel);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, gateH - 1, gateW), MAT.bronze());
  door.position.set(gateX, gateTop + (gateH - 1) / 2, 0);
  parent.add(door);

  addStoneWall(parent, 3, 4, 4, gateX + 0.5, gateTop + 2, gateW / 2 + 4, 1, 1);
  addStoneWall(parent, 3, 4, 4, gateX + 0.5, gateTop + 2, -gateW / 2 - 4, 1, 1);
}

// ─── Azarah — 135×187 cubit inner court ────────────────────
function buildAzarah(parent) {
  const azW = AZ_X2 - AZ_X1;
  const azH = AZ_Z2 - AZ_Z1;
  const cx = (AZ_X1 + AZ_X2) / 2;

  const yisraelFloor = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.35, azH),
    tiledFloorMaterial(1, 5)
  );
  yisraelFloor.position.set(AZ_X2 - 1.5, Y_AZARAH, 0);
  yisraelFloor.receiveShadow = true;
  parent.add(yisraelFloor);

  const kohanimFloor = new THREE.Mesh(
    new THREE.BoxGeometry(azW - 3, 0.4, azH),
    tiledFloorMaterial(6, 5)
  );
  kohanimFloor.position.set(AZ_X1 + (azW - 3) / 2, Y_KOHANIM, 0);
  kohanimFloor.receiveShadow = true;
  parent.add(kohanimFloor);

  const dividerStep = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.2, azH),
    MAT.limestone()
  );
  dividerStep.position.set(AZ_X2 - 3, Y_AZARAH + 0.1, 0);
  parent.add(dividerStep);

  const dukanMat = MAT.marble();
  for (let i = 0; i < 3; i++) {
    const dukanStep = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 1), dukanMat);
    dukanStep.position.set(AZ_X2 - 4 - i * 0.3, Y_KOHANIM + 0.1 + i * 0.15, 0);
    parent.add(dukanStep);
  }

  const wallH = 10;
  const wallT = 0.8;

  addStoneWall(parent, azW, wallH, wallT, cx, Y_AZARAH + wallH / 2, AZ_Z2, 5, 2);
  addStoneWall(parent, azW, wallH, wallT, cx, Y_AZARAH + wallH / 2, AZ_Z1, 5, 2);
  addStoneWall(parent, wallT, wallH, azH, AZ_X1, Y_AZARAH + wallH / 2, 0, 2, 5);

  const gateGap = 5;
  const eastWallNorth = (AZ_Z2 - AZ_Z1 - gateGap) / 2;
  addStoneWall(parent, wallT, wallH, eastWallNorth, AZ_X2, Y_AZARAH + wallH / 2, AZ_Z1 + eastWallNorth / 2, 1, 2);
  addStoneWall(parent, wallT, wallH, eastWallNorth, AZ_X2, Y_AZARAH + wallH / 2, AZ_Z2 - eastWallNorth / 2, 1, 2);

  const southGates = [
    { x: AZ_X1 + 8, name: 'דלק' },
    { x: cx, name: 'בכורות' },
    { x: AZ_X2 - 8, name: 'מים' },
  ];
  southGates.forEach(g => buildCourtGate(parent, g.x, Y_AZARAH + 3.5, AZ_Z2, 0));

  const northGates = [
    { x: AZ_X1 + 8, name: 'ניצוץ' },
    { x: cx, name: 'קרבן' },
    { x: AZ_X2 - 8, name: 'בית המוקד' },
  ];
  northGates.forEach(g => buildCourtGate(parent, g.x, Y_AZARAH + 3.5, AZ_Z1, 0));
}

function buildCourtGate(parent, x, y, z, rotY) {
  const g = new THREE.Group();
  addStoneWall(g, 0.6, 5, 1.2, 0, 0, 1.8);
  addStoneWall(g, 0.6, 5, 1.2, 0, 0, -1.8);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 4.2), stoneWallMaterial(1, 1));
  top.position.set(0, 3, 0);
  top.castShadow = true;
  g.add(top);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.5, 2.8), MAT.bronze());
  door.position.set(0, -0.2, 0);
  g.add(door);
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
}

// ─── Slaughter Area — North of Altar ───────────────────────
function buildSlaughterArea(parent) {
  const area = new THREE.Group();
  const baseZ = -5;

  const ringMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.6 });
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 12), ringMat);
      ring.position.set(col * 0.8 - 2, Y_KOHANIM + 0.15, baseZ - row * 1);
      ring.rotation.x = -Math.PI / 2;
      area.add(ring);
    }
  }

  const tableMat = MAT.marble();
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const table = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.5), tableMat);
      table.position.set(col * 1.2 - 1.8, Y_KOHANIM + 0.8, baseZ - 5 - row * 0.8);
      area.add(table);
      for (let l = 0; l < 4; l++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), tableMat);
        leg.position.set(
          col * 1.2 - 1.8 + (l % 2 === 0 ? -0.3 : 0.3),
          Y_KOHANIM + 0.45,
          baseZ - 5 - row * 0.8 + (l < 2 ? -0.15 : 0.15)
        );
        area.add(leg);
      }
    }
  }

  const postMat = MAT.limestoneDark();
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.5, 6), postMat);
      post.position.set(col * 1 - 2, Y_KOHANIM + 0.75, baseZ - 7 - row * 0.7);
      area.add(post);
      const hook = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.04), ringMat);
      hook.position.set(col * 1 - 2 + 0.1, Y_KOHANIM + 1.4, baseZ - 7 - row * 0.7);
      area.add(hook);
    }
  }

  parent.add(area);
}

// ─── Altar — with Yesod, Sovev, Chut HaSikra ──────────────
function buildAltar(parent) {
  const altarGroup = new THREE.Group();
  const altarX = 1;
  const baseSize = 6.4;
  const midSize = 5.6;
  const topSize = 4.8;

  const yesod = new THREE.Mesh(new THREE.BoxGeometry(baseSize + 0.6, 0.6, baseSize + 0.6), stoneWallMaterial(2, 1));
  yesod.position.set(0, Y_KOHANIM + 0.3, 0);
  yesod.castShadow = true;
  yesod.receiveShadow = true;
  altarGroup.add(yesod);

  const baseTier = new THREE.Mesh(new THREE.BoxGeometry(baseSize, 2, baseSize), stoneWallMaterial(2, 1));
  baseTier.position.set(0, Y_KOHANIM + 1.6, 0);
  baseTier.castShadow = true;
  altarGroup.add(baseTier);

  const redLine = new THREE.Mesh(new THREE.BoxGeometry(baseSize + 0.1, 0.08, baseSize + 0.1), MAT.redLine());
  redLine.position.set(0, Y_KOHANIM + 2.65, 0);
  altarGroup.add(redLine);

  const sovevH = 0.15;
  const sovevW = 0.4;
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dz]) => {
    const isX = dx !== 0;
    const sovev = new THREE.Mesh(
      new THREE.BoxGeometry(isX ? sovevW : baseSize + sovevW * 2, sovevH, isX ? baseSize + sovevW * 2 : sovevW),
      MAT.limestone()
    );
    sovev.position.set(dx * (baseSize / 2 + sovevW / 2), Y_KOHANIM + 2.7, dz * (baseSize / 2 + sovevW / 2));
    altarGroup.add(sovev);
  });

  const midTier = new THREE.Mesh(new THREE.BoxGeometry(midSize, 1.5, midSize), stoneWallMaterial(2, 1));
  midTier.position.set(0, Y_KOHANIM + 3.35, 0);
  midTier.castShadow = true;
  altarGroup.add(midTier);

  const topTier = new THREE.Mesh(new THREE.BoxGeometry(topSize, 1.2, topSize), stoneWallMaterial(1, 1));
  topTier.position.set(0, Y_KOHANIM + 4.7, 0);
  topTier.castShadow = true;
  altarGroup.add(topTier);

  const hornGeo = new THREE.BoxGeometry(0.5, 1, 0.5);
  const hornMat = stoneWallMaterial(1, 1);
  const hs = topSize / 2 - 0.3;
  [[hs, hs], [-hs, hs], [hs, -hs], [-hs, -hs]].forEach(([hx, hz]) => {
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(hx, Y_KOHANIM + 5.8, hz);
    horn.castShadow = true;
    altarGroup.add(horn);
  });

  const rampW = 3;
  const rampL = 6.4;
  const rampGeo = new THREE.BoxGeometry(rampW, 0.4, rampL);
  const ramp = new THREE.Mesh(rampGeo, stoneWallMaterial(1, 2));
  ramp.position.set(0, Y_KOHANIM + 2, baseSize / 2 + rampL / 2 - 0.5);
  ramp.rotation.x = Math.atan2(3.5, rampL);
  ramp.castShadow = true;
  altarGroup.add(ramp);

  const drainGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
  const drainMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
  const drain = new THREE.Mesh(drainGeo, drainMat);
  drain.position.set(-baseSize / 2, Y_KOHANIM + 0.3, baseSize / 2);
  altarGroup.add(drain);

  const tableAtRamp1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), MAT.marble());
  tableAtRamp1.position.set(rampW / 2 + 0.6, Y_KOHANIM + 0.4, baseSize / 2 + rampL);
  altarGroup.add(tableAtRamp1);

  const tableAtRamp2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.2, metalness: 0.8 }));
  tableAtRamp2.position.set(-rampW / 2 - 0.6, Y_KOHANIM + 0.4, baseSize / 2 + rampL);
  altarGroup.add(tableAtRamp2);

  buildFire(altarGroup, 0, Y_KOHANIM + 5.8, 0, 2.5);

  const fireLight = new THREE.PointLight(0xff6622, 3.5, 30);
  fireLight.position.set(0, Y_KOHANIM + 8, 0);
  fireLight.userData.isFlameLight = true;
  altarGroup.add(fireLight);

  altarGroup.position.set(altarX, 0, 0);
  parent.add(altarGroup);
}

// ─── Realistic Fire Builder ─────────────────────────────────
function buildFire(parent, x, y, z, scale = 1.0) {
  const g = new THREE.Group();

  const coreGeo = new THREE.ConeGeometry(0.5 * scale, 2.0 * scale, 8, 4);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffee55, emissive: 0xffcc00, emissiveIntensity: 2.5,
    transparent: true, opacity: 0.95,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = scale;
  core.userData.isFlame = true;
  core.userData.flameLayer = 'core';
  g.add(core);

  const midGeo = new THREE.ConeGeometry(0.7 * scale, 1.6 * scale, 8, 3);
  const midMat = new THREE.MeshStandardMaterial({
    color: 0xff8800, emissive: 0xff6600, emissiveIntensity: 2.0,
    transparent: true, opacity: 0.8,
  });
  const mid = new THREE.Mesh(midGeo, midMat);
  mid.position.y = scale * 0.7;
  mid.userData.isFlame = true;
  mid.userData.flameLayer = 'mid';
  g.add(mid);

  const outerGeo = new THREE.ConeGeometry(0.9 * scale, 1.2 * scale, 8, 2);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0xff4400, emissive: 0xcc2200, emissiveIntensity: 1.5,
    transparent: true, opacity: 0.55,
  });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  outer.position.y = scale * 0.5;
  outer.userData.isFlame = true;
  outer.userData.flameLayer = 'outer';
  g.add(outer);

  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const tongueGeo = new THREE.ConeGeometry(0.2 * scale, 1.0 * scale, 5, 2);
    const tongueMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? 0xff6600 : 0xffaa22,
      emissive: i % 2 === 0 ? 0xff4400 : 0xff8800,
      emissiveIntensity: 1.8,
      transparent: true, opacity: 0.7,
    });
    const tongue = new THREE.Mesh(tongueGeo, tongueMat);
    tongue.position.set(
      Math.cos(ang) * 0.35 * scale,
      scale * 1.2,
      Math.sin(ang) * 0.35 * scale
    );
    tongue.rotation.x = (Math.random() - 0.5) * 0.3;
    tongue.rotation.z = (Math.random() - 0.5) * 0.3;
    tongue.userData.isFlame = true;
    tongue.userData.flameLayer = 'tongue';
    tongue.userData.flameOffset = i;
    g.add(tongue);
  }

  const emberGeo = new THREE.SphereGeometry(0.8 * scale, 8, 4);
  const emberMat = new THREE.MeshStandardMaterial({
    color: 0x882200, emissive: 0x661100, emissiveIntensity: 1.0,
    transparent: true, opacity: 0.6,
  });
  const embers = new THREE.Mesh(emberGeo, emberMat);
  embers.position.y = 0.1;
  embers.scale.y = 0.3;
  embers.userData.isFlame = true;
  embers.userData.flameLayer = 'ember';
  g.add(embers);

  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

// ─── Kiyor — with 12 Spigots ──────────────────────────────
function buildKiyor(parent) {
  const kiyorGroup = new THREE.Group();

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 1.5, 12), MAT.bronze());
  pedestal.position.y = Y_KOHANIM + 0.75;
  pedestal.castShadow = true;
  kiyorGroup.add(pedestal);

  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 0.8, 1.2, 16), MAT.bronze());
  basin.position.y = Y_KOHANIM + 2.1;
  basin.castShadow = true;
  kiyorGroup.add(basin);

  const basinInner = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 0.7, 1.0, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a4466, roughness: 0.3, metalness: 0.2 })
  );
  basinInner.position.y = Y_KOHANIM + 2.15;
  kiyorGroup.add(basinInner);

  const waterGeo = new THREE.CircleGeometry(1.3, 32);
  const waterMat = MAT.water();
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = Y_KOHANIM + 2.65;
  water.userData.isWater = true;
  kiyorGroup.add(water);

  const rippleMat = new THREE.MeshStandardMaterial({
    color: 0x88ccee, emissive: 0x224466, emissiveIntensity: 0.3,
    transparent: true, opacity: 0.2, side: THREE.DoubleSide,
  });
  for (let i = 0; i < 3; i++) {
    const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.3 + i * 0.35, 0.02, 4, 24), rippleMat);
    ripple.rotation.x = Math.PI / 2;
    ripple.position.y = Y_KOHANIM + 2.67;
    ripple.userData.isWater = true;
    ripple.userData.rippleIdx = i;
    kiyorGroup.add(ripple);
  }

  const waterReflect = new THREE.PointLight(0x4488bb, 0.8, 6);
  waterReflect.position.y = Y_KOHANIM + 3;
  kiyorGroup.add(waterReflect);

  const spigotMat = MAT.bronze();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const spigot = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), spigotMat);
    spigot.position.set(Math.cos(angle) * 1.4, Y_KOHANIM + 1.8, Math.sin(angle) * 1.4);
    spigot.rotation.z = Math.PI / 2;
    spigot.rotation.y = angle;
    kiyorGroup.add(spigot);

    const dropGeo = new THREE.SphereGeometry(0.03, 4, 4);
    const dropMat = new THREE.MeshStandardMaterial({
      color: 0x66bbdd, emissive: 0x225577, emissiveIntensity: 0.3,
      transparent: true, opacity: 0.7,
    });
    const drop = new THREE.Mesh(dropGeo, dropMat);
    drop.position.set(Math.cos(angle) * 1.55, Y_KOHANIM + 1.7, Math.sin(angle) * 1.55);
    drop.userData.isWater = true;
    drop.userData.dropIdx = i;
    kiyorGroup.add(drop);
  }

  kiyorGroup.position.set(-2, 0, -5);
  parent.add(kiyorGroup);
}

// ─── Sanctuary — Ulam + Heichal + Kodesh HaKodashim ───────
// Coordinate convention: X = east-west depth, Z = north-south width
function buildSanctuary(parent) {
  const sanctuary = new THREE.Group();

  const ulamFrontX = -5;
  const ulamZW = 20;
  const ulamXD = 2.2;
  const ulamH = 20;
  const ulamCX = ulamFrontX - ulamXD / 2;
  const wallT = 0.6;

  const ulamFloor = new THREE.Mesh(new THREE.BoxGeometry(ulamXD, 0.4, ulamZW), MAT.marble());
  ulamFloor.position.set(ulamCX, Y_ULAM, 0);
  ulamFloor.receiveShadow = true;
  sanctuary.add(ulamFloor);

  addStoneWall(sanctuary, 1, ulamH, ulamZW, ulamFrontX, Y_ULAM + ulamH / 2, 0, 4, 3);

  const entranceH = 8;
  const entranceW = 4;
  const facadeCutout = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, entranceH, entranceW),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 1 })
  );
  facadeCutout.position.set(ulamFrontX, Y_ULAM + entranceH / 2, 0);
  sanctuary.add(facadeCutout);

  const entranceCurtain = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, entranceH - 0.5, entranceW - 0.3),
    MAT.curtainBlue()
  );
  entranceCurtain.position.set(ulamFrontX - 0.3, Y_ULAM + entranceH / 2, 0);
  sanctuary.add(entranceCurtain);

  addStoneWall(sanctuary, ulamXD, ulamH, 1, ulamCX, Y_ULAM + ulamH / 2, ulamZW / 2);
  addStoneWall(sanctuary, ulamXD, ulamH, 1, ulamCX, Y_ULAM + ulamH / 2, -ulamZW / 2);

  const ulamGoldTop = new THREE.Mesh(new THREE.BoxGeometry(ulamXD + 1, 1.2, ulamZW + 1.5), MAT.gold());
  ulamGoldTop.position.set(ulamCX, Y_ULAM + ulamH + 0.6, 0);
  ulamGoldTop.castShadow = true;
  sanctuary.add(ulamGoldTop);

  const facadeGoldBand = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.5, ulamZW + 2), MAT.gold());
  facadeGoldBand.position.set(ulamFrontX, Y_ULAM + ulamH - 1, 0);
  sanctuary.add(facadeGoldBand);

  for (let i = 0; i < 5; i++) {
    const beamW = entranceW + 2 + i * 0.4;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, beamW), MAT.wood());
    beam.position.set(ulamFrontX, Y_ULAM + entranceH + 0.5 + i * 0.5, 0);
    sanctuary.add(beam);
  }

  const vineGeo = new THREE.TorusGeometry(1.5, 0.08, 8, 24);
  const vine = new THREE.Mesh(vineGeo, MAT.goldBright());
  vine.position.set(ulamFrontX - 0.3, Y_ULAM + entranceH + 3.5, 0);
  vine.rotation.y = Math.PI / 2;
  sanctuary.add(vine);
  for (let i = 0; i < 6; i++) {
    const grape = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), MAT.goldBright());
    const a = (i / 6) * Math.PI * 2;
    grape.position.set(ulamFrontX - 0.3, Y_ULAM + entranceH + 3.5 + Math.sin(a) * 1.3, Math.cos(a) * 1.3);
    sanctuary.add(grape);
  }

  const marbleTable = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.8), MAT.marble());
  marbleTable.position.set(ulamCX, Y_ULAM + 0.35, 3);
  sanctuary.add(marbleTable);
  const goldTable = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.8), MAT.gold());
  goldTable.position.set(ulamCX, Y_ULAM + 0.35, -3);
  sanctuary.add(goldTable);

  const knifeXD = 2.2, knifeZD = 3, knifeH = 3;
  [ulamZW / 2 + knifeZD / 2, -ulamZW / 2 - knifeZD / 2].forEach(z => {
    addStoneWall(sanctuary, knifeXD, knifeH, knifeZD, ulamCX, Y_ULAM + knifeH / 2, z, 1, 1);
  });

  for (let i = 0; i < 12; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 7), MAT.marble());
    step.position.set(ulamFrontX + 1 + i * 0.4, Y_AZARAH + i * 0.1, 0);
    step.receiveShadow = true;
    sanctuary.add(step);
  }

  [-1, 1].forEach(side => {
    const pillarH = 14;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, pillarH, 16), MAT.bronze());
    pillar.position.set(ulamFrontX + 0.5, Y_ULAM + pillarH / 2, side * (entranceW / 2 + 1.5));
    pillar.castShadow = true;
    sanctuary.add(pillar);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 12), MAT.bronze());
    cap.position.set(ulamFrontX + 0.5, Y_ULAM + pillarH + 0.5, side * (entranceW / 2 + 1.5));
    sanctuary.add(cap);
  });

  const heichalFrontX = ulamFrontX - ulamXD;
  const heichalZW = 4;
  const heichalXD = 8;
  const heichalH = 8;
  const heichalCX = heichalFrontX - heichalXD / 2;

  const hFloor = new THREE.Mesh(new THREE.BoxGeometry(heichalXD, 0.4, heichalZW), MAT.marble());
  hFloor.position.set(heichalCX, Y_ULAM, 0);
  hFloor.receiveShadow = true;
  sanctuary.add(hFloor);

  const glassWallMat = new THREE.MeshPhysicalMaterial({
    color: 0xeeddaa, transparent: true, opacity: 0.08,
    roughness: 0.05, metalness: 0.0, side: THREE.DoubleSide,
  });
  const glassFrame = new THREE.Mesh(
    new THREE.BoxGeometry(heichalXD, heichalH, 0.05), glassWallMat
  );
  glassFrame.position.set(heichalCX, Y_ULAM + heichalH / 2, heichalZW / 2);
  sanctuary.add(glassFrame);

  addStoneWall(sanctuary, heichalXD, heichalH, wallT, heichalCX, Y_ULAM + heichalH / 2, -heichalZW / 2, 2, 2);
  addStoneWall(sanctuary, wallT, heichalH, heichalZW, heichalFrontX, Y_ULAM + heichalH / 2, 0, 1, 2);
  addStoneWall(sanctuary, wallT, heichalH, heichalZW, heichalCX - heichalXD / 2, Y_ULAM + heichalH / 2, 0, 1, 2);

  const hDoorCutout = new THREE.Mesh(
    new THREE.BoxGeometry(wallT + 0.1, 4, 2),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 1 })
  );
  hDoorCutout.position.set(heichalFrontX, Y_ULAM + 2, 0);
  sanctuary.add(hDoorCutout);

  const hDoorGold = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 3.8, 0.8), MAT.goldBright()
  );
  hDoorGold.position.set(heichalFrontX + 0.1, Y_ULAM + 2, 0.5);
  sanctuary.add(hDoorGold);
  const hDoorGold2 = hDoorGold.clone();
  hDoorGold2.position.z = -0.5;
  sanctuary.add(hDoorGold2);

  const goldPanelMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.35, metalness: 0.8 });
  const zNorthPanel = -heichalZW / 2 + 0.05;
  for (let py = 0; py < 2; py++) {
    for (let px = -1; px <= 1; px++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.5, 0.05), goldPanelMat);
      panel.position.set(heichalCX + px * 2.2, Y_ULAM + 2 + py * 3.5, zNorthPanel);
      sanctuary.add(panel);
    }
  }

  const cedarMat = MAT.cedar();
  const zNorthCedar = -heichalZW / 2 + 0.15;
  for (let py = 0; py < 2; py++) {
    const cedarPanel = new THREE.Mesh(new THREE.BoxGeometry(heichalXD - 1, 3, 0.08), cedarMat);
    cedarPanel.position.set(heichalCX, Y_ULAM + 1.5 + py * 3.8, zNorthCedar);
    sanctuary.add(cedarPanel);
  }

  const backWallZ = heichalCX - heichalXD / 2 + 0.35;
  for (let py = 0; py < 2; py++) {
    for (let px = -1; px <= 0; px++) {
      const bPanel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.5, 1.5), goldPanelMat);
      bPanel.position.set(backWallZ, Y_ULAM + 2 + py * 3.5, px * 1.5);
      sanctuary.add(bPanel);
    }
  }

  const hRoofMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c, metalness: 0.7, roughness: 0.3,
    transparent: true, opacity: 0.15, side: THREE.DoubleSide,
  });
  const hRoof = new THREE.Mesh(new THREE.BoxGeometry(heichalXD + 2, 0.8, heichalZW + 2), hRoofMat);
  hRoof.position.set(heichalCX, Y_ULAM + heichalH + 0.4, 0);
  sanctuary.add(hRoof);
  const hRoofEdge = new THREE.Mesh(
    new THREE.BoxGeometry(heichalXD + 2.2, 0.15, heichalZW + 2.2),
    MAT.gold()
  );
  hRoofEdge.position.set(heichalCX, Y_ULAM + heichalH + 0.85, 0);
  sanctuary.add(hRoofEdge);

  for (let i = 0; i < 8; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.2, 4), MAT.gold());
    spike.position.set(heichalCX - heichalXD / 2 + 1 + i * (heichalXD / 7), Y_ULAM + heichalH + 1.5, 0);
    sanctuary.add(spike);
  }

  buildMenorah(sanctuary, heichalCX + 1, Y_ULAM + 0.3, 1.2);
  buildShulchan(sanctuary, heichalCX + 1, Y_ULAM + 0.3, -1.2);
  buildIncenseAltar(sanctuary, heichalCX - 1.5, Y_ULAM + 0.3, 0);

  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 5; i++) {
      const extraTable = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.3), MAT.goldBright());
      extraTable.position.set(heichalCX + 0.5 + i * 0.7, Y_ULAM + 0.3, side * 1.5);
      sanctuary.add(extraTable);
    }
  }

  const hLight1 = new THREE.PointLight(0xffcc66, 3.0, 20);
  hLight1.position.set(heichalCX + 1, Y_ULAM + 3, 1.2);
  sanctuary.add(hLight1);
  const hLight2 = new THREE.PointLight(0xffdd88, 2.0, 18);
  hLight2.position.set(heichalCX, Y_ULAM + 5, 0);
  sanctuary.add(hLight2);
  const hLight3 = new THREE.PointLight(0xffe088, 1.5, 15);
  hLight3.position.set(heichalCX - 2, Y_ULAM + 2, 0);
  sanctuary.add(hLight3);

  const cellW = 1;
  const cellH = 1.5;
  const cellD = 1.5;
  const cellMat = stoneWallMaterial(1, 1);
  for (let tier = 0; tier < 3; tier++) {
    for (let i = 0; i < 5; i++) {
      const zNorth = -heichalZW / 2 - 0.8 - tier * 0.3;
      const cell = new THREE.Mesh(new THREE.BoxGeometry(cellD, cellH, cellW), cellMat);
      cell.position.set(heichalCX - heichalXD / 2 + 1 + i * (heichalXD / 5), Y_ULAM + tier * cellH + cellH / 2, zNorth);
      cell.castShadow = true;
      sanctuary.add(cell);
    }
    for (let i = 0; i < 3; i++) {
      const cell = new THREE.Mesh(new THREE.BoxGeometry(cellW, cellH, heichalZW + 2), cellMat);
      cell.position.set(heichalCX - heichalXD / 2 - 0.8 - tier * 0.3, Y_ULAM + tier * cellH + cellH / 2, (i - 1) * 1.8);
      cell.castShadow = true;
      sanctuary.add(cell);
    }
  }

  const parochetX = heichalCX - heichalXD / 2 + 0.3;
  const parochetMat1 = new THREE.MeshStandardMaterial({
    color: 0x2244aa, roughness: 0.8, metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const parochet1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, heichalH - 1, heichalZW - 0.5), parochetMat1
  );
  parochet1.position.set(parochetX, Y_ULAM + heichalH / 2, 0);
  sanctuary.add(parochet1);

  const parochetMat2 = new THREE.MeshStandardMaterial({
    color: 0x882244, roughness: 0.8, metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const parochet2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, heichalH - 1, heichalZW - 0.5), parochetMat2
  );
  parochet2.position.set(parochetX - 0.25, Y_ULAM + heichalH / 2, 0);
  sanctuary.add(parochet2);

  const parochetGoldBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.15, heichalZW - 0.3), MAT.goldBright()
  );
  parochetGoldBar.position.set(parochetX - 0.12, Y_ULAM + heichalH - 0.6, 0);
  sanctuary.add(parochetGoldBar);

  const kkZW = 4;
  const kkXD = 4;
  const kkH = 8;
  const kkCX = parochetX - 0.2 - kkXD / 2 - 0.1;

  const kkFloor = new THREE.Mesh(new THREE.BoxGeometry(kkXD, 0.4, kkZW), MAT.marble());
  kkFloor.position.set(kkCX, Y_ULAM, 0);
  sanctuary.add(kkFloor);

  const kkGlassWall = new THREE.Mesh(
    new THREE.BoxGeometry(kkXD, kkH, 0.05), glassWallMat
  );
  kkGlassWall.position.set(kkCX, Y_ULAM + kkH / 2, kkZW / 2);
  sanctuary.add(kkGlassWall);

  addStoneWall(sanctuary, kkXD, kkH, wallT, kkCX, Y_ULAM + kkH / 2, -kkZW / 2, 1, 2);
  addStoneWall(sanctuary, wallT, kkH, kkZW, kkCX + kkXD / 2, Y_ULAM + kkH / 2, 0, 1, 2);
  addStoneWall(sanctuary, wallT, kkH, kkZW, kkCX - kkXD / 2, Y_ULAM + kkH / 2, 0, 1, 2);

  const kkRoofMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c, metalness: 0.7, roughness: 0.3,
    transparent: true, opacity: 0.15, side: THREE.DoubleSide,
  });
  const kkRoof = new THREE.Mesh(new THREE.BoxGeometry(kkXD + 1.5, 0.8, kkZW + 1.5), kkRoofMat);
  kkRoof.position.set(kkCX, Y_ULAM + kkH + 0.4, 0);
  sanctuary.add(kkRoof);
  const kkRoofEdge = new THREE.Mesh(
    new THREE.BoxGeometry(kkXD + 1.7, 0.15, kkZW + 1.7), MAT.gold()
  );
  kkRoofEdge.position.set(kkCX, Y_ULAM + kkH + 0.85, 0);
  sanctuary.add(kkRoofEdge);

  const evenShtiyah = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.5, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x9a8a7a, roughness: 0.85, metalness: 0.05 })
  );
  evenShtiyah.position.set(kkCX, Y_ULAM + 0.3, 0);
  evenShtiyah.castShadow = true;
  evenShtiyah.receiveShadow = true;
  sanctuary.add(evenShtiyah);

  const evenRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.08, 8, 24),
    MAT.goldBright()
  );
  evenRing.position.set(kkCX, Y_ULAM + 0.42, 0);
  evenRing.rotation.x = Math.PI / 2;
  sanctuary.add(evenRing);

  const kkLight = new THREE.PointLight(0xfff8e0, 4.0, 20);
  kkLight.position.set(kkCX, Y_ULAM + 5, 0);
  sanctuary.add(kkLight);
  const kkGlow = new THREE.PointLight(0xffeebb, 3.0, 15);
  kkGlow.position.set(kkCX, Y_ULAM + 2, 0);
  sanctuary.add(kkGlow);
  const kkFloorLight = new THREE.PointLight(0xffffcc, 2.0, 10);
  kkFloorLight.position.set(kkCX, Y_ULAM + 0.8, 0);
  sanctuary.add(kkFloorLight);

  const glowSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffffee, emissive: 0xffddaa, emissiveIntensity: 1.0,
      transparent: true, opacity: 0.3
    })
  );
  glowSphere.position.set(kkCX, Y_ULAM + 2.5, 0);
  sanctuary.add(glowSphere);

  const glowPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 4, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffeedd, emissive: 0xffcc88, emissiveIntensity: 0.5,
      transparent: true, opacity: 0.15
    })
  );
  glowPillar.position.set(kkCX, Y_ULAM + 3, 0);
  sanctuary.add(glowPillar);

  [{ x: kkCX + 1.2, z: 1.2 }, { x: kkCX + 1.2, z: -1.2 },
   { x: kkCX - 1.2, z: 1.2 }, { x: kkCX - 1.2, z: -1.2 }].forEach(pos => {
    const torch = new THREE.PointLight(0xffcc44, 0.8, 6);
    torch.position.set(pos.x, Y_ULAM + 5, pos.z);
    sanctuary.add(torch);
  });

  parent.add(sanctuary);
}

// ─── Menorah ────────────────────────────────────────────────
function buildMenorah(parent, x, y, z) {
  const g = new THREE.Group();
  const mat = MAT.goldBright();

  g.add(addBox(g, new THREE.CylinderGeometry(0.6, 0.7, 0.35, 8), mat, 0, 0.18, 0));
  g.add(addBox(g, new THREE.CylinderGeometry(0.15, 0.15, 3.2, 8), mat, 0, 1.8, 0));

  const flameCoreMat = new THREE.MeshStandardMaterial({
    color: 0xffee44, emissive: 0xffcc00, emissiveIntensity: 2.5,
    transparent: true, opacity: 0.9,
  });
  const flameOuterMat = new THREE.MeshStandardMaterial({
    color: 0xff7700, emissive: 0xff5500, emissiveIntensity: 1.8,
    transparent: true, opacity: 0.6,
  });

  function addFlame(fx, fy, fz) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), mat);
    cup.position.set(fx, fy - 0.1, fz);
    g.add(cup);

    const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 6), flameCoreMat);
    flameCore.position.set(fx, fy + 0.15, fz);
    flameCore.userData.isFlame = true;
    flameCore.userData.flameLayer = 'core';
    g.add(flameCore);

    const flameOuter = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 6), flameOuterMat);
    flameOuter.position.set(fx, fy + 0.1, fz);
    flameOuter.userData.isFlame = true;
    flameOuter.userData.flameLayer = 'outer';
    g.add(flameOuter);
  }

  for (let side = -1; side <= 1; side += 2) {
    for (let i = 1; i <= 3; i++) {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 6), mat);
      branch.position.set(side * i * 0.4, 2.5 + i * 0.25, 0);
      branch.rotation.z = side * 0.35;
      g.add(branch);
      addFlame(side * i * 0.6, 3.5 + i * 0.15, 0);
    }
  }
  addFlame(0, 3.8, 0);

  const light = new THREE.PointLight(0xffaa33, 4.0, 18);
  light.position.y = 4;
  light.userData.isFlameLight = true;
  g.add(light);
  const menorahGlow = new THREE.PointLight(0xffcc55, 2.0, 12);
  menorahGlow.position.y = 2.5;
  g.add(menorahGlow);

  g.position.set(x, y, z);
  parent.add(g);
}

// ─── Shulchan ───────────────────────────────────────────────
function buildShulchan(parent, x, y, z) {
  const g = new THREE.Group();
  const mat = MAT.goldBright();

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.8), mat);
  top.position.y = 1.3;
  g.add(top);

  const rim = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.9), mat);
  rim.position.y = 1.4;
  g.add(rim);

  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6);
  [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, mat);
    leg.position.set(lx, 0.65, lz);
    g.add(leg);
  });

  const breadMat = new THREE.MeshStandardMaterial({
    color: 0xdaa520, roughness: 0.7, emissive: 0x553300, emissiveIntensity: 0.2,
  });
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      const bread = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.3), breadMat);
      bread.position.set(-0.5 + col * 0.2, 1.5 + row * 0.12, 0);
      g.add(bread);
    }
  }

  const tableLight = new THREE.PointLight(0xffdd66, 1.0, 6);
  tableLight.position.y = 2.2;
  g.add(tableLight);

  g.position.set(x, y, z);
  parent.add(g);
}

// ─── Incense Altar ──────────────────────────────────────────
function buildIncenseAltar(parent, x, y, z) {
  const g = new THREE.Group();
  const mat = MAT.goldBright();

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 1.0), mat);
  base.position.y = 0.1;
  g.add(base);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), mat);
  body.position.y = 1.1;
  body.castShadow = true;
  g.add(body);

  const topRim = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.95), mat);
  topRim.position.y = 2.06;
  g.add(topRim);

  [[0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35]].forEach(([hx, hz]) => {
    const horn = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), mat);
    horn.position.set(hx, 2.3, hz);
    g.add(horn);
  });

  const smokeMat = new THREE.MeshStandardMaterial({
    color: 0xeeeedd, emissive: 0xccbbaa, emissiveIntensity: 0.5,
    transparent: true, opacity: 0.35,
  });
  for (let i = 0; i < 3; i++) {
    const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.15 + i * 0.1, 8, 8), smokeMat);
    smoke.position.y = 2.6 + i * 0.5;
    smoke.userData.isFlame = true;
    g.add(smoke);
  }

  const altarLight = new THREE.PointLight(0xffeecc, 1.5, 8);
  altarLight.position.y = 3;
  g.add(altarLight);

  g.position.set(x, y, z);
  parent.add(g);
}

// ─── Bet HaMoked — Domed Chamber of the Hearth ────────────
function buildBetHaMoked(parent) {
  const cx = -8, cz = AZ_Z1 - 4;
  const size = 8, height = 5;

  addStoneWall(parent, size, height, 0.6, cx, Y_AZARAH + height / 2, cz + size / 2, 2, 1);
  addStoneWall(parent, size, height, 0.6, cx, Y_AZARAH + height / 2, cz - size / 2, 2, 1);
  addStoneWall(parent, 0.6, height, size, cx + size / 2, Y_AZARAH + height / 2, cz, 1, 2);
  addStoneWall(parent, 0.6, height, size, cx - size / 2, Y_AZARAH + height / 2, cz, 1, 2);

  const domeGeo = new THREE.SphereGeometry(size / 2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, stoneWallMaterial(2, 2));
  dome.position.set(cx, Y_AZARAH + height, cz);
  dome.castShadow = true;
  parent.add(dome);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(size - 1, 0.2, size - 1), tiledFloorMaterial(2, 2));
  floor.position.set(cx, Y_AZARAH + 0.1, cz);
  parent.add(floor);

  const subSize = 2.5;
  const subH = 3;
  const subPositions = [
    [cx - 2, cz + 2],
    [cx + 2, cz + 2],
    [cx + 2, cz - 2],
    [cx - 2, cz - 2],
  ];
  subPositions.forEach(([sx, sz]) => {
    const sub = new THREE.Mesh(new THREE.BoxGeometry(subSize, subH, subSize), stoneWallMaterial(1, 1));
    sub.position.set(sx, Y_AZARAH + subH / 2, sz);
    sub.castShadow = true;
    parent.add(sub);
  });

  const innerLight = new THREE.PointLight(0xff8844, 0.8, 12);
  innerLight.position.set(cx, Y_AZARAH + 3, cz);
  parent.add(innerLight);

  buildFire(parent, cx, Y_AZARAH + 0.2, cz, 0.6);
}

// ─── Lishkat HaGazit — Sanhedrin Chamber ───────────────────
function buildLishkatHaGazit(parent) {
  const cx = 5, cz = AZ_Z2 + 2;
  const w = 8, d = 5, h = 4;

  addStoneWall(parent, w, h, 0.5, cx, Y_AZARAH + h / 2, cz + d / 2, 2, 1);
  addStoneWall(parent, w, h, 0.5, cx, Y_AZARAH + h / 2, cz - d / 2, 2, 1);
  addStoneWall(parent, 0.5, h, d, cx + w / 2, Y_AZARAH + h / 2, cz, 1, 1);
  addStoneWall(parent, 0.5, h, d, cx - w / 2, Y_AZARAH + h / 2, cz, 1, 1);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.4, d + 0.5), stoneWallMaterial(2, 1));
  roof.position.set(cx, Y_AZARAH + h + 0.2, cz);
  roof.castShadow = true;
  parent.add(roof);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 0.15, d - 1), tiledFloorMaterial(2, 1));
  floor.position.set(cx, Y_AZARAH + 0.1, cz);
  parent.add(floor);

  for (let i = 0; i < 5; i++) {
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.4, 0.4),
      MAT.limestone()
    );
    const angle = (i / 5) * Math.PI;
    bench.position.set(cx + Math.cos(angle) * 2.5, Y_AZARAH + 0.3, cz + Math.sin(angle) * 1.5);
    parent.add(bench);
  }
}

// ─── Service Chambers ──────────────────────────────────────
function buildServiceChambers(parent) {
  const chamberDefs = [
    { x: AZ_X1 + 3, z: AZ_Z2 - 3, name: 'מלח' },
    { x: AZ_X1 + 3, z: AZ_Z2 - 7, name: 'פרווה' },
    { x: AZ_X1 + 3, z: AZ_Z2 - 11, name: 'מדיחין' },
  ];

  chamberDefs.forEach(ch => {
    const w = 3, d = 3, h = 3.5;
    addStoneWall(parent, w, h, 0.4, ch.x, Y_AZARAH + h / 2, ch.z + d / 2, 1, 1);
    addStoneWall(parent, w, h, 0.4, ch.x, Y_AZARAH + h / 2, ch.z - d / 2, 1, 1);
    addStoneWall(parent, 0.4, h, d, ch.x + w / 2, Y_AZARAH + h / 2, ch.z, 1, 1);
    addStoneWall(parent, 0.4, h, d, ch.x - w / 2, Y_AZARAH + h / 2, ch.z, 1, 1);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3), stoneWallMaterial(1, 1));
    roof.position.set(ch.x, Y_AZARAH + h + 0.15, ch.z);
    roof.castShadow = true;
    parent.add(roof);
  });
}

// ─── Decorations ────────────────────────────────────────────
function buildDecorations(parent) {
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.9 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.9 });

  const treePositions = [];
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 55 + Math.random() * 35;
    treePositions.push([MT_CX + Math.cos(angle) * dist, 0, Math.sin(angle) * dist]);
  }

  treePositions.forEach(([tx, , tz]) => {
    if (Math.abs(tx - MT_CX) < MT_SIZE / 2 + 5 && Math.abs(tz) < MT_SIZE / 2 + 5) return;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 6), trunkMat);
    trunk.position.set(tx, 1, tz);
    trunk.castShadow = true;
    parent.add(trunk);
    const foliage = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), treeMat);
    foliage.position.set(tx, 4, tz);
    foliage.castShadow = true;
    parent.add(foliage);
  });

  for (let i = 0; i < 8; i++) {
    const torch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a3520 })
    );
    const angle = (i / 8) * Math.PI * 2;
    const dist = 18;
    const tx = (AZ_X1 + AZ_X2) / 2 + Math.cos(angle) * dist;
    const tz = Math.sin(angle) * dist;
    torch.position.set(tx, Y_AZARAH + 2.5, tz);
    parent.add(torch);

    buildFire(parent, tx, Y_AZARAH + 3.5, tz, 0.25);

    const tLight = new THREE.PointLight(0xff8844, 0.6, 10);
    tLight.position.set(tx, Y_AZARAH + 4, tz);
    tLight.userData.isFlameLight = true;
    parent.add(tLight);
  }
}

// ─── People ─────────────────────────────────────────────────
const PERSON_COLORS = {
  kohen: { robe: 0xf5f0e8, belt: 0xc9a84c, head: 0xf5f0e8, skin: 0xd4a574 },
  kohenGadol: { robe: 0x1a3a8a, belt: 0xc9a84c, head: 0xc9a84c, skin: 0xd4a574 },
  levi: { robe: 0xeee8d5, belt: 0x8b8b8b, head: 0xeee8d5, skin: 0xc4956a },
  israelM: { robe: 0xc4b48a, belt: 0x8b6914, head: 0xf0ece4, skin: 0xd4a574 },
  israelF: { robe: 0x9b6b4a, belt: 0x7a5c3a, head: 0xc4b48a, skin: 0xd4a574 },
  child: { robe: 0xd4c9a8, belt: 0xa09882, head: 0xd4c9a8, skin: 0xdbb08a },
};

function createPerson(type, x, y, z, rotY = 0, scale = 1) {
  const colors = PERSON_COLORS[type];
  const g = new THREE.Group();

  // Upper body pivot — rotated for bowing, houses head + arms
  const upper = new THREE.Group();
  upper.position.y = 1.3 * scale;
  g.add(upper);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22 * scale, 8, 8), new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.8 }));
  head.position.y = 0.25 * scale;
  head.castShadow = true;
  upper.add(head);

  if (type !== 'child') {
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 }));
    hair.position.y = 0.3 * scale;
    upper.add(hair);
  }

  if (type === 'kohenGadol') {
    const mitr = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 0.25 * scale, 8), new THREE.MeshStandardMaterial({ color: colors.head, roughness: 0.3, metalness: 0.7 }));
    mitr.position.y = 0.52 * scale;
    upper.add(mitr);
    const tzitz = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.1 * scale, 0.02 * scale), new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.2, metalness: 0.8 }));
    tzitz.position.set(0, 0.42 * scale, 0.2 * scale);
    upper.add(tzitz);
    const choshen = new THREE.Mesh(new THREE.BoxGeometry(0.22 * scale, 0.22 * scale, 0.04 * scale), new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.2, metalness: 0.8 }));
    choshen.position.set(0, -0.05 * scale, 0.2 * scale);
    upper.add(choshen);
  } else if (type === 'kohen') {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 0.15 * scale, 8), new THREE.MeshStandardMaterial({ color: colors.head, roughness: 0.7 }));
    cap.position.y = 0.45 * scale;
    upper.add(cap);
  } else if (type === 'israelM' || type === 'levi') {
    const cover = new THREE.Mesh(new THREE.SphereGeometry(0.17 * scale, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: colors.head, roughness: 0.8 }));
    cover.position.y = 0.35 * scale;
    upper.add(cover);
  } else if (type === 'israelF') {
    const scarf = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6), new THREE.MeshStandardMaterial({ color: colors.head, roughness: 0.8 }));
    scarf.position.y = 0.28 * scale;
    upper.add(scarf);
  }

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.28 * scale, 0.9 * scale, 8), new THREE.MeshStandardMaterial({ color: colors.robe, roughness: 0.85 }));
  body.position.y = 0.95 * scale;
  body.castShadow = true;
  g.add(body);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.22 * scale, 0.06 * scale, 8), new THREE.MeshStandardMaterial({ color: colors.belt, roughness: 0.5 }));
  belt.position.y = 1.1 * scale;
  g.add(belt);

  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * scale, 0.35 * scale, 0.5 * scale, 8), new THREE.MeshStandardMaterial({ color: colors.robe, roughness: 0.85 }));
  skirt.position.y = 0.35 * scale;
  skirt.castShadow = true;
  g.add(skirt);

  // Arm pivots at shoulder — rotate pivot to swing arms from shoulder joint
  const armPivots = [-1, 1].map(side => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.28 * scale, 1.3 * scale, 0);
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 * scale, 0.06 * scale, 0.55 * scale, 6),
      new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.8 })
    );
    arm.position.y = -0.275 * scale;
    arm.rotation.z = side * 0.15;
    pivot.add(arm);
    g.add(pivot);
    return pivot;
  });

  g.position.set(x, y, z);
  g.rotation.y = rotY;

  // Animation metadata
  const isKohen = type === 'kohen' || type === 'kohenGadol';
  const isChild = type === 'child';
  g.userData.isPerson = true;
  g.userData.personType = type;
  g.userData.upper = upper;
  g.userData.armPivots = armPivots;
  g.userData.phase = Math.random() * Math.PI * 2;
  g.userData.bowDepth = isKohen ? 0.18 : isChild ? 0.08 : 0.38;
  g.userData.swayAmt = isKohen ? 0.03 : isChild ? 0.12 : 0.05;
  g.userData.praySpeed = isKohen ? 0.55 : isChild ? 1.8 : 0.7 + Math.random() * 0.3;
  // Children wander; others pray in place
  g.userData.wanderAngle = Math.random() * Math.PI * 2;
  g.userData.baseRotY = rotY;
  g.userData.baseX = x;
  g.userData.baseZ = z;

  return g;
}

function buildPeople(parent) {
  const ppl = new THREE.Group();
  ppl.name = 'people';

  const kohenPositions = [
    { x: 3, z: 3, r: -0.5 }, { x: -1, z: 4, r: 0.3 }, { x: -2, z: -3, r: 2.5 },
    { x: 4, z: -2, r: -1.2 }, { x: 2, z: -4, r: 1.8 }, { x: -4, z: 2, r: 0.8 },
  ];
  kohenPositions.forEach(({ x, z, r }) => ppl.add(createPerson('kohen', x, Y_KOHANIM, z, r)));

  ppl.add(createPerson('kohen', -1, Y_KOHANIM, -5.5, 0.5));
  ppl.add(createPerson('kohen', -3, Y_KOHANIM, -5, -0.8));

  ppl.add(createPerson('kohenGadol', -4, Y_ULAM, 0, Math.PI));

  for (let i = 0; i < 10; i++) {
    const stepX = WC_X1 + 0.3;
    const stepY = Y_NASHIM + i * 0.1;
    const zOff = (i % 2 === 0) ? 2.5 : -2.5;
    ppl.add(createPerson('levi', stepX, stepY, zOff, Math.PI * 0.5));
  }

  ppl.add(createPerson('levi', WC_X2, Y_NASHIM, 2, Math.PI / 2));
  ppl.add(createPerson('levi', WC_X2, Y_NASHIM, -2, Math.PI / 2));
  ppl.add(createPerson('levi', AZ_X2, Y_AZARAH, 3, -Math.PI / 2));
  ppl.add(createPerson('levi', AZ_X2, Y_AZARAH, -3, -Math.PI / 2));

  const israelPositions = [
    { x: AZ_X2 - 1, z: 2 }, { x: AZ_X2 - 1.5, z: -1 }, { x: AZ_X2 - 0.5, z: 5 },
    { x: AZ_X2 - 1, z: -4 }, { x: AZ_X2 - 2, z: 7 }, { x: AZ_X2 - 0.8, z: -7 },
    { x: AZ_X2 - 1.5, z: 9 }, { x: AZ_X2 - 1, z: -9 }, { x: AZ_X2 - 2, z: 0 },
    { x: AZ_X2 - 0.5, z: -6 },
  ];
  israelPositions.forEach(({ x, z }) => ppl.add(createPerson('israelM', x, Y_AZARAH, z, -Math.PI + (Math.random() - 0.5) * 0.4)));

  const wcCX = (WC_X1 + WC_X2) / 2;
  const womenPositions = [
    { x: wcCX - 3, z: 3 }, { x: wcCX, z: -2 }, { x: wcCX + 3, z: 1 },
    { x: wcCX - 2, z: -5 }, { x: wcCX + 2, z: 4 }, { x: wcCX + 5, z: -3 },
    { x: wcCX - 5, z: 6 }, { x: wcCX + 1, z: 7 },
  ];
  womenPositions.forEach(({ x, z }) => ppl.add(createPerson('israelF', x, Y_NASHIM, z, -Math.PI + (Math.random() - 0.5) * 0.6)));

  const menInWC = [
    { x: wcCX - 4, z: -7 }, { x: wcCX + 4, z: -6 },
    { x: wcCX, z: 8 }, { x: wcCX + 6, z: 5 },
  ];
  menInWC.forEach(({ x, z }) => ppl.add(createPerson('israelM', x, Y_NASHIM, z, -Math.PI + (Math.random() - 0.5) * 0.4)));

  const childPositions = [
    { x: wcCX - 1, z: 0 }, { x: wcCX + 3, z: -4 },
    { x: AZ_X2 - 1, z: 1 }, { x: wcCX + 5, z: 2 },
  ];
  childPositions.forEach(({ x, z }) => ppl.add(createPerson('child', x, Y_NASHIM, z, Math.random() * Math.PI * 2, 0.7)));

  const mountPositions = [
    { x: MT_CX + 30, z: 30 }, { x: MT_CX + 35, z: -20 }, { x: MT_CX - 20, z: 25 },
    { x: MT_CX - 15, z: -30 }, { x: MT_CX + 25, z: 0 }, { x: MT_CX - 25, z: 5 },
    { x: MT_CX, z: 35 }, { x: MT_CX + 5, z: -35 }, { x: MT_CX - 10, z: 32 },
    { x: MT_CX + 15, z: -32 },
  ];
  mountPositions.forEach(({ x, z }) => {
    const type = Math.random() > 0.5 ? 'israelM' : 'israelF';
    ppl.add(createPerson(type, x, Y_MOUNT + 0.5, z, Math.random() * Math.PI * 2));
  });

  parent.add(ppl);
}

// ─── Markers ────────────────────────────────────────────────
function createMarkers() {
  TOUR_STOPS.forEach((stop, i) => {
    const div = document.createElement('div');
    div.className = 'marker-3d';
    div.textContent = String(i + 1);
    div.style.pointerEvents = 'auto';
    div.addEventListener('click', () => goToStop(i));

    const label = new CSS2DObject(div);
    label.position.set(stop.markerPos.x, stop.markerPos.y, stop.markerPos.z);
    scene.add(label);
    markers.push({ label, div });
  });
}

// ─── Tour Navigation ────────────────────────────────────────
function goToStop(index) {
  if (isAnimating) return;
  if (index < 0 || index >= TOUR_STOPS.length) return;
  currentStop = index;
  const stop = TOUR_STOPS[index];
  animateCamera(stop.camera, stop.target);
  showInfo(stop);
  updateTourUI();
}

function animateCamera(camTarget, lookTarget) {
  isAnimating = true;
  const duration = 2200;
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos = new THREE.Vector3(camTarget.x, camTarget.y, camTarget.z);
  const endTarget = new THREE.Vector3(lookTarget.x, lookTarget.y, lookTarget.z);
  const startTime = performance.now();
  const dist = startPos.distanceTo(endPos);
  const liftAmount = Math.min(dist * 0.15, 15);

  const safetyTimer = setTimeout(() => {
    camera.position.copy(endPos);
    controls.target.copy(endTarget);
    controls.update();
    isAnimating = false;
  }, duration + 500);

  function tick(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(startPos, endPos, ease);
    camera.position.y += Math.sin(t * Math.PI) * liftAmount;
    controls.target.lerpVectors(startTarget, endTarget, ease);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      clearTimeout(safetyTimer);
      isAnimating = false;
    }
  }
  requestAnimationFrame(tick);
}

function showInfo(stop) {
  const panel = document.getElementById('info-panel');
  document.getElementById('info-hebrew').textContent = stop.hebrew;
  document.getElementById('info-title').textContent = stop.title;
  document.getElementById('info-body').textContent = stop.body;
  document.getElementById('location-name').textContent = stop.title;

  const detailsEl = document.getElementById('info-details');
  detailsEl.replaceChildren();
  stop.details.forEach(detail => {
    const p = document.createElement('p');
    p.textContent = detail;
    detailsEl.appendChild(p);
  });

  panel.classList.remove('hidden');
  markers.forEach((m, i) => m.div.classList.toggle('active', i === currentStop));
}

function updateTourUI() {
  const dotsEl = document.getElementById('tour-dots');
  while (dotsEl.firstChild) dotsEl.removeChild(dotsEl.firstChild);
  TOUR_STOPS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === currentStop ? ' active' : '');
    dot.addEventListener('click', () => goToStop(i));
    dotsEl.appendChild(dot);
  });
  document.getElementById('tour-label').textContent = (currentStop + 1) + ' / ' + TOUR_STOPS.length;
  updateSidebar();
}

function buildSidebar() {
  const list = document.getElementById('sidebar-list');
  while (list.firstChild) list.removeChild(list.firstChild);
  TOUR_STOPS.forEach((stop, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.dataset.index = i;
    const numSpan = document.createElement('span');
    numSpan.className = 'sidebar-num';
    numSpan.textContent = (i + 1);
    const textSpan = document.createElement('span');
    textSpan.textContent = stop.title;
    btn.appendChild(textSpan);
    btn.appendChild(numSpan);
    btn.addEventListener('click', () => goToStop(i));
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function updateSidebar() {
  const buttons = document.querySelectorAll('#sidebar-list li button');
  buttons.forEach((btn, i) => {
    btn.classList.toggle('active', i === currentStop);
  });
  const activeBtn = document.querySelector('#sidebar-list li button.active');
  if (activeBtn) activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// ─── Mini-map ───────────────────────────────────────────────
function setupMinimapClick() {
  const canvas = document.getElementById('minimap-canvas');
  canvas.style.cursor = 'pointer';
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const w = canvas.width, h = canvas.height;
    const scale = 0.65;
    const ox = w / 2 - MT_CX * scale;
    const oy = h / 2;

    let closest = -1, bestDist = 12;
    TOUR_STOPS.forEach((stop, i) => {
      const mx = ox + stop.markerPos.x * scale;
      const my = oy + stop.markerPos.z * scale;
      const d = Math.hypot(px - mx, py - my);
      if (d < bestDist) { bestDist = d; closest = i; }
    });
    if (closest >= 0) goToStop(closest);
  });
}

function drawMinimap() {
  const canvas = document.getElementById('minimap-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, w, h);

  const scale = 0.65;
  const ox = w / 2 - MT_CX * scale;
  const oy = h / 2;

  function toMap(x, z) { return [ox + x * scale, oy + z * scale]; }

  ctx.strokeStyle = 'rgba(201,168,76,0.3)';
  ctx.lineWidth = 1;
  let [x1, y1] = toMap(MT_X1, MT_Z1);
  let [x2, y2] = toMap(MT_X2, MT_Z2);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

  ctx.strokeStyle = 'rgba(201,168,76,0.5)';
  [x1, y1] = toMap(AZ_X1, AZ_Z1);
  [x2, y2] = toMap(AZ_X2, AZ_Z2);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

  ctx.strokeStyle = 'rgba(201,168,76,0.5)';
  [x1, y1] = toMap(WC_X1, WC_Z1);
  [x2, y2] = toMap(WC_X2, WC_Z2);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

  ctx.fillStyle = 'rgba(201,168,76,0.6)';
  const [sx, sy] = toMap(-15, -4);
  ctx.fillRect(sx, sy, 10 * scale, 8 * scale);

  ctx.fillStyle = 'rgba(201,168,76,0.4)';
  const [kx, ky] = toMap(-20, -2);
  ctx.fillRect(kx, ky, 4 * scale, 4 * scale);

  ctx.fillStyle = 'rgba(160,120,60,0.6)';
  const [ax, ay] = toMap(-2.2, -3.2);
  ctx.fillRect(ax, ay, 6.4 * scale, 6.4 * scale);

  TOUR_STOPS.forEach((stop, i) => {
    const [mx, my] = toMap(stop.markerPos.x, stop.markerPos.z);
    ctx.fillStyle = i === currentStop ? '#c9a84c' : 'rgba(201,168,76,0.4)';
    ctx.beginPath();
    ctx.arc(mx, my, i === currentStop ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const [cx, cy] = toMap(camera.position.x, camera.position.z);
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Animation Loop ─────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  const time = performance.now() * 0.001;
  scene.traverse(obj => {
    if (!obj.userData) return;

    if (obj.userData.isFlame) {
      const id = obj.id;
      const layer = obj.userData.flameLayer;

      if (layer === 'core') {
        obj.scale.x = 0.8 + Math.sin(time * 8 + id) * 0.25;
        obj.scale.y = 0.85 + Math.sin(time * 6 + id * 1.3) * 0.2;
        obj.scale.z = 0.8 + Math.cos(time * 7 + id) * 0.25;
        obj.rotation.y = time * 2 + id;
      } else if (layer === 'mid') {
        obj.scale.x = 0.9 + Math.sin(time * 5 + id * 0.7) * 0.15;
        obj.scale.y = 0.8 + Math.sin(time * 7 + id) * 0.25;
        obj.scale.z = 0.9 + Math.cos(time * 6 + id * 1.1) * 0.15;
      } else if (layer === 'outer') {
        obj.scale.x = 0.85 + Math.sin(time * 4 + id) * 0.2;
        obj.scale.y = 0.75 + Math.sin(time * 5.5 + id * 0.9) * 0.3;
        obj.scale.z = 0.85 + Math.cos(time * 4.5 + id) * 0.2;
      } else if (layer === 'tongue') {
        const off = obj.userData.flameOffset || 0;
        if (obj.userData.baseY === undefined) obj.userData.baseY = obj.position.y;
        obj.scale.y = 0.6 + Math.sin(time * 10 + off * 1.5) * 0.5;
        obj.scale.x = 0.8 + Math.sin(time * 8 + off) * 0.3;
        obj.position.y = obj.userData.baseY + Math.sin(time * 6 + off) * 0.08;
        obj.rotation.z = Math.sin(time * 5 + off * 2) * 0.3;
      } else if (layer === 'ember') {
        obj.material.emissiveIntensity = 0.6 + Math.sin(time * 3 + id) * 0.4;
      } else {
        obj.scale.setScalar(0.85 + Math.sin(time * 4 + id) * 0.2);
      }
    }

    if (obj.userData.isFlameLight) {
      obj.intensity = obj.intensity * (0.95 + Math.sin(time * 6 + obj.id) * 0.08);
    }

    if (obj.userData.isWater) {
      if (obj.userData.rippleIdx !== undefined) {
        const ri = obj.userData.rippleIdx;
        const s = 1 + Math.sin(time * 2 + ri * 2) * 0.3;
        obj.scale.set(s, s, 1);
        obj.material.opacity = 0.25 - ri * 0.06 + Math.sin(time * 3 + ri) * 0.08;
      } else if (obj.userData.dropIdx !== undefined) {
        const di = obj.userData.dropIdx;
        obj.position.y += Math.sin(time * 4 + di * 0.8) * 0.002;
        obj.material.opacity = 0.4 + Math.sin(time * 5 + di) * 0.3;
      }
    }

    if (obj.userData.isPerson) {
      const { upper, armPivots, phase, bowDepth, swayAmt, praySpeed, personType } = obj.userData;
      const t = time * praySpeed + phase;

      if (personType === 'child') {
        // Children wander in small circles and bob their heads
        obj.userData.wanderAngle += 0.004;
        const wanderR = 0.8;
        obj.position.x = obj.userData.baseX + Math.cos(obj.userData.wanderAngle) * wanderR;
        obj.position.z = obj.userData.baseZ + Math.sin(obj.userData.wanderAngle) * wanderR;
        obj.rotation.y = obj.userData.wanderAngle + Math.PI / 2;
        upper.rotation.x = Math.sin(t * 2) * 0.08;
        armPivots[0].rotation.z =  0.2 + Math.sin(t * 1.5) * 0.25;
        armPivots[1].rotation.z = -0.2 - Math.sin(t * 1.5 + 1) * 0.25;
      } else if (personType === 'kohen' || personType === 'kohenGadol') {
        // Priests: deliberate swaying torso, arms held forward in service
        const sway = Math.sin(t * 0.9) * swayAmt;
        obj.rotation.y = obj.userData.baseRotY + Math.sin(t * 0.4) * 0.06;
        upper.rotation.x = 0.08 + Math.sin(t) * bowDepth;
        upper.rotation.z = sway;
        armPivots[0].rotation.x = -0.3 - Math.sin(t + 0.5) * 0.15;
        armPivots[1].rotation.x = -0.3 - Math.sin(t - 0.5) * 0.15;
        armPivots[0].rotation.z =  0.15 + sway * 0.5;
        armPivots[1].rotation.z = -0.15 + sway * 0.5;
      } else {
        // Israelites / Levites: full Shemoneh Esrei bow cycle
        // Bow curve: smooth dip-hold-rise using a shaped sine
        const rawBow = Math.sin(t);
        const bowCurve = rawBow > 0 ? Math.pow(rawBow, 0.6) : rawBow * 0.2;
        upper.rotation.x = bowCurve * bowDepth;

        // Gentle side sway independent of bow
        upper.rotation.z = Math.sin(t * 0.7 + phase) * swayAmt;

        // Arms rise as the person bows forward (hands extend toward floor)
        const armLift = bowCurve * 0.45;
        armPivots[0].rotation.x = -armLift;
        armPivots[1].rotation.x = -armLift;
        armPivots[0].rotation.z =  0.15 + Math.sin(t * 0.5) * 0.05;
        armPivots[1].rotation.z = -0.15 - Math.sin(t * 0.5) * 0.05;

        // Subtle whole-body rotation to feel alive
        obj.rotation.y = obj.userData.baseRotY + Math.sin(t * 0.3 + phase) * 0.07;
      }
    }
  });

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  drawMinimap();
}

// ─── UI Events ──────────────────────────────────────────────
function setupUI() {
  document.getElementById('btn-enter').addEventListener('click', () => {
    document.getElementById('landing').style.opacity = '0';
    document.getElementById('landing').style.transition = 'opacity 0.8s ease';
    setTimeout(() => {
      document.getElementById('landing').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      init();
      buildSidebar();
      updateTourUI();
    }, 800);
  });

  document.getElementById('btn-prev').addEventListener('click', () => {
    goToStop((currentStop - 1 + TOUR_STOPS.length) % TOUR_STOPS.length);
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    goToStop((currentStop + 1) % TOUR_STOPS.length);
  });

  document.getElementById('info-close').addEventListener('click', () => {
    document.getElementById('info-panel').classList.add('hidden');
  });

  document.getElementById('btn-help').addEventListener('click', () => {
    document.getElementById('help-modal').classList.toggle('hidden');
  });

  document.getElementById('help-close').addEventListener('click', () => {
    document.getElementById('help-modal').classList.add('hidden');
  });

  document.getElementById('btn-overview').addEventListener('click', () => {
    animateCamera({ x: 80, y: 55, z: 80 }, { x: 12, y: 3, z: 0 });
    document.getElementById('location-name').textContent = 'הר הבית';
    document.getElementById('info-panel').classList.add('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      goToStop((currentStop + 1) % TOUR_STOPS.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      goToStop((currentStop - 1 + TOUR_STOPS.length) % TOUR_STOPS.length);
    } else if (e.key === 'Escape') {
      document.getElementById('info-panel').classList.add('hidden');
      document.getElementById('help-modal').classList.add('hidden');
    }
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function hideLoading() {
  const loader = document.getElementById('loading');
  loader.style.opacity = '0';
  loader.style.transition = 'opacity 0.5s ease';
  setTimeout(() => loader.classList.add('hidden'), 500);
}

// ─── Boot ───────────────────────────────────────────────────
setupUI();
