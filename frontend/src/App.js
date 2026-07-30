import React, { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import lightBackground from '../src/assets/wa-background-light.png';
import darkBackground from '../src/assets/wa-background-dark.jpg';
import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { SocketContext, SocketManager } from './context/Socket/SocketContext';

import Routes from "./routes";

const queryClient = new QueryClient();

const App = () => {
    const [locale, setLocale] = useState();

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const preferredTheme = window.localStorage.getItem("preferredTheme");
    const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");

    const [primaryColor, setPrimaryColor] = useState(
        window.localStorage.getItem("primaryColor") || "#10B981"
    );
    const [secondaryColor, setSecondaryColor] = useState(
        window.localStorage.getItem("secondaryColor") || "#6366F1"
    );
    const [fontSize, setFontSize] = useState(
        Number(window.localStorage.getItem("fontSize")) || 14
    );

    const setCustomTheme = React.useCallback(({ primaryColor: newPrimary, secondaryColor: newSecondary, fontSize: newFont }) => {
        if (newPrimary) {
            setPrimaryColor(newPrimary);
            window.localStorage.setItem("primaryColor", newPrimary);
        }
        if (newSecondary) {
            setSecondaryColor(newSecondary);
            window.localStorage.setItem("secondaryColor", newSecondary);
        }
        if (newFont) {
            setFontSize(Number(newFont));
            window.localStorage.setItem("fontSize", String(newFont));
        }
    }, []);

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
            setCustomTheme,
            primaryColor,
            secondaryColor,
            fontSize
        }),
        [primaryColor, secondaryColor, fontSize, setCustomTheme]
    );

    const theme = createTheme(
        {
            typography: {
                fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: fontSize,
                h6: {
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                },
                button: {
                    textTransform: "none",
                    fontWeight: 600,
                },
            },
            shape: {
                borderRadius: 12,
            },
            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: '6px',
                    height: '6px',
                    borderRadius: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: primaryColor,
                    borderRadius: "6px",
                    "&:hover": {
                        backgroundColor: primaryColor,
                    }
                },
            },
            scrollbarStylesSoft: {
                "&::-webkit-scrollbar": {
                    width: "6px",
                    borderRadius: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: mode === "light" ? "rgba(203, 213, 225, 0.6)" : "rgba(51, 65, 85, 0.6)",
                    borderRadius: "6px",
                },
            },
            palette: {
                type: mode,
                primary: { main: primaryColor },
                secondary: { main: secondaryColor },
                quicktags: { main: primaryColor },
                sair: { main: mode === "light" ? "#EF4444" : "#F87171" },
                vcard: { main: primaryColor },
                textPrimary: mode === "light" ? "#0F172A" : "#F8FAFC",
                borderPrimary: mode === "light" ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)",
                dark: { main: mode === "light" ? "#1E293B" : "#F8FAFC" },
                light: { main: mode === "light" ? "#F8FAFC" : "#1E293B" },
                tabHeaderBackground: mode === "light" ? "#F1F5F9" : "#1E293B",
                ticketlist: mode === "light" ? "#F8FAFC" : "#0F172A",
                optionsBackground: mode === "light" ? "#FFFFFF" : "#1E293B",
                options: mode === "light" ? "#F1F5F9" : "#334155",
                fontecor: primaryColor,
                fancyBackground: mode === "light" ? "#F8FAFC" : "#0F172A",
                bordabox: mode === "light" ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)",
                newmessagebox: mode === "light" ? "#F1F5F9" : "#1E293B",
                inputdigita: mode === "light" ? "#FFFFFF" : "#1E293B",
                contactdrawer: mode === "light" ? "#FFFFFF" : "#1E293B",
                announcements: mode === "light" ? "#F1F5F9" : "#1E293B",
                login: mode === "light" ? "#FFFFFF" : "#0F172A",
                announcementspopover: mode === "light" ? "#FFFFFF" : "#1E293B",
                chatlist: mode === "light" ? "#F8FAFC" : "#1E293B",
                boxlist: mode === "light" ? "#F1F5F9" : "#1E293B",
                boxchatlist: mode === "light" ? "#F1F5F9" : "#0F172A",
                total: mode === "light" ? "#FFFFFF" : "#1E293B",
                messageIcons: mode === "light" ? "#64748B" : "#94A3B8",
                inputBackground: mode === "light" ? "#FFFFFF" : "#1E293B",
                barraSuperior: mode === "light" 
                    ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
                    : "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                boxticket: mode === "light" ? "#F1F5F9" : "#1E293B",
                campaigntab: mode === "light" ? "#F1F5F9" : "#1E293B",
                mediainput: mode === "light" ? "#F1F5F9" : "#0F172A",
                contadordash: mode === "light" ? "#FFFFFF" : "#1E293B",
            },
            mode,
        },
        locale
    );

    useEffect(() => {
        const i18nlocale = localStorage.getItem("i18nextLng");
        if (i18nlocale && typeof i18nlocale === "string" && i18nlocale.length >= 5) {
            const browserLocale =
                i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

            if (browserLocale === "ptBR") {
                setLocale(ptBR);
            }
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("preferredTheme", mode);
    }, [mode]);

    return (
        <ColorModeContext.Provider value={{ colorMode, setCustomTheme, primaryColor, secondaryColor, fontSize }}>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                  <SocketContext.Provider value={SocketManager}>
                      <Routes />
                  </SocketContext.Provider>
                </QueryClientProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
