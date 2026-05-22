export function initContactModal() {
  const overlay = document.createElement('div');
  overlay.className = 'contact-modal-overlay';
  overlay.innerHTML = `
    <div class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <div class="contact-modal-header">
        <h2 id="contact-modal-title" class="contact-modal-title">Contact Us</h2>
        <button class="contact-modal-close" aria-label="Close Contact Modal">&times;</button>
      </div>
      <form id="contact-form">
        <div class="contact-form-group">
          <label class="contact-form-label" for="contact-name">Name</label>
          <input type="text" id="contact-name" class="contact-form-input" placeholder="Your Name" required>
        </div>
        <div class="contact-form-group">
          <label class="contact-form-label" for="contact-email">Email Address</label>
          <input type="email" id="contact-email" class="contact-form-input" placeholder="you@example.com" required>
        </div>
        <div class="contact-form-group">
          <label class="contact-form-label" for="contact-type">Topic</label>
          <select id="contact-type" class="contact-form-select" required>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Feedback">Feedback & Suggestions</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Business">Business Talk</option>
          </select>
        </div>
        <div class="contact-form-group">
          <label class="contact-form-label" for="contact-message">Message</label>
          <textarea id="contact-message" class="contact-form-textarea" placeholder="How can we help you?" required></textarea>
        </div>
        <button type="submit" id="contact-submit" class="btn-action w-full" style="width: 100%;">
          <span>Send Message</span>
        </button>
      </form>
      <div id="contact-success" style="display: none; text-align: center; padding: 20px 0;">
        <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
        <h3 style="color: var(--text); margin-bottom: 5px;">Message Sent!</h3>
        <p style="color: var(--muted); font-size: 0.9rem;">Thank you for reaching out. We'll get back to you soon.</p>
        <button class="btn-secondary contact-modal-close-success" style="margin-top: 15px; padding: 8px 16px;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const form = document.getElementById('contact-form');
  const successView = document.getElementById('contact-success');
  let isOpen = false;

  const openModal = (defaultTopic = 'General Inquiry') => {
    document.getElementById('contact-type').value = defaultTopic;
    form.style.display = 'block';
    successView.style.display = 'none';
    form.reset();
    
    overlay.classList.add('active');
    isOpen = true;
    setTimeout(() => {
      const nameInp = document.getElementById('contact-name');
      if (nameInp) nameInp.focus();
    }, 100);
  };

  const closeModal = () => {
    overlay.classList.remove('active');
    isOpen = false;
  };

  // Event Listeners for opening
  const feedbackBtn = document.getElementById('footer-feedback-btn');
  const contactBtn = document.getElementById('footer-contact-btn');
  
  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('Feedback'); });
  }
  if (contactBtn) {
    contactBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('General Inquiry'); });
  }

  // Event listeners for closing
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  overlay.querySelector('.contact-modal-close').addEventListener('click', closeModal);
  overlay.querySelector('.contact-modal-close-success').addEventListener('click', closeModal);

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('contact-submit');
    const originalText = submitBtn.innerHTML;
    
    const payload = {
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      type: document.getElementById('contact-type').value,
      message: document.getElementById('contact-message').value
    };

    try {
      submitBtn.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>';
      submitBtn.disabled = true;

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Submission failed');
      
      form.style.display = 'none';
      successView.style.display = 'block';

    } catch (err) {
      console.error(err);
      if (window.PdfMinty && window.PdfMinty.ui && window.PdfMinty.ui.showError) {
         window.PdfMinty.ui.showError('Could not send message. Please try again later.');
      } else {
         alert('Error sending message. Please check your connection.');
      }
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}
