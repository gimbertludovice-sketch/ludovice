/* contact.html — contact form submission */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    toast('Message sent! We\'ll reply within one business day.');
    e.target.reset();
  });
});
