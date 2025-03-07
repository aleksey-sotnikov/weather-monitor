import { FC, useState, useEffect } from "react";
import LastData from "./components/LastData";
import WeatherChart from "./components/WeatherChart";
import ThemeSwitcher from "./components/ThemeSwitcher";
import WeatherForecast from "./components/WeatherForecast";
import { DarkModeProvider } from "./context/DarkModeContext"; // Импортируем провайдер

const App: FC = () => {
    return (
        <DarkModeProvider>
            <div className="App dashboard-container">
                <header style={{ width: '100%', display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                    <h2 style={{padding: "0", margin: "0px 10px 10px 0"}}>Монитор погоды</h2>
                    
                    <ThemeSwitcher />
                </header>
                <LastData />
                <WeatherChart />
                <WeatherForecast />
            </div>
        </DarkModeProvider>
    );
};

export default App;
