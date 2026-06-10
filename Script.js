// --- 1. BACKGROUND CANVAS ANIMATION ---
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
    
    context.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

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

// --- 2. JQUERY AND GSAP INTERACTIVE LOGIC ---
$(document).ready(function() {
    gsap.registerPlugin(ScrollTrigger);

    // Custom Cursor
    const cursor = $('.custom-cursor');
    $(document).on('mousemove', function(e) {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    });
    $('a, .cyber-btn, .future-card, .cyber-input').on('mouseenter', function() {
        cursor.addClass('cursor-hover');
    }).on('mouseleave', function() {
        cursor.removeClass('cursor-hover');
    });

    // Dynamic Text Changer
    const words = ["// IMMERSIVE MULTIMEDIA TERMINAL", "// CAPTURING LIGHT & DEPTH", "// VISUAL MATRIX LOADED"];
    let wordIndex = 0;
    setInterval(() => {
        gsap.to(".dynamic-text", { y: -20, opacity: 0, duration: 0.3, onComplete: function() {
            wordIndex = (wordIndex + 1) % words.length;
            $('.dynamic-text').text(words[wordIndex]);
            gsap.fromTo(".dynamic-text", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
        }});
    }, 3000);

    // About Card Scroll Animation
    gsap.from(".about-card", {
        scrollTrigger: { trigger: ".about-panel", start: "top 75%" },
        opacity: 0, y: 40, duration: 1
    });

    // --- 3. CLOUD DECAP CMS GALLERY LIVE LOADER ---
    const githubUser = "ompatell28"; 
    const githubRepo = "STEREOSCOPIA_"; 
    
    function loadDecapGallery() {
        const grid = document.getElementById('dynamic-gallery-grid');
        if (!grid) return;

        fetch(`https://api.github.com/repos/${githubUser}/${githubRepo}/contents/images`)
        .then(response => { if(!response.ok) throw new Error(); return response.json(); })
        .then(files => {
            const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name));
            if(imageFiles.length > 0) {
                grid.innerHTML = ''; 
                let indexCounter = 1;
                imageFiles.forEach(file => {
                    let cleanTitle = file.name.split('.')[0].replace(/[-_]/g, ' ').toUpperCase();
                    if(cleanTitle.length > 20) cleanTitle = cleanTitle.substring(0, 18) + '...';

                    const cardColumn = document.createElement('div');
                    cardColumn.className = 'future-card';
                    cardColumn.innerHTML = `
                        <img src="${file.download_url}" alt="${cleanTitle}">
                        <div class="card-tag">${cleanTitle} // 0${indexCounter}</div>
                    `;
                    grid.appendChild(cardColumn);
                    indexCounter++;
                });
                gsap.from(".future-card", { y: 30, opacity: 0, duration: 0.5, stagger: 0.1 });
            }
        })
        .catch(err => { console.log("Using local fallbacks"); });
    }
    loadDecapGallery();
});
// --- 4. CYBER FORM TRANSMISSION HANDLER (In-Form Success Message) ---
    $('.contact-form').on('submit', function(e) {
        e.preventDefault(); // Page refresh rokega

        const form = $(this);
        const submitBtn = form.find('.cyber-btn');
        const statusMsg = form.find('.form-status-msg');
        
        // Netlify Forms submit trigger action
        let formData = new FormData(this);

        submitBtn.text("TRANSMITTING DATA...");
        submitBtn.css("pointer-events", "none");

        // Netlify background process ko submit data bhejna
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        })
        .then(() => {
            // Success: Saare inputs ko smoothly gayab karke form ke andar hi message dikhana
            form.find('.cyber-input, .cyber-btn').fadeOut(300, function() {
                statusMsg.html("// TRANSMISSION SUCCESSFUL:<br><br>YOUR INQUIRY MATRIX HAS BEEN SECURED IN OUR NODE.<br>WE WILL ESTABLISH LINK SHORTLY.").fadeIn(400);
            });
        })
        .catch((error) => {
            statusMsg.text("// ERROR: TRANSMISSION FAILED. TRY AGAIN.").fadeIn(400);
            submitBtn.text("TRANSMIT REQUEST _");
            submitBtn.css("pointer-events", "auto");
        });
    });
    