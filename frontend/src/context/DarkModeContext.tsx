import { createContext, useContext, useState, useEffect, FC, ReactNode } from "react";

// Типы для контекста
interface DarkModeContextType {
    darkMode: boolean;
    toggleTheme: () => void;
}

// Создаем контекст
const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

// Провайдер для контекста
export const DarkModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") !== "light";
    });

    // Эффект для применения темы
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    // Функция для переключения темы
    const toggleTheme = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleTheme }}>
            {children}
        </DarkModeContext.Provider>
    );
};

// Кастомный хук для использования контекста
export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error("useDarkMode must be used within a DarkModeProvider");
    }
    return context;
};