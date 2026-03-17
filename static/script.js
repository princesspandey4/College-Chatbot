console.log("JS Loaded");

// =========================
// FAQ Suggestions
// =========================
const faqSuggestions = {
    fee: ["BTech fee", "MTech fee", "Hostel fee", "Admission fee", "Exam fee"],
    hostel: ["Hostel fee", "Hostel facilities", "Rooms available"],
    course: ["Courses offered", "BTech branches"],
    admission: ["Admission process", "Required documents", "Seat availability", "Eligibility criteria"],
};

// =========================
// ELEMENTS
// =========================
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const clearBtn = document.getElementById("clear-btn");
const suggestionBox = document.getElementById("suggestion-box");
const chatCard = document.getElementById("chat-card");
const chatBtn = document.getElementById("chat-float-btn");
const statusEl = document.getElementById("status");

// =========================
// WELCOME MESSAGE
// =========================
window.onload = () => {
    addMessage("Hello! I am PIIT’s virtual assistant. How can I help you today?", "bot");
};

// =========================
// ADD MESSAGE (with avatar + right alignment)
// =========================
function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = `msg-row ${sender}`;

    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = sender === "user" ? "/static/user.png" : "/static/bot.png";

    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.innerText = text;

    if (sender === "user") {
        row.style.justifyContent = "flex-end";
        row.appendChild(msg);
        row.appendChild(avatar);
        row.style.flexDirection="row";
    } else {
        row.appendChild(avatar);
        row.appendChild(msg);
    }

    chatBox.appendChild(row);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// =========================
// TYPING INDICATOR
// =========================
function showTyping() {
    if (document.getElementById("__typing")) return;

    const t = document.createElement("div");
    t.id = "__typing";
    t.className = "typing";
    t.innerHTML = `
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
    `;
    chatBox.appendChild(t);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById("__typing");
    if (t) t.remove();
}

// =========================
// SEND MESSAGE TO SERVER
// =========================
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";
    suggestionBox.style.display = "none";

    showTyping();

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        const data = await res.json();
        hideTyping();

        addMessage(data.reply || "Sorry, I don't have information on that.", "bot");
        statusEl.textContent = "Online";

    } catch {
        hideTyping();
        addMessage("Server error. Try again later.", "bot");
        statusEl.textContent = "Offline";
    }
}

sendBtn.onclick = sendMessage;
input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

// CLEAR CHAT
clearBtn.onclick = () => {
    chatBox.innerHTML = "";
};

// =========================
// AUTO SUGGESTION BOX (DROPDOWN STYLE INSIDE CHAT)
// =========================
input.addEventListener("input", () => {
    const text = input.value.toLowerCase().trim();
    suggestionBox.innerHTML = "";

    if (!text) {
        suggestionBox.style.display = "none";
        return;
    }

    let matched = false;

    Object.keys(faqSuggestions).forEach(key => {
        if (text.includes(key)) {
            faqSuggestions[key].forEach(item => {
                let opt = document.createElement("div");
                opt.innerText = item;

                opt.onclick = () => {
                    input.value = item;
                    suggestionBox.style.display = "none";
                };

                suggestionBox.appendChild(opt);
            });

            matched = true;
        }
    });

    suggestionBox.style.display = matched ? "block" : "none";
});

// =========================
// OPEN / CLOSE CHAT MODAL
// =========================
chatBtn.onclick = () => {
    if (chatCard.style.display === "flex") {
        chatCard.style.display = "none";
        document.body.classList.remove("chat-open");
    } else {
        chatCard.style.display = "flex";
        document.body.classList.add("chat-open");
        chatBox.scrollTop = chatBox.scrollHeight;
    }
};

// =========================
// RATING POPUP LOGIC
// =========================
const rateBtn = document.getElementById("rateUsBtn");
const ratingPopup = document.getElementById("ratingPopup");
const closePopup = document.getElementById("closePopup");
const stars = document.querySelectorAll(".stars span");
const submitFb = document.getElementById("submitFeedback");

let rating = 0;

rateBtn.onclick = () => ratingPopup.style.display = "flex";
closePopup.onclick = () => ratingPopup.style.display = "none";

stars.forEach(star => {
    star.onclick = () => {
        rating = star.dataset.star;
        stars.forEach(s => s.classList.remove("active"));
        for (let i = 0; i < rating; i++) stars[i].classList.add("active");
    };
});

submitFb.onclick = async () => {
    const text = document.getElementById("feedbackText").value;

    if (!rating) {
        const warn = document.getElementById("warningPopup");
        warn.style.display = "block";
        setTimeout(() => warn.style.display = "none", 2000);
        return;
    }

    await fetch("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback: text })
    });

    ratingPopup.style.display = "none";

    const ok = document.getElementById("successPopup");
    ok.style.display = "block";
    setTimeout(() => ok.style.display = "none", 2000);
};

// =========================
// SLIDESHOW
// =========================
let slides = document.querySelectorAll(".slide");
let i = 0;

setInterval(() => {
    slides[i].classList.remove("active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("active");
}, 4000);