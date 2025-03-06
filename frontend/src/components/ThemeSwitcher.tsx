import React from "react";
import "../styles/ThemeSwitcher.css"
import { SunIcon } from "./SunIcon";
import { MoonIcon } from "./MoonIcon";
//import { Sun, Moon } from "lucide-react"; // Используем иконки Sun и Moon

interface ThemeSwitcherProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isDarkMode, toggleTheme }) => {
    return (
        <label className="switch">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
            <span className="slider">
                {/* {isDarkMode ? <Moon className="icon dark-icon" /> : <Sun className="icon light-icon" />} */}
            </span>
            {isDarkMode ?  <MoonIcon /> : <SunIcon />}
            </label>
    );
};

export default ThemeSwitcher;
