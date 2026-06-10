// --- 1. BACKGROUND CANVAS HD TRAFFIC MONITOR ---
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

if(images[0]) {
    if (images[0].complete) { resizeCanvas(); } else { images[0].onload = resizeCanvas; }
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

// --- 3. JQUERY & GSAP DOM CODES ---
$(document).ready(function() {
    gsap.registerPlugin(ScrollTrigger);

    // Custom Cursor
    const cursor = $('.custom-cursor');
    $(document).on('mousemove', function(e) {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    });
    $('a, button, .future-card, input, textarea').on('mouseenter', function() {
        cursor.addClass('cursor-hover');
    }).on('mouseleave', function() {
        cursor.removeClass('cursor-hover');
    });

    // Dynamic Greeting Timeline Text Fix
    const greetings = ["// IMMERSIVE MULTIMEDIA TERMINAL", "// CAPTURING LIGHT & DEPTH", "// VISUAL MATRIX LOADED"];
    let greetIndex = 0;
    setInterval(() => {
        gsap.to(".dynamic-text", { opacity: 0, y: -10, duration: 0.3, onComplete: function() {
            greetIndex = (greetIndex + 1) % greetings.length;
            $('.dynamic-text').text(greetings[greetIndex]);
            gsap.to(".dynamic-text", { opacity: 1, y: 0, duration: 0.3 });
        }});
    }, 3500);

    // GSAP Scroll Trigger Fixes (Lag Shield)
    gsap.from(".glass-card", {
        scrollTrigger: { trigger: ".about-panel", start: "top 75%" },
        opacity: 0, y: 40, duration: 1
    });

    // --- 4. DECAP CMS LIVE GALLERY LOADER (Fixed Folder Path) ---
    const githubUser = "ompatell28"; 
    const githubRepo = "STEREOSCOPIA_"; 
    
    function loadDecapGallery() {
        const track = document.getElementById('dynamic-gallery-grid');
        if (!track) return;

        // Fetches directly from your config's media folder ("images")
        fetch(`https://api.github.com/repos/${githubUser}/${githubRepo}/contents/images`)
        .then(response => { if(!response.ok) throw new Error(); return response.json(); })
        .then(files => {
            const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name));
            if(imageFiles.length > 0) {
                track.innerHTML = ''; // Clear defaults if admin uploaded photos exist
                let count = 1;
                imageFiles.forEach(file => {
                    let title = file.name.split('.')[0].replace(/[-_]/g, ' ').toUpperCase();
                    const card = document.createElement('div');
                    card.className = 'future-card';
                    card.innerHTML = `
                        <img src="${file.download_url}" class="base-img">
                        <div class="card-tag">${title} // 0${count}</div>
                    `;
                    track.appendChild(card);
                    count++;
                });
            }
        })
        .catch(err => { console.log("Using local fallback assets"); });
    }
    loadDecapGallery();
});