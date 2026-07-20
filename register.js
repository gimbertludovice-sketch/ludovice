/* register.html — account creation, wired to the Auth module in main.js */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const pass = document.getElementById('password');
  const confirm = document.getElementById('confirm');
  const hint = document.getElementById('match-hint');

  function checkMatch(){
    const mismatch = confirm.value && pass.value !== confirm.value;
    hint.style.display = mismatch ? 'block' : 'none';
    confirm.setCustomValidity(mismatch ? 'Passwords must match' : '');
  }
  pass.addEventListener('input', checkMatch);
  confirm.addEventListener('input', checkMatch);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    checkMatch();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }

    const result = Auth.register({
      fullname: document.getElementById('fullname').value.trim(),
      birthday: document.getElementById('birthday').value,
      gender: document.getElementById('gender').value,
      address: document.getElementById('address').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      username: document.getElementById('username').value.trim(),
      password: pass.value
    });

    if(!result.ok){
      toast(result.error);
      return;
    }

    toast('Account created — welcome to LUDOVICE!');
    setTimeout(() => location.href = 'login.html', 1400);
  });
});
