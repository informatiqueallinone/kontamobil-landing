// ── LANGUAGE ─────────────────────────────────────────────
let currentLang = 'fr';

function toggleLang() {
 currentLang = currentLang === 'fr' ? 'ht' : 'fr';
  const label = currentLang === 'fr' ? '🇭🇹 Kreyòl' : '🇫🇷 Français';
  document.querySelectorAll('.lang-btn').forEach(btn => { btn.textContent = label; });
  document.querySelectorAll('[data-fr]').forEach(el => {
    const key = currentLang === 'fr' ? 'fr' : 'ht';
    if (el.dataset[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = el.dataset[key];
      } else {
        el.textContent = el.dataset[key];
      }
    }
  });
}

// ── THEME ─────────────────────────────────────────────────
let dark = true;
function toggleTheme() {
  dark = !dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.querySelector('.theme-btn').textContent = dark ? '🌙' : '☀️';
}

// ── MOBILE MENU ───────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ── FAQ ───────────────────────────────────────────────────
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const icon = btn.querySelector('.faq-icon');
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(i => { i.textContent = '+'; i.style.transform = ''; });
  if (!isOpen) {
    answer.classList.add('open');
    icon.textContent = '−';
  }
}

// ── FORM ──────────────────────────────────────────────────
// ── Supabase config ──────────────────────────────────────
const SUPA_URL = 'https://rdcjxxyyixhmwfclkuya.supabase.co';
const SUPA_KEY = 'sb_publishable_OcdnV4_IWQW18LRI4547LQ_V1jAw9eY';
const supabaseClient = window.supabase.createClient(SUPA_URL, SUPA_KEY);

async function submitForm(btn) {
  const nameEl = document.getElementById('contact-name');
  const phoneEl = document.getElementById('contact-phone');
  const emailEl = document.getElementById('contact-email');
  const msgEl = document.getElementById('contact-message');
  const errEl = document.getElementById('contact-error');

  const fullName = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const email = emailEl.value.trim();
  const message = msgEl.value.trim();

  errEl.style.display = 'none';

  // Validation simple
  if (!fullName || !phone || !message) {
    errEl.textContent = currentLang === 'fr'
      ? '⚠️ Nom, téléphone et message sont requis.'
      : '⚠️ Non, telefòn ak mesaj obligatwa.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span>⏳ ' + (currentLang === 'fr' ? 'Envoi en cours...' : 'Ap voye...') + '</span>';

  try {
    // 1. Enregistrer dans Supabase
    const { error } = await supabaseClient.from('contact_messages').insert({
      full_name: fullName,
      phone: phone,
      email: email || null,
      message: message,
    });

    if (error) throw error;

    // 2. Déclencher la notification email (Edge Function) — best effort
    fetch(`${SUPA_URL}/functions/v1/notify-contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
      },
      body: JSON.stringify({ fullName, phone, email, message }),
    }).catch(() => {}); // silencieux si edge function indisponible

    // 3. Succès
    btn.textContent = currentLang === 'fr' ? '✅ Message envoyé !' : '✅ Mesaj voye !';
    btn.style.background = 'var(--green)';
    nameEl.value = ''; phoneEl.value = ''; emailEl.value = ''; msgEl.value = '';

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);

  } catch (err) {
    console.error('Contact form error:', err);
    errEl.textContent = currentLang === 'fr'
      ? '❌ Erreur d\'envoi. Réessayez ou contactez-nous via WhatsApp.'
      : '❌ Erè. Eseye ankò oswa kontakte nou sou WhatsApp.';
    errEl.style.display = 'block';
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}
// ── SCROLL ANIMATIONS ────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── PHONE SLIDER ─────────────────────────────────────────
let currentSlide = 0;
const totalSlides = 7; // changez selon le nombre de screenshots

function goSlide(n) {
  currentSlide = n;
  // Chaque slide = 1/7 du container total = 100/7 %
  document.getElementById('phoneSlider').style.transform = `translateX(-${n * (100 / 7)}%)`;
  document.querySelectorAll('.slide-dot').forEach((d, i) => {
    d.classList.toggle('active', i === n);
  });
}

// Auto-défilement toutes les 3 secondes
setInterval(() => {
  currentSlide = (currentSlide + 1) % totalSlides;
  goSlide(currentSlide);
}, 3000);