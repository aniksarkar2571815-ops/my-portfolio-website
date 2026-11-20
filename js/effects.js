// ==========================================================
// Portfolio - effects.js
// Creative, code-themed animations:
//   1. Boot sequence      5. Glitch + scan photo (CSS)
//   2. Glyph network bg   6. Code typed line by line
//   3. Scroll reveal      7. Click burst, cursor glow, progress bar
//   4. 3D tilt windows    8. Interactive terminal
// Everything calms down when the visitor prefers reduced motion.
// ==========================================================
(function () {
    "use strict";

    var root = document.documentElement;
    var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var GLYPHS = "{}<>/;=()[]01#$%&*+";

    function $(sel, scope) { return (scope || document).querySelector(sel); }
    function $all(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }

    // ---------- text scramble (decode effect) ----------
    function scramble(el, chars, duration) {
        if (calm || !el) { return; }
        var finalText = el.getAttribute("data-final") || el.textContent;
        el.setAttribute("data-final", finalText);
        chars = chars || GLYPHS;
        duration = duration || 700;
        var start = performance.now();

        function frame(now) {
            var progress = Math.min((now - start) / duration, 1);
            var settled = Math.floor(progress * finalText.length);
            var text = "";
            for (var i = 0; i < finalText.length; i++) {
                if (i < settled || finalText[i] === " ") {
                    text += finalText[i];
                } else {
                    text += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            el.textContent = text;
            if (progress < 1) { requestAnimationFrame(frame); } else { el.textContent = finalText; }
        }
        requestAnimationFrame(frame);
    }


    // ---------- 1. Boot sequence ----------
    function runBoot(done) {
        var boot = $("#boot");
        var log = $("#boot-log");
        var fill = $("#boot-fill");
        if (!boot || !root.classList.contains("booting")) { done(); return; }

        try { sessionStorage.setItem("booted", "1"); } catch (e) {}

        var lines = [
            "> booting anik-portfolio v1.0",
            "> loading profile ................ [ OK ]",
            "> compiling skills ............... [ OK ]",
            "> mounting project: ai-internship  [ OK ]",
            "> verifying certificates (3) ..... [ OK ]",
            "> starting interface ............. [ OK ]",
            "> welcome, visitor."
        ];
        var shown = 0;
        var finished = false;

        function finish() {
            if (finished) { return; }
            finished = true;
            boot.classList.add("out");
            setTimeout(function () {
                root.classList.remove("booting");
                done();
            }, 450);
        }

        function next() {
            if (finished) { return; }
            if (shown < lines.length) {
                log.textContent += lines[shown] + "\n";
                shown++;
                fill.style.width = Math.round((shown / lines.length) * 100) + "%";
                setTimeout(next, 260);
            } else {
                setTimeout(finish, 350);
            }
        }
        next();

        boot.addEventListener("click", finish);
        window.addEventListener("keydown", finish, { once: true });
    }


    // ---------- 2. Glyph network background ----------
    var boost = 0;   // raised briefly by the "matrix" terminal command

    function startNetwork() {
        if (calm) { return; }
        var canvas = document.createElement("canvas");
        canvas.className = "fx-canvas";
        canvas.setAttribute("aria-hidden", "true");
        document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        var mouse = { x: -999, y: -999 };
        var particles = [];
        var colors = { green: "#ff5ca8", cyan: "#22d3ee" };

        function readColors() {
            var cs = getComputedStyle(root);
            colors.green = cs.getPropertyValue("--green").trim() || colors.green;
            colors.cyan = cs.getPropertyValue("--cyan").trim() || colors.cyan;
        }
        readColors();
        new MutationObserver(readColors).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

        function resize() {
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            canvas.style.width = w + "px"; canvas.style.height = h + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var count = w < 600 ? 26 : 58;
            particles = [];
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w, y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
                    ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
                    size: 11 + Math.random() * 9
                });
            }
        }
        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener("pointerleave", function () { mouse.x = -999; mouse.y = -999; });

        function draw() {
            ctx.clearRect(0, 0, w, h);
            var speed = 1 + boost * 5;
            var alpha = 0.22 + boost * 0.55;
            var i, j, p, q;

            for (i = 0; i < particles.length; i++) {
                p = particles[i];

                // gently pushed away from the pointer
                var dx = p.x - mouse.x, dy = p.y - mouse.y;
                var d2 = dx * dx + dy * dy;
                if (d2 < 16900 && d2 > 1) {
                    var d = Math.sqrt(d2), f = (130 - d) / 130;
                    p.vx += (dx / d) * f * 0.12;
                    p.vy += (dy / d) * f * 0.12;
                }
                p.vx *= 0.985; p.vy *= 0.985;
                p.x += (p.vx + (Math.random() - 0.5) * 0.02) * speed;
                p.y += (p.vy + 0.05) * speed;
                if (p.x < -20) { p.x = w + 20; } else if (p.x > w + 20) { p.x = -20; }
                if (p.y > h + 20) { p.y = -20; p.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }
                else if (p.y < -20) { p.y = h + 20; }
            }

            // lines between close glyphs
            ctx.lineWidth = 1;
            for (i = 0; i < particles.length; i++) {
                for (j = i + 1; j < particles.length; j++) {
                    p = particles[i]; q = particles[j];
                    var ex = p.x - q.x, ey = p.y - q.y, dist = ex * ex + ey * ey;
                    if (dist < 14400) {
                        ctx.globalAlpha = (1 - dist / 14400) * (0.16 + boost * 0.4);
                        ctx.strokeStyle = colors.green;
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                    }
                }
            }

            // the glyphs
            ctx.fillStyle = colors.cyan;
            ctx.globalAlpha = alpha;
            for (i = 0; i < particles.length; i++) {
                p = particles[i];
                ctx.font = p.size + "px 'JetBrains Mono', monospace";
                ctx.fillText(p.ch, p.x, p.y);
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }

    function pulseBoost() {
        boost = 1;
        var start = performance.now();
        function fade(now) {
            var t = (now - start) / 5000;
            boost = Math.max(0, 1 - t);
            if (boost > 0) { requestAnimationFrame(fade); }
        }
        setTimeout(function () { requestAnimationFrame(fade); }, 1500);
    }


    // ---------- 3. Scroll reveal (+ scramble headings, count stats) ----------
    function startReveal() {
        var targets = $all(".label, h2, .win, .card, .tabs, .steps li, .prose, .shell-title");

        // staggered delay by position among siblings
        targets.forEach(function (el) {
            var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
            var index = Math.max(0, siblings.indexOf(el));
            el.style.setProperty("--d", Math.min(index, 5) * 0.09 + "s");
            el.classList.add("reveal");
        });

        function show(el) {
            el.classList.add("in");
            setTimeout(function () { el.classList.add("done"); }, 1100);
            if (el.tagName === "H2") { scramble(el, GLYPHS, 650); }
            if (el.classList.contains("stats")) {
                $all("strong", el).forEach(function (n) {
                    if (/^\d+$/.test(n.textContent)) { scramble(n, "0123456789", 900); }
                });
            }
            if (el.classList.contains("code")) { typeCode(el); }
        }

        if (calm || !("IntersectionObserver" in window)) {
            targets.forEach(function (el) { el.classList.add("in", "done"); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    show(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

        targets.forEach(function (el) { io.observe(el); });
    }


    // ---------- 6. Code block typed line by line ----------
    var codePrepared = false;
    function prepareCode() {
        var code = $(".code code");
        if (!code || calm || codePrepared) { return; }
        codePrepared = true;
        var lines = code.innerHTML.split("\n");
        code.innerHTML = lines.map(function (l) { return '<span class="ln">' + l + "</span>"; }).join("\n");
    }
    function typeCode(block) {
        if (calm) { return; }
        $all(".ln", block).forEach(function (line, i) {
            setTimeout(function () { line.classList.add("on"); }, 250 + i * 170);
        });
    }


    // ---------- 4. 3D tilt + glare on windows and cards ----------
    function startTilt() {
        if (calm || !finePointer) { return; }
        $all(".win, .card").forEach(function (el) {
            if (el.matches("form, .shell, .project") || el.closest("form")) { return; }
            el.addEventListener("pointermove", function (e) {
                var r = el.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width;
                var py = (e.clientY - r.top) / r.height;
                el.style.setProperty("--ry", ((px - 0.5) * 8).toFixed(2) + "deg");
                el.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg");
                el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
                el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
            });
            el.addEventListener("pointerleave", function () {
                el.style.setProperty("--rx", "0deg");
                el.style.setProperty("--ry", "0deg");
            });
        });
    }


    // ---------- 7. Progress bar, cursor glow, click burst ----------
    function startExtras() {
        var bar = document.createElement("div");
        bar.className = "fx-bar";
        bar.setAttribute("aria-hidden", "true");
        document.body.appendChild(bar);

        function updateBar() {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var p = max > 0 ? window.scrollY / max : 0;
            bar.style.transform = "scaleX(" + Math.min(Math.max(p, 0), 1) + ")";
        }
        window.addEventListener("scroll", updateBar, { passive: true });
        updateBar();

        if (calm) { return; }

        if (finePointer) {
            var glow = document.createElement("div");
            glow.className = "fx-glow";
            glow.setAttribute("aria-hidden", "true");
            document.body.appendChild(glow);
            var gx = 0, gy = 0, tx = 0, ty = 0;
            window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; });
            (function follow() {
                gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
                glow.style.transform = "translate(" + (gx - 180) + "px," + (gy - 180) + "px)";
                requestAnimationFrame(follow);
            })();
        }

        // click: little burst of code characters
        document.addEventListener("click", function (e) {
            if (!e.target.closest || e.target.closest("dialog, input, textarea")) { return; }
            for (var i = 0; i < 9; i++) {
                var s = document.createElement("span");
                s.className = "fx-burst";
                s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                s.style.left = e.clientX + "px";
                s.style.top = e.clientY + "px";
                document.body.appendChild(s);
                var angle = (Math.PI * 2 * i) / 9 + Math.random() * 0.5;
                var dist = 40 + Math.random() * 50;
                var anim = s.animate([
                    { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
                    { transform: "translate(calc(-50% + " + Math.cos(angle) * dist + "px), calc(-50% + " + Math.sin(angle) * dist + "px)) scale(0.4)", opacity: 0 }
                ], { duration: 650 + Math.random() * 250, easing: "cubic-bezier(.2,.8,.3,1)" });
                anim.onfinish = (function (node) { return function () { node.remove(); }; })(s);
            }
        });
    }


    // ---------- 8. Interactive terminal ----------
    function startShell() {
        var out = $("#shell-out");
        var form = $("#shell-form");
        var input = $("#shell-in");
        if (!out || !form || !input) { return; }

        var GITHUB = "https://github.com/aniksarkar2571815-ops";
        var LINKEDIN = "https://www.linkedin.com/in/anik-sarkar-44a0943b1/";
        var FACEBOOK = "https://www.facebook.com/share/19Bik6agmG/?mibextid=wwXIfr";
        var CV = "https://drive.google.com/file/d/1YyKf83YKSpC0LuVSrxwxlMHvFMIq4taV/view?usp=sharing";
        var REPORT = "https://docs.google.com/document/d/1syWJ7Z28q0Y_tYYw5zMAXo09c0L5TUGS/edit?usp=sharing&ouid=106652027343193547397&rtpof=true&sd=true";

        var history = [];
        var pos = 0;

        // a line is a string, or {text, href}
        function print(lines, cls) {
            lines.forEach(function (line) {
                var row = document.createElement("div");
                row.className = "l" + (cls ? " " + cls : "");
                if (typeof line === "string") {
                    row.textContent = line;
                } else {
                    var a = document.createElement("a");
                    a.textContent = line.text;
                    a.href = line.href;
                    a.target = "_blank";
                    a.rel = "noopener";
                    row.appendChild(a);
                }
                out.appendChild(row);
            });
            out.scrollTop = out.scrollHeight;
        }

        var commands = {
            help: function () {
                return [
                    "Available commands:",
                    "  about     who I am",
                    "  skills    what I work with",
                    "  project   my AI project",
                    "  certs     my certificates",
                    "  contact   email and phone",
                    "  links     GitHub, LinkedIn, Facebook",
                    "  cv        open my CV",
                    "  theme     switch light / dark",
                    "  matrix    wake up, Neo...",
                    "  clear     clear the screen"
                ];
            },
            about: function () {
                return [
                    "Anik Sarker, undergraduate Software Engineering student.",
                    "Passionate about software development and Artificial Intelligence.",
                    "Goal: become a skilled Software Engineer."
                ];
            },
            whoami: function () { return ["anik"]; },
            ls: function () { return ["about.txt   skills.sh   project/   certificates/   contact.md"]; },
            skills: function () {
                return [
                    "core        : Programming, Problem solving, Software development",
                    "foundations : Discrete mathematics, Computer architecture",
                    "exploring   : Artificial Intelligence, new technologies"
                ];
            },
            project: function () {
                return [
                    "AI Based Internship and Job Recommendation",
                    "Suggests suitable internships and jobs to students",
                    "based on their skills, interests and goals.",
                    { text: "> open report", href: REPORT },
                    { text: "> open github", href: GITHUB }
                ];
            },
            certs: function () {
                return [
                    "1. Introduction to Discrete Mathematics - Wolfram U (Apr 2026)",
                    "2. CS301: Computer Architecture - Saylor University (Apr 2026)",
                    "3. Day Long Seminar on Career Planning Roadmap - DIU (Apr 2026)"
                ];
            },
            contact: function () {
                return ["email : aniksarkar2571815@gmail.com", "phone : 01998592940"];
            },
            links: function () {
                return [{ text: "> GitHub", href: GITHUB }, { text: "> LinkedIn", href: LINKEDIN }, { text: "> Facebook", href: FACEBOOK }];
            },
            cv: function () {
                return ["Here is my CV:", { text: "> open cv", href: CV }];
            },
            theme: function () {
                $("#theme").click();
                return ["theme switched."];
            },
            matrix: function () {
                pulseBoost();
                return ["Follow the white rabbit... (look at the background)"];
            },
            date: function () { return [new Date().toString()]; },
            clear: function () { out.textContent = ""; return []; }
        };

        function run(raw) {
            var cmd = raw.trim();
            if (!cmd) { return; }
            print(["$ " + cmd], "cmd");
            var name = cmd.toLowerCase().split(/\s+/)[0];

            if (name === "sudo") {
                print(["anik is not in the sudoers file. This incident will be reported. (just kidding)"]);
            } else if (name === "rm") {
                print(["nice try. this portfolio is read-only."]);
            } else if (commands.hasOwnProperty(name)) {
                print(commands[name]());
            } else {
                print(["command not found: " + name + ". Type 'help' to see what I know."], "err");
            }
        }

        print(["Welcome! Type a command (try 'help') or tap one below."], "dim");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var value = input.value;
            if (value.trim()) { history.push(value); pos = history.length; }
            run(value);
            input.value = "";
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "ArrowUp" && history.length) {
                pos = Math.max(0, pos - 1);
                input.value = history[pos];
                e.preventDefault();
            } else if (e.key === "ArrowDown" && history.length) {
                pos = Math.min(history.length, pos + 1);
                input.value = history[pos] || "";
                e.preventDefault();
            }
        });

        $all(".quick button").forEach(function (b) {
            b.addEventListener("click", function () { run(b.getAttribute("data-cmd")); });
        });
    }


    // ---------- start everything ----------
    prepareCode();
    startShell();
    startNetwork();
    startExtras();
    startTilt();

    runBoot(function () {
        startReveal();
        scramble($("h1"), GLYPHS, 900);
    });
})();
