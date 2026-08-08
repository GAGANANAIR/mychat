const chatWindow = document.getElementById('chat-window');
const inputBox = document.getElementById('input-box');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const gateOverlay = document.getElementById('gate-overlay');
const gateInput = document.getElementById('gate-input');
const gateSubmit = document.getElementById('gate-submit');
const gateError = document.getElementById('gate-error');

let history = [];
let accessKey = sessionStorage.getItem('mychat_access_key') || '';

function addMessage(role, text) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  wrap.appendChild(bubble);
  chatWindow.appendChild(wrap);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

function addTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'msg assistant';
  wrap.id = 'typing-indicator';
  wrap.innerHTML = `<div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  chatWindow.appendChild(wrap);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

async function sendMessage() {
  const text = inputBox.value.trim();
  if (!text) return;

  addMessage('user', text);
  history.push({ role: 'user', content: text });
  inputBox.value = '';
  autoGrow();
  sendBtn.disabled = true;
  addTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessKey ? { 'x-access-key': accessKey } : {}),
      },
      body: JSON.stringify({ messages: history }),
    });

    removeTyping();

    if (res.status === 401) {
      showGate('Access key was rejected — try again.');
      history.pop(); // don't keep the unsent message in history
      return;
    }

    const data = await res.json();
    if (!res.ok) {
      addMessage('error', data.error || 'Something went wrong.');
      history.pop();
      return;
    }

    addMessage('assistant', data.reply);
    history.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    removeTyping();
    addMessage('error', 'Could not reach the server.');
    history.pop();
  } finally {
    sendBtn.disabled = false;
  }
}

function autoGrow() {
  inputBox.style.height = 'auto';
  inputBox.style.height = Math.min(inputBox.scrollHeight, 140) + 'px';
}
inputBox.addEventListener('input', autoGrow);
inputBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
sendBtn.addEventListener('click', sendMessage);

clearBtn.addEventListener('click', () => {
  history = [];
  chatWindow.innerHTML = '';
  addMessage('assistant', 'Conversation cleared. Ask me anything.');
});

// ---------------------------------------------------------------------
// Access gate
// ---------------------------------------------------------------------
function showGate(errorText) {
  gateOverlay.classList.remove('hidden');
  gateError.textContent = errorText || '';
  gateInput.focus();
}
function hideGate() {
  gateOverlay.classList.add('hidden');
}

gateSubmit.addEventListener('click', () => {
  accessKey = gateInput.value;
  sessionStorage.setItem('mychat_access_key', accessKey);
  hideGate();
});
gateInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') gateSubmit.click();
});

// Check on load whether a gate is even needed
fetch('/api/health')
  .then((r) => r.json())
  .then((data) => {
    if (data.accessGateEnabled && !accessKey) {
      showGate();
    }
    if (!data.groqConfigured) {
      addMessage('error', 'Server has no GROQ_API_KEY configured yet — add one to .env and restart.');
    }
  })
  .catch(() => {});
