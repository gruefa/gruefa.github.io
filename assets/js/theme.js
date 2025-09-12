function updateToggleButton(button, isDark) {
    if (button) {
        button.innerHTML = isDark ? "☀️" : "🌙";
        button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        button.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
}

function updateThemeColorMeta(isDark) {
    const themeColorMeta = document.getElementById("theme-color-meta");
    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", isDark ? "#2d2d2d" : "#f9f9f9");
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    const button = document.getElementById("theme-toggle");
    updateToggleButton(button, newTheme === "dark");
    updateThemeColorMeta(newTheme === "dark");
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", savedTheme);
    const button = document.getElementById("theme-toggle");
    updateToggleButton(button, savedTheme === "dark");
    updateThemeColorMeta(savedTheme === "dark");
});

window.addEventListener("load", () => {
    document.body.classList.remove("preload"); // Flashbang averted
});