import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleAuth } from "@southdevs/capacitor-google-auth";
import { Capacitor } from "@capacitor/core";

if (Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    clientId: "216085914365-5votk2q68uakk7pudvtpbfr71frrtg2b.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    grantOfflineAccess: true,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
