import React from "react";
import { MoonIcon, SunIcon } from "./Icons";
import { useDarkMode } from "../context/DarkModeContext";
import "../styles/ThemeSwitcher.css"

const ThemeSwitcher: React.FC = () => {
    const { darkMode, toggleTheme } = useDarkMode();
    return (
        <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
            <span className="slider" />
            { darkMode ? <MoonIcon /> : <SunIcon /> }
        </label>
    );
};

export default ThemeSwitcher;
