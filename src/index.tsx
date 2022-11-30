import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { Canvas } from "@react-three/fiber";
import CameraControl from "./components/CameraControl";

import config from "./config";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <Canvas
            shadows
            style={{ width: "100vw", height: "100vh" }}
            camera={{ position: config.startCameraPosition.clone() }}
        >
            <App />
            <CameraControl />
        </Canvas>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
