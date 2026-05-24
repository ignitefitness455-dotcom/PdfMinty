/**
 * src/ui/shell/Footer.js - Footer with Trust Badges
 */
export function createFooter(container) {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-trust">
        <span class="trust-icon">🔒</span>
        <div>
          <strong>100% Private & Secure</strong>
          <p>Your files never leave your device. All processing happens locally in your browser.</p>
        </div>
      </div>
      <div class="footer-links" style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; margin-bottom: 0.5rem;">
        <a href="#" id="footer-feedback-btn" style="color: var(--primary); text-decoration: underline; font-size: 0.9rem;" aria-label="Provide Feedback">💬 Provide Feedback</a>
        <a href="#" id="footer-contact-btn" style="color: var(--primary); text-decoration: underline; font-size: 0.9rem;" aria-label="Contact Us">✉️ Contact Us</a>
      </div>
      <p class="footer-copyright">&copy; 2026 PDFMinty. Free and open-source PDF tools.</p>
    </div>
  `;

  container.appendChild(footer);

  // Set up event listeners if handlers exist
  const feedbackBtn = footer.querySelector('#footer-feedback-btn');
  const contactBtn = footer.querySelector('#footer-contact-btn');

  feedbackBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof window.showFeedbackModal === 'function') {
      window.showFeedbackModal();
    } else {
      console.log('Feedback modal not initialized yet');
    }
  });

  contactBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof window.showContactModal === 'function') {
      window.showContactModal();
    } else {
      console.log('Contact modal not initialized yet');
    }
  });

  return footer;
}
