document.addEventListener("DOMContentLoaded", () => {
    // Scroll animations using IntersectionObserver
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Accordion interaction for interactive ladder of participation
    const ladderHeaders = document.querySelectorAll(".ladder-header");
    ladderHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const step = header.parentElement;
            const isActive = step.classList.contains("active-step");
            
            // Toggle active class on clicked step
            if (isActive) {
                step.classList.remove("active-step");
            } else {
                // Remove active class from all other steps first
                document.querySelectorAll(".ladder-step").forEach(s => {
                    s.classList.remove("active-step");
                });
                step.classList.add("active-step");
            }
        });
    });

    // Tab switcher for Semillero stages
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.tab;
            
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove("active-tab"));
            tabContents.forEach(c => c.classList.remove("active-content"));
            
            // Add active classes
            btn.classList.add("active-tab");
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add("active-content");
            }
        });
    });
});
