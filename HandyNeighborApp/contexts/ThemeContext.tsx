import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

type ThemePreference = ResolvedTheme | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextProps {
    theme: ResolvedTheme;
    preference: ThemePreference;
    setPreference: (pref: ThemePreference) => void
    resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [preference, setPreference] = useState<ThemePreference>('system');
    const [theme, setTheme] = useState<ResolvedTheme>('light');

    const updateTheme = () => {
        const system = Appearance.getColorScheme() || 'light';
        setTheme(preference === 'system' ? system : preference);
    };

    useEffect(() => {
        updateTheme();
    }, [preference]);

    useEffect(() => {
        const listener = Appearance.addChangeListener(() => {
            if (preference === 'system') {
                updateTheme();
            }
        });
        return () => listener.remove();
    }, [preference]);

    return (
        <ThemeContext.Provider value={{ theme, preference, setPreference,resolvedTheme: theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};
