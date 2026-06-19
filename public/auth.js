const API = 'http://localhost:3000';

function showToast(message, type = "success") {
  const toast = document.getElementById('toast');
  toast.className = 'toast'
  setTimeout(() => {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
      toast.className = 'toast';
    }, 3000)
  }, 10);
}

let isLogin = true;

// Toggle between login and signup
document.getElementById('toggleLink').addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;

  document.getElementById('formTitle').textContent = isLogin ? 'Login' : 'Sign Up';
  document.getElementById('submitBtn').textContent = isLogin ? 'Login' : 'Sign Up';
  document.getElementById('toggleLink').textContent = isLogin ? 'Sign Up' : 'Login';
  document.getElementById('message').textContent = '';
});

// Handle login and signup
document.getElementById('submitBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('message');

  if (!username || !password) {
    showToast('Please fill in all fields','error')
    return;
  }

  const endpoint = isLogin ? '/auth/login' : '/auth/signup';

  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    if (isLogin) {
      // Redirect to main app after login
      window.location.href = '/index.html';
    } else {
      message.style.color = 'green';
      showToast('Account Created. Please Login','success');
      // switch back to login form
      isLogin = true;
      document.getElementById('formTitle').textContent = 'Login';
      document.getElementById('submitBtn').textContent = 'Login';
    }
  } else {
    message.style.color = 'red';
    showToast(data.error, 'error')
  }
});
