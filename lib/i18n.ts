// Language codes and their display names
export type LanguageCode = 'en' | 'hi' | 'es' | 'fr' | 'zh' | 'ar' | 'pt' | 'de' | 'ja' | 'ru' | 'bn' | 'ur';

interface LanguageInfo {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  flag: string;
  rtl: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', flag: '🇮🇳', rtl: false },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸', rtl: false },
  { code: 'fr', nativeName: 'Français', englishName: 'French', flag: '🇫🇷', rtl: false },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese', flag: '🇨🇳', rtl: false },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', flag: '🇸🇦', rtl: true },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', flag: '🇵🇹', rtl: false },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪', rtl: false },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵', rtl: false },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺', rtl: false },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', flag: '🇧🇩', rtl: false },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', flag: '🇵🇰', rtl: true },
];

// Translation keys
export interface Translations {
  chooseLanguage: string;
  continueWith: string;
  placeholder: string;
  listening: string;
  searching: string;
  noResults: string;
  followUp: string;
  velocity: string;
  research: string;
  deep: string;
  sources: string;
  askAnything: string;
  deconstruct: string;
  intelligenceHorizon: string;
  signIn?: string;
  createAccount?: string;
  accessAccount?: string;
  joinNetwork?: string;
  noAccount?: string;
  hasAccount?: string;
  archive?: string;
  searchArchive?: string;
  endSession?: string;
  tapMicrophone?: string;
  thinking?: string;
  speaking?: string;
  processing?: string;
  name?: string;
  email?: string;
  password?: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    chooseLanguage: 'CHOOSE YOUR LANGUAGE',
    continueWith: 'Continue with',
    placeholder: 'Deconstruct intelligence...',
    listening: 'Listening...',
    searching: 'Searching the expanse...',
    noResults: 'The expanse is quiet',
    followUp: 'Ask a follow-up...',
    velocity: 'VELOCITY',
    research: 'RESEARCH',
    deep: 'DEEP',
    sources: 'ORIGINS',
    askAnything: 'Ask anything',
    deconstruct: 'Deconstruct',
    intelligenceHorizon: 'INTELLIGENCE HORIZON',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    accessAccount: 'Access your Eclipse account',
    joinNetwork: 'Join the intelligence network',
    noAccount: "Don't have an account? Sign up",
    hasAccount: 'Already have an account? Sign in',
    archive: 'Expanse Archive',
    searchArchive: 'Search your archive...',
    endSession: 'End Session',
    tapMicrophone: 'Tap microphone to start',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
    processing: 'Processing...',
    name: 'Name',
    email: 'Email',
    password: 'Password',
  },
  hi: {
    chooseLanguage: 'अपनी भाषा चुनें',
    continueWith: 'जारी रखें',
    placeholder: 'जिज्ञासा को उजागर करें...',
    listening: 'सुन रहा हूं...',
    searching: 'खोज रहा हूं...',
    noResults: 'कोई परिणाम नहीं',
    followUp: 'आगे पूछें...',
    velocity: 'वेलोसिटी',
    research: 'शोध',
    deep: 'डीप',
    sources: 'स्रोत',
    askAnything: 'कुछ भी पूछें',
    deconstruct: 'विश्लेषण',
    intelligenceHorizon: 'बुद्धि क्षितिज',
    signIn: 'साइन इन करें',
    createAccount: 'खाता बनाएं',
    accessAccount: 'अपने Eclipse खाते तक पहुंचें',
    joinNetwork: 'बुद्धि नेटवर्क में शामिल हों',
    noAccount: 'खाता नहीं है? साइन अप करें',
    hasAccount: 'पहले से ही खाता है? साइन इन करें',
    archive: 'एक्सपांस आर्काइव',
    searchArchive: 'अपने आर्काइव खोजें...',
    endSession: 'सत्र समाप्त करें',
    tapMicrophone: 'शुरू करने के लिए माइक्रोफोन टैप करें',
    thinking: 'सोच रहा हूं...',
    speaking: 'बोल रहा हूं...',
    processing: 'प्रसंस्करण...',
    name: 'नाम',
    email: 'ईमेल',
    password: 'पासवर्ड',
  },
  es: {
    chooseLanguage: 'ELIGE TU IDIOMA',
    continueWith: 'Continuar con',
    placeholder: 'Descompón la inteligencia...',
    listening: 'Escuchando...',
    searching: 'Buscando...',
    noResults: 'No hay resultados',
    followUp: 'Haz una pregunta...',
    velocity: 'VELOCIDAD',
    research: 'INVESTIGACIÓN',
    deep: 'PROFUNDO',
    sources: 'FUENTES',
    askAnything: 'Pregunta lo que sea',
    deconstruct: 'Deconstruir',
    intelligenceHorizon: 'HORIZONTE DE INTELIGENCIA',
  },
  fr: {
    chooseLanguage: 'CHOISISSEZ VOTRE LANGUE',
    continueWith: 'Continuer avec',
    placeholder: 'Déconstruire l\'intelligence...',
    listening: 'Écoute...',
    searching: 'Recherche...',
    noResults: 'Aucun résultat',
    followUp: 'Poser une question...',
    velocity: 'VÉLOCITÉ',
    research: 'RECHERCHE',
    deep: 'PROFOND',
    sources: 'SOURCES',
    askAnything: 'Posez n\'importe quelle question',
    deconstruct: 'Déconstruire',
    intelligenceHorizon: 'HORIZON D\'INTELLIGENCE',
  },
  zh: {
    chooseLanguage: '选择您的语言',
    continueWith: '继续使用',
    placeholder: '解构智能...',
    listening: '正在聆听...',
    searching: '正在搜索...',
    noResults: '无结果',
    followUp: '追问...',
    velocity: '速度',
    research: '研究',
    deep: '深度',
    sources: '来源',
    askAnything: '问任何问题',
    deconstruct: '解构',
    intelligenceHorizon: '智能视界',
  },
  ar: {
    chooseLanguage: 'اختر لغتك',
    continueWith: 'المتابعة باستخدام',
    placeholder: 'حلل الذكاء...',
    listening: 'يستمع...',
    searching: 'يبحث...',
    noResults: 'لا توجد نتائج',
    followUp: 'اسأل متابعة...',
    velocity: 'السرعة',
    research: 'بحث',
    deep: 'عميق',
    sources: 'مصادر',
    askAnything: 'اسأل أي شيء',
    deconstruct: 'تحليل',
    intelligenceHorizon: 'أفق الذكاء',
  },
  pt: {
    chooseLanguage: 'ESCOLHA SEU IDIOMA',
    continueWith: 'Continuar com',
    placeholder: 'Deconstruir a inteligência...',
    listening: 'Ouvindo...',
    searching: 'Pesquisando...',
    noResults: 'Sem resultados',
    followUp: 'Faça uma pergunta...',
    velocity: 'VELOCIDADE',
    research: 'PESQUISA',
    deep: 'PROFUNDO',
    sources: 'FONTES',
    askAnything: 'Pergunte qualquer coisa',
    deconstruct: 'Deconstruir',
    intelligenceHorizon: 'HORIZONTE DE INTELIGÊNCIA',
  },
  de: {
    chooseLanguage: 'WÄHLEN SIE IHRE SPRACHE',
    continueWith: 'Fortfahren mit',
    placeholder: 'Intelligenz dekonstruieren...',
    listening: 'Hört zu...',
    searching: 'Sucht...',
    noResults: 'Keine Ergebnisse',
    followUp: 'Folgefrage stellen...',
    velocity: 'GESCHWINDIGKEIT',
    research: 'FORSCHUNG',
    deep: 'TIEF',
    sources: 'QUELLEN',
    askAnything: 'Frag irgendetwas',
    deconstruct: 'Dekonstruieren',
    intelligenceHorizon: 'INTELLIGENZHORIZONT',
  },
  ja: {
    chooseLanguage: '言語を選択',
    continueWith: '続行',
    placeholder: '知性を分解...',
    listening: '聞いています...',
    searching: '検索中...',
    noResults: '結果なし',
    followUp: 'フォローアップ...',
    velocity: '速度',
    research: '研究',
    deep: '深い',
    sources: 'ソース',
    askAnything: '何でも聞いて',
    deconstruct: '分解',
    intelligenceHorizon: '知性の地平線',
  },
  ru: {
    chooseLanguage: 'ВЫБЕРИТЕ ЯЗЫК',
    continueWith: 'Продолжить с',
    placeholder: 'Деконструировать интеллект...',
    listening: 'Слушает...',
    searching: 'Ищет...',
    noResults: 'Нет результатов',
    followUp: 'Задать вопрос...',
    velocity: 'СКОРОСТЬ',
    research: 'ИССЛЕДОВАНИЕ',
    deep: 'ГЛУБОКИЙ',
    sources: 'ИСТОЧНИКИ',
    askAnything: 'Спроси что угодно',
    deconstruct: 'Деконструировать',
    intelligenceHorizon: 'ГОРИЗОНТ ИНТЕЛЛЕКТА',
  },
  bn: {
    chooseLanguage: 'আপনার ভাষা বেছে নিন',
    continueWith: 'চালিয়ে যান',
    placeholder: 'বুদ্ধি বিশ্লেষণ করুন...',
    listening: 'শুনছি...',
    searching: 'খুঁজছি...',
    noResults: 'কোনো ফলাফল নেই',
    followUp: 'আরও জিজ্ঞাসা করুন...',
    velocity: 'গতি',
    research: 'গবেষণা',
    deep: 'গভীর',
    sources: 'উৎস',
    askAnything: 'যেকোনো কিছু জিজ্ঞাসা করুন',
    deconstruct: 'বিশ্লেষণ',
    intelligenceHorizon: 'বুদ্ধির ক্ষিতিজ',
  },
  ur: {
    chooseLanguage: 'اپنی زبان منتخب کریں',
    continueWith: 'جاری رکھیں',
    placeholder: 'ذہانت کو تجزیہ کریں...',
    listening: 'سن رہا ہے...',
    searching: 'تلاش کر رہا ہے...',
    noResults: 'کوئی نتیجہ نہیں',
    followUp: 'مزید پوچھیں...',
    velocity: 'رفتار',
    research: 'تحقیق',
    deep: 'گہرا',
    sources: 'ذرائع',
    askAnything: 'کچھ بھی پوچھیں',
    deconstruct: 'تجزیہ',
    intelligenceHorizon: 'ذہانت کا افق',
  },
};

export function getLanguageInfo(code: LanguageCode): LanguageInfo {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

export function detectLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0] as LanguageCode;
  const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
  
  if (supportedCodes.includes(browserLang)) {
    return browserLang;
  }
  
  return 'en';
}

export function isRTL(code: LanguageCode): boolean {
  return ['ar', 'ur'].includes(code);
}
