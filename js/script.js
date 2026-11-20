// ==========================================================
// Portfolio - script.js
// Same behaviour as the original file, rewritten in a simple
// style: var, normal functions, for loops, getElementById.
// ==========================================================


// Tell the CSS that JavaScript is running (used by the reveal animation)
document.documentElement.classList.add("js");


// ---------- 1. Show the current year in the footer ----------
var yearBox = document.getElementById("year");
yearBox.textContent = new Date().getFullYear();


// ---------- 2. Light / Dark theme ----------
var root = document.documentElement;                 // the <html> tag
var themeLabel = document.getElementById("theme-label");
var themeButton = document.getElementById("theme");

// Switch to "light" or "dark" and remember the choice
function setTheme(theme) {
    root.setAttribute("data-theme", theme);

    // the button shows the theme you can switch TO
    if (theme === "dark") {
        themeLabel.textContent = "Light";
    } else {
        themeLabel.textContent = "Dark";
    }

    // save it in the browser (try/catch in case saving is blocked)
    try {
        localStorage.setItem("theme", theme);
    } catch (error) {
        // do nothing
    }
}

// Look for a saved theme from the last visit
var savedTheme = null;
try {
    savedTheme = localStorage.getItem("theme");
} catch (error) {
    savedTheme = null;
}

// Dark (code editor) is the default. Only a saved choice changes it.
if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
}

// Clicking the button flips the theme
themeButton.addEventListener("click", function () {
    if (root.getAttribute("data-theme") === "dark") {
        setTheme("light");
    } else {
        setTheme("dark");
    }
});


// ---------- 3. Highlight the bottom menu link while scrolling ----------
var dockLinks = document.querySelectorAll(".dock a");
var sections = document.querySelectorAll("main section[id]");

function updateDock() {
    var viewHeight = window.innerHeight;
    var bandTop = viewHeight * 0.40;      // a thin band around the
    var bandBottom = viewHeight * 0.45;   // middle of the screen

    for (var i = 0; i < sections.length; i++) {
        var box = sections[i].getBoundingClientRect();

        // is this section crossing the band?
        if (box.top <= bandBottom && box.bottom >= bandTop) {
            for (var j = 0; j < dockLinks.length; j++) {
                if (dockLinks[j].hash === "#" + sections[i].id) {
                    dockLinks[j].classList.add("on");
                } else {
                    dockLinks[j].classList.remove("on");
                }
            }
        }
    }
}

window.addEventListener("scroll", updateDock);
updateDock();   // run once when the page opens


// ---------- 4. Tabs ----------
var tabs = document.querySelectorAll('[role="tab"]');

// Show one tab and hide the others
function openTab(chosenTab) {
    for (var i = 0; i < tabs.length; i++) {
        var panel = document.getElementById(tabs[i].getAttribute("aria-controls"));

        if (tabs[i] === chosenTab) {
            tabs[i].setAttribute("aria-selected", "true");
            tabs[i].tabIndex = 0;
            panel.hidden = false;
        } else {
            tabs[i].setAttribute("aria-selected", "false");
            tabs[i].tabIndex = -1;
            panel.hidden = true;
        }
    }
    chosenTab.focus();
}

// Add the click and arrow-key events to one tab.
// (It is a separate function so every tab remembers its own number.)
function setupTab(tab, number) {
    tab.addEventListener("click", function () {
        openTab(tab);
    });

    tab.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
            openTab(tabs[(number + 1) % tabs.length]);
        }
        if (event.key === "ArrowLeft") {
            openTab(tabs[(number - 1 + tabs.length) % tabs.length]);
        }
    });
}

for (var t = 0; t < tabs.length; t++) {
    setupTab(tabs[t], t);
}


// ---------- 5. Small message ("toast") ----------
var toast = document.getElementById("toast");

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    // hide it again after 1.8 seconds
    setTimeout(function () {
        toast.classList.remove("show");
    }, 1800);
}


// ---------- 6. Copy buttons (email / phone) ----------
var copyButtons = document.querySelectorAll(".copy");

function setupCopyButton(button) {
    button.addEventListener("click", function () {
        var text = button.getAttribute("data-copy");

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function () {
                showToast("Copied: " + text);
            }).catch(function () {
                showToast("Press and hold to copy it");
            });
        } else {
            showToast("Press and hold to copy it");
        }
    });
}

for (var c = 0; c < copyButtons.length; c++) {
    setupCopyButton(copyButtons[c]);
}


// ---------- 7. Certificate pop-up ----------
var viewer = document.getElementById("viewer");
var viewerImage = document.getElementById("viewer-img");
var certButtons = document.querySelectorAll(".cert-open");

function setupCertButton(button) {
    button.addEventListener("click", function () {
        // if the big image is missing, show the placeholder instead
        viewerImage.onerror = function () {
            viewerImage.onerror = null;
            viewerImage.src = "images/placeholder.svg";
        };

        viewerImage.src = button.getAttribute("data-full");
        viewer.showModal();
    });
}

for (var k = 0; k < certButtons.length; k++) {
    setupCertButton(certButtons[k]);
}

// clicking the dark area outside the picture closes the pop-up
viewer.addEventListener("click", function (event) {
    if (event.target === viewer) {
        viewer.close();
    }
});


// ---------- 8. Contact form (opens the user's email app) ----------
var contactForm = document.getElementById("contact-form");

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();   // stop the normal form sending

    var name = contactForm.elements["name"].value;
    var email = contactForm.elements["email"].value;
    var message = contactForm.elements["message"].value;

    // take the address from the mail link on the page
    var mailLink = document.getElementById("mail");
    var to = mailLink.getAttribute("href").replace("mailto:", "");

    var subject = encodeURIComponent("Portfolio message from " + name);
    var body = encodeURIComponent(message + "\n\n" + name + " (" + email + ")");

    window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
});


// ---------- 9. Typing effect for the role line ----------
var typed = document.getElementById("typed");
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (typed && !reduceMotion) {
    var words = typed.getAttribute("data-words").split("|");
    var wordIndex = 0;
    var charIndex = words[0].length;   // start with the first word already shown
    var deleting = true;

    function typeStep() {
        var word = words[wordIndex];
        var delay = 90;

        if (deleting) {
            charIndex--;
            delay = 45;
            if (charIndex <= 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                delay = 350;
            }
        } else {
            charIndex++;
            if (charIndex >= word.length) {
                deleting = true;
                delay = 1800;   // pause on the full word
            }
        }
        typed.textContent = words[wordIndex].slice(0, Math.max(charIndex, 0));
        if (deleting && charIndex === words[wordIndex].length) {
            typed.textContent = words[wordIndex];
        }
        setTimeout(typeStep, delay);
    }
    setTimeout(typeStep, 2200);
}



// ---------- 10. Reveal sections as you scroll (staggered) ----------
var revealTargets = document.querySelectorAll(
    "main section:not(#home) .label, main section:not(#home) h2, " +
    "main section:not(#home) .prose, main section:not(#home) .win, " +
    "main section:not(#home) .tabs, main section:not(#home) .steps li, " +
    "main section:not(#home) .card"
);

if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
        for (var r = 0; r < entries.length; r++) {
            if (entries[r].isIntersecting) {
                entries[r].target.classList.add("in");
                revealObserver.unobserve(entries[r].target);
            }
        }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    for (var q = 0; q < revealTargets.length; q++) {
        var el = revealTargets[q];
        // stagger siblings: 0s, 0.09s, 0.18s ... (max 0.4s)
        var index = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.setProperty("--d", Math.min(index * 0.09, 0.4) + "s");
        el.classList.add("reveal");
        revealObserver.observe(el);
    }
}
