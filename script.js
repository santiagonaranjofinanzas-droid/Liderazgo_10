document.addEventListener("DOMContentLoaded", () => {
    const dashboard = document.getElementById("dashboard");
    const tabButtons = document.querySelectorAll(".selector-btn");
    const containers = document.querySelectorAll(".mentefacto-container");
    const svgLayer = document.getElementById("svg-layer");
    
    // SVG Paths
    const lineSupra = document.getElementById("line-supra");
    const lineIso = document.getElementById("line-iso");
    const lineExclusiones = document.getElementById("line-exclusiones");
    const lineInfra = document.getElementById("line-infra");

    // Drawer Elements
    const infoDrawer = document.getElementById("info-drawer");
    const drawerOverlay = document.getElementById("drawer-overlay");
    const drawerClose = document.getElementById("drawer-close");
    const drawerTag = document.getElementById("drawer-tag");
    const drawerTitle = document.getElementById("drawer-title");
    const drawerDescription = document.getElementById("drawer-description");
    const drawerMeta = document.getElementById("drawer-meta-text");

    let activeTheme = "liderazgo";

    // 1. DYNAMIC SVG LINES DRAWING
    function calculatePaths() {
        // Only draw lines on larger screens where grid layout is active
        if (window.innerWidth <= 1200) {
            svgLayer.style.display = "none";
            return;
        }
        svgLayer.style.display = "block";

        const activeContainer = document.querySelector(".mentefacto-container.active-container");
        if (!activeContainer) return;

        const centralNode = activeContainer.querySelector(".node-central");
        const supraNode = activeContainer.querySelector(".node-supra");
        const isoNode = activeContainer.querySelector(".node-iso");
        const exclNode = activeContainer.querySelector(".node-exclusiones");
        const infraNode = activeContainer.querySelector(".node-infra");

        if (!centralNode || !supraNode || !isoNode || !exclNode || !infraNode) return;

        const dRect = dashboard.getBoundingClientRect();
        
        const getRelativePoints = (el) => {
            const r = el.getBoundingClientRect();
            return {
                top: r.top - dRect.top,
                bottom: r.bottom - dRect.top,
                left: r.left - dRect.left,
                right: r.right - dRect.left,
                width: r.width,
                height: r.height,
                cx: (r.left - dRect.left) + r.width / 2,
                cy: (r.top - dRect.top) + r.height / 2
            };
        };

        const c = getRelativePoints(centralNode);
        const s = getRelativePoints(supraNode);
        const i = getRelativePoints(isoNode);
        const e = getRelativePoints(exclNode);
        const inf = getRelativePoints(infraNode);

        // Path definitions: smooth bezier curves connecting node edges
        
        // 1. Central (Top) -> Supra (Bottom)
        // Vertical connection
        const ptSupra = `M ${c.cx},${c.top} C ${c.cx},${(c.top + s.bottom)/2} ${s.cx},${(c.top + s.bottom)/2} ${s.cx},${s.bottom}`;
        lineSupra.setAttribute("d", ptSupra);

        // 2. Central (Left) -> Iso (Right)
        // Horizontal connection
        const ptIso = `M ${c.left},${c.cy} C ${(c.left + i.right)/2},${c.cy} ${(c.left + i.right)/2},${i.cy} ${i.right},${i.cy}`;
        lineIso.setAttribute("d", ptIso);

        // 3. Central (Right) -> Exclusiones (Left)
        // Horizontal connection
        const ptExcl = `M ${c.right},${c.cy} C ${(c.right + e.left)/2},${c.cy} ${(c.right + e.left)/2},${e.cy} ${e.left},${e.cy}`;
        lineExclusiones.setAttribute("d", ptExcl);

        // 4. Central (Bottom) -> Infra (Top)
        // Vertical connection
        const ptInfra = `M ${c.cx},${c.bottom} C ${c.cx},${(c.bottom + inf.top)/2} ${inf.cx},${(c.bottom + inf.top)/2} ${inf.cx},${inf.top}`;
        lineInfra.setAttribute("d", ptInfra);
    }

    // 2. HIGHLIGHT PATHS ON HOVER
    function setupHoverEffects() {
        const activeContainer = document.querySelector(".mentefacto-container.active-container");
        if (!activeContainer) return;

        const nodes = {
            supra: { node: activeContainer.querySelector(".node-supra"), line: lineSupra },
            iso: { node: activeContainer.querySelector(".node-iso"), line: lineIso },
            exclusiones: { node: activeContainer.querySelector(".node-exclusiones"), line: lineExclusiones },
            infra: { node: activeContainer.querySelector(".node-infra"), line: lineInfra }
        };

        Object.keys(nodes).forEach(key => {
            const item = nodes[key];
            if (!item.node || !item.line) return;

            // Remove previous event listeners by cloning nodes (cleans up state between tab switches)
            const clonedNode = item.node.cloneNode(true);
            item.node.parentNode.replaceChild(clonedNode, item.node);
            
            // Re-assign the reference
            const freshNode = clonedNode;
            
            freshNode.addEventListener("mouseenter", () => {
                item.line.classList.add("active-path");
            });

            freshNode.addEventListener("mouseleave", () => {
                // Keep highlighted if it's the current selected one, otherwise remove
                item.line.classList.remove("active-path");
            });

            // Re-bind click event to the fresh node
            freshNode.addEventListener("click", (e) => {
                // Prevent trigger when clicking sub-cards inside
                if (e.target.closest(".infra-item") || e.target.closest(".function-card") || e.target.closest(".aspect-card") || e.target.closest(".roadmap-step") || e.target.closest(".lewin-step") || e.target.closest(".resistance-item")) {
                    return;
                }
                openDrawer(freshNode);
            });
        });
    }

    // 3. DRAWER MANAGEMENT
    function openDrawer(element) {
        const tag = element.getAttribute("data-tag") || "Tema";
        const title = element.getAttribute("data-title") || "Título";
        const meta = element.getAttribute("data-meta") || "";
        const text = element.getAttribute("data-text") || "";

        // Fill data
        drawerTag.textContent = tag;
        drawerTag.className = `drawer-tag drawer-tag-${activeTheme}`;
        
        drawerTitle.textContent = title;
        drawerDescription.textContent = text;
        drawerMeta.textContent = meta;

        // Open Drawer
        infoDrawer.classList.add("open");
        drawerOverlay.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    function closeDrawer() {
        infoDrawer.classList.remove("open");
        drawerOverlay.classList.remove("open");
        document.body.style.overflow = "";
    }

    drawerClose.addEventListener("click", closeDrawer);
    drawerOverlay.addEventListener("click", closeDrawer);

    // Keyboard ESC to close drawer
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeDrawer();
        }
    });

    // 4. SUB-NODE CLICK LISTENERS (Infraordinados detailed items)
    function setupSubNodes() {
        // Detailed elements inside Infraordinados and Isoordinados
        const selectors = [
            ".infra-item",
            ".function-card",
            ".aspect-card",
            ".roadmap-step",
            ".lewin-step",
            ".resistance-item"
        ];

        selectors.forEach(selector => {
            const subNodes = document.querySelectorAll(selector);
            subNodes.forEach(sub => {
                sub.addEventListener("click", (e) => {
                    e.stopPropagation(); // Avoid triggering parent node click
                    
                    const title = sub.getAttribute("data-title") || sub.querySelector("strong")?.textContent || sub.textContent.trim();
                    const text = sub.getAttribute("data-text") || "";
                    
                    let category = "Elemento";
                    if (selector === ".function-card") category = "Función";
                    if (selector === ".aspect-card") category = "Aspecto Clave";
                    if (selector === ".roadmap-step") category = "Fase del Proceso";
                    if (selector === ".lewin-step") category = "Etapa Modelo de Lewin";
                    if (selector === ".resistance-item") category = "Estrategia de Cambio";

                    const dummyNode = document.createElement("div");
                    dummyNode.setAttribute("data-tag", category);
                    dummyNode.setAttribute("data-title", title);
                    dummyNode.setAttribute("data-meta", `Componente detallado del mapa interactivo de ${activeTheme === "liderazgo" ? "Liderazgo Estratégico" : activeTheme === "proceso" ? "Proceso Administrativo" : "Gestión del Cambio"}.`);
                    dummyNode.setAttribute("data-text", text);

                    openDrawer(dummyNode);
                });
            });
        });

        // Setup Central Node Click separately
        const centralNodes = document.querySelectorAll(".node-central");
        centralNodes.forEach(cNode => {
            cNode.addEventListener("click", () => {
                openDrawer(cNode);
            });
        });

        // Setup Nota Node Click separately
        const notaNodes = document.querySelectorAll(".node-nota");
        notaNodes.forEach(nNode => {
            nNode.addEventListener("click", () => {
                openDrawer(nNode);
            });
        });
    }

    // 5. TAB SWITCHING LOGIC
    function switchTab(tabId, theme) {
        // Set active tab buttons
        tabButtons.forEach(btn => {
            if (btn.getAttribute("data-tab") === tabId) {
                btn.classList.add("active-tab");
                btn.setAttribute("aria-selected", "true");
            } else {
                btn.classList.remove("active-tab");
                btn.setAttribute("aria-selected", "false");
            }
        });

        // Set active container
        containers.forEach(container => {
            if (container.id === tabId) {
                container.classList.add("active-container");
            } else {
                container.classList.remove("active-container");
            }
        });

        // Set Dashboard Theme Class
        dashboard.className = `map-dashboard theme-${theme}`;
        activeTheme = theme;

        // Update SVG line classes
        svgLayer.className.baseVal = `svg-connectors active-${theme}`;
        lineSupra.className.baseVal = `connection-line active-path active-${theme}`;
        lineIso.className.baseVal = `connection-line active-path active-${theme}`;
        lineExclusiones.className.baseVal = `connection-line active-path active-${theme}`;
        lineInfra.className.baseVal = `connection-line active-path active-${theme}`;

        // Reset paths and bind fresh event listeners to newly active nodes
        setTimeout(() => {
            calculatePaths();
            setupHoverEffects();
        }, 50);
    }

    // Tab Button Clicks
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab");
            const theme = button.getAttribute("data-theme");
            switchTab(tabId, theme);
        });
    });

    // 6. DEEP LINKING (URL hash or Query param check)
    function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get("tab");
        
        if (tabParam === "liderazgo") {
            switchTab("mentefacto-liderazgo", "liderazgo");
        } else if (tabParam === "proceso") {
            switchTab("mentefacto-proceso", "proceso");
        } else if (tabParam === "cambio") {
            switchTab("mentefacto-cambio", "cambio");
        } else {
            // Default setup
            switchTab("mentefacto-liderazgo", "liderazgo");
        }
    }

    // 7. INITIALIZE AND EVENT LISTENERS
    checkUrlParams();
    setupSubNodes();

    // Recalculate paths on resize
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            calculatePaths();
        }, 100);
    });


    // Scroll animation for index.html compatibility
    const faders = document.querySelectorAll('.fade-in');
    if (faders.length > 0) {
        const appearOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };
        const appearOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, appearOptions);
        faders.forEach(fader => appearOnScroll.observe(fader));
    }
});
