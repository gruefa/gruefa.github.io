function updateToggleButton(button, isDark) {
    if (button) {
        button.innerHTML = isDark ? "☀️" : "🌙";
        button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        button.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    const button = document.getElementById("theme-toggle");
    updateToggleButton(button, newTheme === "dark");
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", savedTheme);
    const button = document.getElementById("theme-toggle");
    updateToggleButton(button, savedTheme === "dark");
});

window.addEventListener("load", () => {
    document.body.classList.remove("preload"); // Flashbang averted
});