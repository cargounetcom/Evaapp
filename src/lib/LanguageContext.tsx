import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'it';

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

const translations: Translations = {
  EXPLORE: { en: 'EXPLORE', es: 'EXPLORAR', fr: 'EXPLORER', de: 'ENTDECKEN', it: 'ESPLORA' },
  CHATS: { en: 'CHATS', es: 'CHATS', fr: 'CHATS', de: 'CHATS', it: 'CHAT' },
  UPGRADE: { en: 'UPGRADE', es: 'MEJORAR', fr: 'AMÉLIORER', de: 'UPGRADE', it: 'MIGLIORA' },
  ME: { en: 'ME', es: 'YO', fr: 'MOI', de: 'ICH', it: 'IO' },
  ADMIN: { en: 'ADMIN', es: 'ADMIN', fr: 'ADMIN', de: 'ADMIN', it: 'ADMIN' },
  JOIN_THE_REVOLUTION: { en: 'JOIN THE REVOLUTION', es: 'ÚNETE A LA REVOLUCIÓN', fr: 'REJOIGNEZ LA RÉVOLUTION', de: 'TRITT DER REVOLUTION BEI', it: 'UNISCITI ALLA RIVOLUZIONE' },
  LOVE_IN_HIGH_CONTRAST: { en: 'Love in High Contrast!', es: '¡Amor en alto contraste!', fr: "L'amour en haut contraste !", de: 'Liebe in hohem Kontrast!', it: 'Amore ad alto contrasto!' },
  AUTHENTIC_CONNECTIONS: { en: '100% AUTHENTIC CONNECTIONS. NO BORING STUFF.', es: 'CONEXIONES 100% AUTÉNTICAS. NADA ABURRIDO.', fr: "CONNEXIONS 100% AUTHENTIQUES. PAS DE TRUCS ENNUYEUX.", de: '100% AUTHENTISCHE VERBINDUNGEN. KEIN LANGWEILIGER KRAM.', it: 'CONNESSIONI AUTENTICHE AL 100%. NIENTE DI NOIOSO.' },
  TUNING_FREQUENCIES: { en: 'TUNING FREQUENCIES...', es: 'SINTONIZANDO FRECUENCIAS...', fr: 'RÉGLAGE DES FRÉQUENCES...', de: 'FREQUENZEN ABSTIMMEN...', it: 'SINTONIZZAZIONE FREQUENZE...' },
  SILENCE: { en: 'SILENCE...', es: 'SILENCIO...', fr: 'SILENCE...', de: 'STILLE...', it: 'SILENZIO...' },
  EDGE_OF_UNIVERSE: { en: 'YOU\'VE REACHED THE EDGE OF THE UNIVERSE. CHANGE YOUR RANGE!', es: 'HAS LLEGADO AL BORDE DEL UNIVERSO. ¡CAMBIA TU RANGO!', fr: 'VOUS AVEZ ATTEINT LE BORD DE L\'UNIVERS. CHANGEZ VOTRE PORTÉE !', de: 'DU HAST DEN RAND DES UNIVERSUMS ERREICHT. ÄNDERE DEINE REICHWEITE!', it: 'HAI RAGGIUNTO IL BORDE DELL\'UNIVERSO. CAMBIA IL TUO RAGGIO!' },
  PULSE_RANGE: { en: 'PULSE RANGE', es: 'RANGO DE PULSO', fr: 'PORTÉE DU POULS', de: 'PULSREICHWEITE', it: 'RAGGIO D\'AZIONE' },
  MATCH: { en: 'MATCH!', es: '¡COINCIDENCIA!', fr: 'MATCH !', de: 'MATCH!', it: 'MATCH!' },
  AMPLIFY_CHAT: { en: 'AMPLIFY CHAT!', es: '¡AMPLIFICAR CHAT!', fr: 'AMPLIFIEZ LE CHAT !', de: 'CHAT VERSTÄRKEN!', it: 'AMPLIFICA CHAT!' },
  BOOM: { en: 'BOOM!', es: '¡BOOM!', fr: 'BOUM !', de: 'BOOM!', it: 'BOOM!' },
  NEXT: { en: 'NEXT!', es: '¡SIGUIENTE!', fr: 'SUIVANT !', de: 'NÄCHSTER!', it: 'AVANTI!' },
  LIVE: { en: 'LIVE', es: 'EN VIVO', fr: 'EN DIRECT', de: 'LIVE', it: 'LIVE' },
  DECRYPTING_DATA: { en: 'DECRYPTING DATA...', es: 'DESCRIPTANDO DATOS...', fr: 'DÉCRYPTAGE DES DONNÉES...', de: 'DATEN ENTSCHLÜSSELN...', it: 'DECRIPTAZIONE DATI...' },
  COMMAND_CENTER: { en: 'COMMAND CENTER', es: 'CENTRO DE MANDO', fr: 'CENTRE DE COMMANDE', de: 'KOMMANDOZENTRALE', it: 'CENTRO COMANDO' },
  RESTRICTED_ACCESS: { en: 'RESTRICTED ACCESS: ADMIN EYES ONLY', es: 'ACCESO RESTRINGIDO: SOLO PARA ADMINISTRADORES', fr: 'ACCÈS RESTREINT : RÉSERVÉ AUX ADMINS', de: 'EINGESCHRÄNKTER ZUGRIFF: NUR FÜR ADMINS', it: 'ACCESSO LIMITATO: SOLO ADMIN' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
