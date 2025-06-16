const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");

function parseMarkdown(text) {
    // Basit kalın ve italik markdown dönüşümü
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function appendMessage(content, sender) {
    const div = document.createElement("div");
    div.className = "message " + sender;
    div.innerHTML = parseMarkdown(content);
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function typeMessage(text, sender) {
    return new Promise((resolve) => {
        let i = 0;
        const div = document.createElement("div");
        div.className = "message " + sender;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;

        function type() {
            if (i <= text.length) {
                div.innerHTML = parseMarkdown(text.substring(0, i));
                i++;
                chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(type, 15); // yazma hızı (25ms)
            } else {
                resolve();
            }
        }
        type();
    });
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, "user");
    messageInput.value = "";
    messageInput.disabled = true;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            appendMessage("Sunucu hatası oluştu.", "assistant");
            messageInput.disabled = false;
            return;
        }

        const data = await response.json();
        await typeMessage(data.reply, "assistant");
    } catch (error) {
        appendMessage("Bağlantı hatası oluştu.", "assistant");
    }

    messageInput.disabled = false;
    messageInput.focus();
});

messageInput.focus();

messageInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.requestSubmit();
    }
});