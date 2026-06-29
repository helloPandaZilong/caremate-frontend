import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";

async function prepareScenarioMocks() {
    if (import.meta.env.VITE_USE_SCENARIO_MOCKS === "true") {
        const { installCareMateScenarioMocks } = await import("./mocks/installCareMateScenarioMocks.js");
        installCareMateScenarioMocks();
    }
}

prepareScenarioMocks().then(() => {
    createRoot(document.getElementById("root")).render(<App />);
});
v