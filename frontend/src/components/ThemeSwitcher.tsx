import React from "react";
import "../styles/ThemeSwitcher.css"
import { SunIcon } from "./SunIcon";
import { MoonIcon } from "./MoonIcon";
import { useDarkMode } from "../context/DarkModeContext";

const ThemeSwitcher: React.FC = () => {
    const { darkMode, toggleTheme } = useDarkMode();
    return (
        <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
            <span className="slider">
                {/* {isDarkMode ? <Moon className="icon dark-icon" /> : <Sun className="icon light-icon" />} */}
            </span>
            {darkMode ?  <MoonIcon /> : <SunIcon />}
            </label>
    );
};

export default ThemeSwitcher;
