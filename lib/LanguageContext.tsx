"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Language, translations } from "./translations";

type LanguageContextType = {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (typeof translations)["es"] | (typeof translations)["en"];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>("es"); // Default Spanish

    const value: LanguageContextType = {
        lang,
        setLang,
        t: translations[lang],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
