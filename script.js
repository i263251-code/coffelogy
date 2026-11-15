// Shared interactive features for all Coffelogy pages

document.addEventListener("DOMContentLoaded", function () {
    // Mobile navigation
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");
    if (menuToggle && nav) {
        menuToggle.addEventListener("click", function () {
            nav.classList.toggle("nav-open");
            menuToggle.setAttribute("aria-expanded", nav.classList.contains("nav-open"));
        });
    }

    // Remember the selected colour theme
    const themeButtons = document.querySelectorAll(".theme-toggle");
    if (localStorage.getItem("coffelogy-theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
    themeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
            localStorage.setItem("coffelogy-theme", theme);
        });
    });

    // Shopping cart shared between pages
    let cart = JSON.parse(localStorage.getItem("coffelogy-cart") || "[]");
    function saveCart() {
        localStorage.setItem("coffelogy-cart", JSON.stringify(cart));
        updateCart();
    }
    function updateCart() {
        document.querySelectorAll(".cart-count").forEach(function (badge) {
            badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        });
        const cartItems = document.getElementById("cart-items");
        const totalBox = document.getElementById("cart-total");
        if (!cartItems || !totalBox) return;
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your order is empty. Add something from the menu!</p>';
        } else {
            cartItems.innerHTML = "";
            cart.forEach(function (item, index) {
                const row = document.createElement("div");
                row.className = "cart-row";
                const name = document.createElement("span");
                name.textContent = item.name + " × " + item.quantity;
                const price = document.createElement("strong");
                price.textContent = "Rs. " + (item.price * item.quantity);
                const remove = document.createElement("button");
                remove.className = "remove-item";
                remove.textContent = "Remove";
                remove.addEventListener("click", function () {
                    cart.splice(index, 1);
                    saveCart();
                });
                row.append(name, price, remove);
                cartItems.appendChild(row);
            });
        }
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        totalBox.textContent = "Rs. " + total;
    }
    document.querySelectorAll(".add-button").forEach(function (button) {
        button.addEventListener("click", function () {
            const name = button.dataset.name;
            const price = Number(button.dataset.price);
            const existing = cart.find(item => item.name === name);
            if (existing) existing.quantity++;
            else cart.push({ name: name, price: price, quantity: 1 });
            saveCart();
            const oldText = button.textContent;
            button.textContent = "Added ✓";
            setTimeout(() => button.textContent = oldText, 900);
        });
    });
    const clearCart = document.getElementById("clear-cart");
    if (clearCart) clearCart.addEventListener("click", function () { cart = []; saveCart(); });
    updateCart();

    // Menu search and category filters
    const search = document.getElementById("menu-search");
    const filterButtons = document.querySelectorAll(".filter-button");
    let activeFilter = "all";
    function filterMenu() {
        const term = search ? search.value.toLowerCase().trim() : "";
        document.querySelectorAll(".menu-card").forEach(function (card) {
            const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
            const matchesSearch = card.dataset.name.includes(term);
            card.classList.toggle("hidden", !(matchesCategory && matchesSearch));
        });
    }
    if (search) search.addEventListener("input", filterMenu);
    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            activeFilter = button.dataset.filter;
            filterMenu();
        });
    });

    // Three-step coffee quiz
    const questions = document.querySelectorAll(".quiz-question");
    if (questions.length) {
        let step = 1;
        const answers = {};
        const next = document.getElementById("quiz-next");
        const back = document.getElementById("quiz-back");
        const result = document.getElementById("quiz-result");
        const progressText = document.getElementById("quiz-progress-text");
        const progressBar = document.getElementById("quiz-progress-bar");
        function showStep() {
            questions.forEach(q => q.classList.toggle("active", Number(q.dataset.step) === step));
            progressText.textContent = "QUESTION " + step + " OF 3";
            progressBar.style.width = (step / 3 * 100) + "%";
            back.disabled = step === 1;
            next.disabled = !answers[questions[step - 1].querySelector(".choice-button").dataset.group];
            next.textContent = step === 3 ? "Show my coffee ↗" : "Next question →";
        }
        document.querySelectorAll(".choice-button").forEach(function (button) {
            button.addEventListener("click", function () {
                const group = button.dataset.group;
                answers[group] = button.dataset.value;
                document.querySelectorAll('.choice-button[data-group="' + group + '"]').forEach(b => b.classList.remove("chosen"));
                button.classList.add("chosen");
                next.disabled = false;
            });
        });
        back.addEventListener("click", function () { if (step > 1) { step--; showStep(); } });
        next.addEventListener("click", function () {
            if (step < 3) { step++; showStep(); }
            else {
                let name = "Cappuccino", description = "A smooth, balanced coffee with steamed milk and a soft layer of foam.", icon = "☕";
                if (answers.flavour === "chocolate") { name = "Mocha"; description = "A comforting mix of coffee and chocolate. A lovely choice when you want something sweet."; icon = "🍫"; }
                else if (answers.style === "iced" || answers.flavour === "fresh") { name = "Iced Latte"; description = "A cool and refreshing coffee with milk, served over ice."; icon = "🧊"; }
                else if (answers.strength === "strong" && answers.style === "black") { name = "Espresso"; description = "A bold, rich coffee for people who enjoy a strong classic taste."; icon = "☕"; }
                else if (answers.style === "black") { name = "Americano"; description = "A smooth black coffee with a clean, classic flavour."; icon = "☕"; }
                document.getElementById("result-name").textContent = name;
                document.getElementById("result-description").textContent = description;
                document.getElementById("result-icon").textContent = icon;
                result.classList.remove("hidden");
                document.querySelector(".quiz-layout").classList.add("hidden");
                result.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
        document.getElementById("quiz-restart").addEventListener("click", function () {
            Object.keys(answers).forEach(key => delete answers[key]);
            document.querySelectorAll(".choice-button").forEach(b => b.classList.remove("chosen"));
            step = 1;
            result.classList.add("hidden");
            document.querySelector(".quiz-layout").classList.remove("hidden");
            showStep();
        });
        showStep();
    }

    // Contact form is a front-end demo; it does not send data anywhere
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            document.getElementById("form-message").textContent = "Thanks! Your message has been recorded for this demo.";
            contactForm.reset();
        });
    }
});
