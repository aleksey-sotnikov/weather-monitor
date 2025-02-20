import { FC, useState, useEffect } from "react";
import WeatherChart from "./components/WeatherChart";

const App: FC = () => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

     useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <div className="App" style={{ padding: "10px" }}>
            <h1>Мониторинг погоды</h1>
            <WeatherChart />
            <a onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "🌙" : "🌞"}
            </a>
        </div>
    );
};

export default App;
