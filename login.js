/* login.html — sign-in, wired to the Auth module in main.js */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const result = Auth.login(username, password);
    if(!result.ok){
      toast(result.error);
      return;
    }

    toast('Logged in — redirecting to the menu…');
    setTimeout(() => location.href = 'products.html', 1200);
  });

  document.getElementById('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    toast('Password reset link sent to your email (design only).');
  });
});
