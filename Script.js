// --- 1. BACKGROUND CANVAS HD TRAFFIC MONITOR (Fixed Timing Outside Document Ready) ---
const canvas = document.getElementById("animation-canvas");
const context = canvas ? canvas.getContext("2d") : null;

const totalFrames = 269; 
const currentFrame = index => `ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
const dpr = window.devicePixelRatio || 1;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    render();
}

const images = [];
const airbnbFrames = { frame: 0 };

for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
}

// Check if first image is already cached or loaded
if(images[0]) {
    if (images[0].complete) {
        resizeCanvas();
    } else {
        images[0].onload = resizeCanvas;
    }
}

function render() {
    if (!context || !canvas) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const img = images[airbnbFrames.frame];
    if (!img) return; 
    
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio  = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;  
    
    context.drawImage(img, 0, 0, img.width, img.height, 
                           centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

// --- 2. SMOOTH INERTIA SCROLL INTERFACE ---
let targetFrame = 0;
let interpolatedFrame = 0;
const easeAmount = 0.08; 

window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScrollTop <= 0) return; 
    const scrollFraction = scrollTop / maxScrollTop;
    targetFrame = Math.min(totalFrames - 1, Math.floor(scrollFraction * totalFrames));
});

function smoothScrollLoop() {
    interpolatedFrame += (targetFrame - interpolatedFrame) * easeAmount;
    airbnbFrames.frame = Math.round(interpolatedFrame);
    render();
    requestAnimationFrame(smoothScrollLoop);
}
requestAnimationFrame(smoothScrollLoop);
window.addEventListener("resize", resizeCanvas);


// --- JQUERY DOM DEPENDENT INTERACTION CODES ---
$(document).ready(function() {
    // GSAP Plugin Register
    gsap.registerPlugin(ScrollTrigger);

    // --- 3. CUSTOM CURSOR TRACKING ---
    const cursor = $('.custom-cursor');
    $(document).on('mousemove', function(e) {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
    });
    $('a, .btn, .tool-card, .portfolio-card, .custom-input').on('mouseenter', function() {
        cursor.addClass('cursor-hover');
    }).on('mouseleave', function() {
        cursor.removeClass('cursor-hover');
    });

    // --- 4. TYPING TEXT ANIMATION ---
    const words = ["Developer", "Designer", "Coder"];
    let wordIndex = 0;
    setInterval(() => {
        gsap.to(".dynamic-text", { y: -20, opacity: 0, duration: 0.3, onComplete: function() {
            wordIndex = (wordIndex + 1) % words.length;
            $('.dynamic-text').text(words[wordIndex]);
            gsap.fromTo(".dynamic-text", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
        }});
    }, 2500);

    // --- 5. SMOOTH NAVIGATION SCROLL ---
    $('.smooth-scroll, .navbar-nav a').on('click', function(e) {
        if (this.hash !== "") {
            e.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800);
        }
    });

    // --- 6. SCROLLTRIGGER ANIMATIONS ---
    gsap.from(".reveal-text", {
        scrollTrigger: {
            trigger: ".about-section",
            start: "top 70%",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 50,
        duration: 1
    });

    gsap.from(".tool-card", {
        scrollTrigger: {
            trigger: ".tools-section",
            start: "top 70%"
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2
    });

    gsap.to(".giant-marquee-text", {
        scrollTrigger: {
            trigger: ".contact-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        x: -200
    });

    // --- 7. DECAP CMS DYNAMIC GALLERY LOADER ---
    // Imp Note: Change these values to your real details
    const githubUser = "ompatell28"; 
    const githubRepo = "STEREOSCOPIA_"; 
    
    function loadDecapGallery() {
        const grid = document.getElementById('dynamic-gallery-grid');
        if (!grid) return;

        fetch(`https://api.github.com/repos/${githubUser}/${githubRepo}/contents/gallery-uploads`)
        .then(response => {
            if(!response.ok) throw new Error("Empty Pool");
            return response.json();
        })
        .then(files => {
            grid.innerHTML = ''; 
            const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name));

            if(imageFiles.length === 0) {
                grid.innerHTML = `<div class="col-12 text-center text-white-50"><p>// NO UPLOADED WORK RECORDS DETECTED IN CLOUD POOL</p></div>`;
                return;
            }

            let indexCounter = 1;
            imageFiles.forEach(file => {
                let cleanTitle = file.name.split('.')[0].replace(/[-_]/g, ' ').toUpperCase();
                if(cleanTitle.length > 20) cleanTitle = cleanTitle.substring(0, 18) + '...';

                const cardColumn = document.createElement('div');
                cardColumn.className = 'col-lg-4 col-md-6';
                
                cardColumn.innerHTML = `
                    <div class="portfolio-card">
                        <div class="portfolio-img-wrapper">
                            <img src="${file.download_url}" alt="${cleanTitle}">
                        </div>
                        <span>// RECENT RELEASE 0${indexCounter}</span>
                        <h3>${cleanTitle}</h3>
                    </div>
                `;
                grid.appendChild(cardColumn);
                indexCounter++;
            });

            // Trigger dynamic entrance using GSAP
            gsap.from(".portfolio-card", {
                scrollTrigger: {
                    trigger: "#dynamic-gallery-grid",
                    start: "top 80%"
                },
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15
            });
        })
        .catch(err => {
            grid.innerHTML = `<div class="col-12 text-center text-white-50"><p>// STANDBY: REPOSITORY POOL INITIALIZATION REQUIRED</p></div>`;
        });
    }

    loadDecapGallery();
});