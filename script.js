/* ==========================================
   HorizonTechX Simple Calculator
   script.js (V1 Production)
========================================== */

class HorizonCalculator {

    constructor() {

        this.currentOperand =
            document.getElementById("currentOperand");

        this.previousOperand =
            document.getElementById("previousOperand");

        this.keypad =
            document.getElementById("keypad");

        this.themeToggle =
            document.getElementById("themeToggle");

        this.expression = "";

        this.maxDigits = 16;

        this.init();
    }

    /* ==========================
       Initialization
    ========================== */

    init() {

        this.restoreTheme();

        this.bindButtons();

        this.bindKeyboard();

        this.bindThemeToggle();

        this.updateDisplay();

        window.addEventListener(
            "resize",
            () => this.scaleFont()
        );
    }

    /* ==========================
       Button Events
    ========================== */

    bindButtons() {

        this.keypad.addEventListener("click", (e) => {

            const button =
                e.target.closest("button");

            if (!button) return;

            const key =
                button.dataset.key;

            this.handleInput(key);
        });
    }

    /* ==========================
       Keyboard Support
    ========================== */

    bindKeyboard() {

        document.addEventListener(
            "keydown",
            (e) => {

                try {

                    const key = e.key;

                    /* Numbers */

                    if (/^[0-9]$/.test(key)) {
                        this.append(key);
                        return;
                    }

                    /* Operators */

                    if (
                        ["+", "-", "*", "/", "%", ".", "(", ")"]
                            .includes(key)
                    ) {
                        this.append(key);
                        return;
                    }

                    /* Enter */

                    if (key === "Enter") {

                        e.preventDefault();

                        this.calculate();
                    }

                    /* Backspace */

                    if (key === "Backspace") {

                        e.preventDefault();

                        this.backspace();
                    }

                    /* Escape */

                    if (key === "Escape") {

                        this.clear();
                    }

                    /* Theme Toggle */

                    if (key === "F2") {

                        e.preventDefault();

                        this.toggleTheme();
                    }

                    /* Clear */

                    if (key === "F10") {

                        e.preventDefault();

                        this.clear();
                    }

                    /* Ctrl + C */

                    if (
                        e.ctrlKey &&
                        key.toLowerCase() === "c"
                    ) {

                        navigator.clipboard.writeText(
                            this.currentOperand.textContent
                        );
                    }

                    /* Ctrl + L */

                    if (
                        e.ctrlKey &&
                        key.toLowerCase() === "l"
                    ) {

                        e.preventDefault();

                        this.clear();
                    }

                } catch (error) {

                    this.showError(
                        "Keyboard Error"
                    );

                    console.error(error);
                }
            }
        );
    }

    /* ==========================
       Main Input Handler
    ========================== */

    handleInput(key) {

        try {

            switch (key) {

                case "clear":
                    this.clear();
                    break;

                case "backspace":
                    this.backspace();
                    break;

                case "=":
                    this.calculate();
                    break;

                default:
                    this.append(key);
            }

        } catch (error) {

            this.showError(
                "Input Error"
            );

            console.error(error);
        }
    }

    /* ==========================
       Append Input
    ========================== */

    append(value) {

        if (
            this.expression.length > 100
        ) {

            this.showError(
                "Expression Too Large"
            );

            return;
        }

        const last =
            this.expression.slice(-1);

        /* Prevent double decimal */

        if (
            value === "." &&
            /\.\d*$/.test(
                this.getCurrentNumber()
            )
        ) {
            return;
        }

        /* Prevent duplicate operators */

        if (
            ["+", "-", "*", "/", "%"]
                .includes(value)
        ) {

            if (
                ["+", "-", "*", "/", "%"]
                    .includes(last)
            ) {

                this.expression =
                    this.expression.slice(0, -1);
            }
        }

        this.expression += value;

        this.updateDisplay();
    }

    /* ==========================
       Current Number
    ========================== */

    getCurrentNumber() {

        const parts =
            this.expression.split(
                /[\+\-\*\/\%\(\)]/
            );

        return parts[parts.length - 1];
    }

    /* ==========================
       Clear
    ========================== */

    clear() {

        this.expression = "";

        this.previousOperand.textContent =
            "";

        this.updateDisplay();
    }

    /* ==========================
       Backspace
    ========================== */

    backspace() {

        this.expression =
            this.expression.slice(0, -1);

        this.updateDisplay();
    }

    /* ==========================
       Calculate
    ========================== */

    calculate() {

        try {

            if (
                !this.expression.trim()
            ) return;

            const expression =
                this.expression
                    .replace(/÷/g, "/")
                    .replace(/×/g, "*");

            /* V1 Safe-ish Evaluation */

            const result =
                Function(
                    `"use strict";
                    return (${expression})`
                )();

            if (
                result === Infinity ||
                result === -Infinity
            ) {

                this.showError(
                    "Cannot divide by zero"
                );

                return;
            }

            if (
                Number.isNaN(result)
            ) {

                this.showError(
                    "Invalid Syntax"
                );

                return;
            }

            this.previousOperand.textContent =
                this.expression + " =";

            this.expression =
                this.formatResult(result);

            this.updateDisplay();

            this.animateResult();

        } catch (error) {

            this.showError(
                "Invalid Expression"
            );

            console.error(error);
        }
    }

    /* ==========================
       Scientific Notation
    ========================== */

    formatResult(value) {

        const str =
            String(value);

        if (
            str.length > this.maxDigits
        ) {

            return Number(value)
                .toExponential(8);
        }

        return str;
    }

    /* ==========================
       Display Update
    ========================== */

    updateDisplay() {

        this.currentOperand.textContent =
            this.expression || "0";

        this.scaleFont();
    }

    /* ==========================
       Font Scaling
    ========================== */

    scaleFont() {

        const len =
            this.currentOperand
                .textContent.length;

        let size = "4rem";

        if (len > 8)
            size = "3.2rem";

        if (len > 12)
            size = "2.6rem";

        if (len > 16)
            size = "2rem";

        this.currentOperand.style.fontSize =
            size;
    }

    /* ==========================
       Theme Toggle
    ========================== */

    bindThemeToggle() {

        this.themeToggle.addEventListener(
            "click",
            () => this.toggleTheme()
        );
    }

    toggleTheme() {

        const body =
            document.body;

        const theme =
            body.dataset.theme === "dark"
                ? "light"
                : "dark";

        body.dataset.theme = theme;

        localStorage.setItem(
            "horizon-theme",
            theme
        );

        this.themeToggle.textContent =
            theme === "dark"
                ? "🌙"
                : "☀️";
    }

    restoreTheme() {

        const savedTheme =
            localStorage.getItem(
                "horizon-theme"
            ) || "dark";

        document.body.dataset.theme =
            savedTheme;

        this.themeToggle.textContent =
            savedTheme === "dark"
                ? "🌙"
                : "☀️";
    }

    /* ==========================
       Result Animation
    ========================== */

    animateResult() {

        this.currentOperand.animate(
            [
                {
                    transform: "scale(1)"
                },
                {
                    transform: "scale(1.08)"
                },
                {
                    transform: "scale(1)"
                }
            ],
            {
                duration: 250,
                easing: "ease-out"
            }
        );
    }

    /* ==========================
       Error Handling
    ========================== */

    showError(message) {

        this.previousOperand.textContent =
            "Error";

        this.currentOperand.textContent =
            message;

        this.currentOperand.style.fontSize =
            "1.5rem";

        setTimeout(() => {

            this.expression = "";

            this.updateDisplay();

        }, 2000);
    }
}

/* ==========================================
   Enterprise Font Scaling + E Notation
========================================== */

(function () {

    const display =
        document.getElementById("currentOperand");

    if (!display) return;

    function getFontSize(length) {

        if (length <= 8) return "4rem";

        if (length <= 12) return "3.5rem";

        if (length <= 16) return "3rem";

        if (length <= 20) return "2.5rem";

        if (length <= 25) return "2rem";

        if (length <= 32) return "1.7rem";

        return "1.4rem";
    }

    function formatScientific(value) {

        const text = String(value);

        const digits =
            text.replace(/[^0-9]/g, "");

        if (digits.length > 16) {

            const number = Number(value);

            if (!Number.isNaN(number)) {

                return number.toExponential(12);
            }
        }

        return text;
    }

    function updateDisplayFormatting() {

        const currentText =
            display.textContent.trim();

        const formatted =
            formatScientific(currentText);

        if (formatted !== currentText) {

            display.textContent =
                formatted;
        }

        const length =
            display.textContent.length;

        display.style.fontSize =
            getFontSize(length);

        display.style.whiteSpace =
            "nowrap";

        display.style.overflow =
            "hidden";

        display.style.textOverflow =
            "clip";

        display.style.transition =
            "font-size .15s ease";

        if (
            display.textContent.includes("e+") ||
            display.textContent.includes("e-")
        ) {

            display.classList.add(
                "scientific-number"
            );

        } else {

            display.classList.remove(
                "scientific-number"
            );
        }
    }

    const observer =
        new MutationObserver(
            updateDisplayFormatting
        );

    observer.observe(display, {
        childList: true,
        characterData: true,
        subtree: true
    });

    updateDisplayFormatting();

})();

/* ==========================================
   Start App
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {

            new HorizonCalculator();

        } catch (error) {

            console.error(
                "Calculator Startup Failed",
                error
            );
        }
    }
);