import { FC, useState, useEffect } from "react";
import LastData from "./components/LastData";
import WeatherChart from "./components/WeatherChart";

const App: FC = () => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") !== "light";
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
            <header style={{ width: '100%', display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
            <h2 style={{padding: "0 10px", margin: "10px 0"}}>Мониторинг погоды</h2>
            <a onClick={() => setDarkMode(!darkMode)} href="#" role="button" style={{padding: "10px"}}>
                {darkMode ? "🌙" : "🌞"}
            </a>
            </header>
            <LastData />
            <WeatherChart />
        </div>
    );
};

export default App;
