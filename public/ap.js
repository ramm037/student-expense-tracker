const API = window.location.origin;

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

document.addEventListener('DOMContentLoaded', async () => {

  document.getElementById('categoryFilter').addEventListener('change', () => {
    fetchExpenses();
  });

  //Cheeck if user is logged in
  const authRes = await fetch(`${API}/auth/me`, {
    credentials: 'include'
  });
  const authData = await authRes.json();

  if (!authData.loggedIn) {
    window.location.href = '/login.html';
    return;
  }

  //Only show the page now that we know the user is logged in
  document.body.classList.add('ready');

  document.getElementById('topBar').style.display = 'block';
  document.getElementById('welcomeUser').textContent = authData.username;


  //show welcome bar
  document.getElementById('topBar').style.display = 'block';
  document.getElementById('welcomeUser').textContent = authData.username;

  //logout
  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/login.html';
  })

  fetchExpenses();
  fetchTotal();

  // Delete listener
  document.getElementById('expenseList').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.getAttribute('data-id');
      deleteExpense(id);
    }

    if (e.target.classList.contains('edit-btn')) {
      console.log('raw data-id attribute:', e.target.getAttribute('data-id'));
      console.log('all attributes:', e.target.outerHTML);
      const id = e.target.getAttribute('data-id');
      console.log('edit clicked, id:', id);
      startEdit(id, e.target.closest('tr'));
    }
    if (e.target.classList.contains('save-btn')) {
      const id = e.target.getAttribute('data-id');
      console.log('saving id:', id);
      await saveEdit(id);
    }
    if (e.target.classList.contains('cancel-btn')) {
      fetchExpenses(); // just reload to cancel
    }

  });

  // Add button listener
  document.getElementById('addBtn').addEventListener('click', async () => {
    const title = document.getElementById('title').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const category = document.getElementById('category').value.trim();
    const date = document.getElementById('date').value;

    if (!title || !amount || !category || !date) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      showToast('Amount must be a positive number', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      showToast('Date cannot be in the future', 'error');
      return;
    }

    const res = await fetch(`${API}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, amount, category, date })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('title').value = '';
      document.getElementById('amount').value = '';
      document.getElementById('category').value = '';
      document.getElementById('date').value = '';

      fetchExpenses();
      fetchTotal();
    } else {
      showToast(data.error, 'error');
    }
  });
});

// Fetch all expenses
async function fetchExpenses() {
  const tbody = document.getElementById('expenseList');
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:centre; padding:20px;"> LOADING.....</td></tr>`;

  const category = document.getElementById('categoryFilter').value;
  try {
    const res = await fetch(`${API}/expenses?category=${category}`, {
      credentials: 'include'
    });
    const expenses = await res.json();

    tbody.innerHTML = '';

    if (expenses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">No expenses yet. Add one above.</td></tr>`;
      return;
    }

    expenses.forEach(expense => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${expense.title}</td>
        <td>₹${expense.amount}</td>
        <td>${expense.category}</td>
        <td>${expense.date.split('T')[0]}</td>
        <td>
          <button class="edit-btn" data-id="${expense.id}">Edit</button>
          <button class="delete-btn" data-id="${expense.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style='text-align:centre; padding:20px; color:red;">Failed to load expenses</td></tr>`;
    console.error('fetchExpenses error:', err);
  }
}


// async function fetchExpenses() {
//   try {
//     const res = await fetch(`${API}/expenses`, {
//       credentials: 'include'
//     });
//     const expenses = await res.json();

//     const tbody = document.getElementById('expenseList');
//     tbody.innerHTML = '';





// Fetch total
async function fetchTotal() {
  try {
    const res = await fetch(`${API}/expenses/total`, {
      credentials: 'include'
    });
    const data = await res.json(); // await was missing before
    document.getElementById('total').textContent = data.total;
  } catch (err) {
    console.error('fetchTotal error:', err);
  }
}

// Delete expense
async function deleteExpense(id) {
  try {
    const res = await fetch(`${API}/expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      fetchExpenses();
      fetchTotal();
    }
  } catch (err) {
    console.error('deleteExpense error:', err);
  }
}

function startEdit(id, row) {
  console.log('startEdit called with id:', id);
  console.log('row html before edit:', row.innerHTML);
  const cells = row.querySelectorAll('td');

  const title = cells[0].textContent;
  const amount = cells[1].textContent.replace('₹', '');
  const category = cells[2].textContent;
  const date = cells[3].textContent;

  row.innerHTML = `
  <td><input type="text" value="${title}" id="editTitle" /></td>
  <td><input type="number" value="${amount}" id="editAmount" /></td>
  <td><input type="text" value="${category}" id="editCategory" /></td>
  <td><input type="date" value="${date}" id="editDate" /></td>
  <td>
     <button class="save-btn" data-id="${id}">Save</button>
     <button class="cancel-btn">Cancel</button>
     </td>`;
}

async function saveEdit(id) {
  const title = document.getElementById('editTitle').value.trim();
  const amount = document.getElementById('editAmount').value.trim();
  const category = document.getElementById('editCategory').value.trim();
  const date = document.getElementById('editDate').value;

  if (!title || !amount || !category || !date) {
    showToast('Please Fill all  fields', 'error');
    return;
  }
  const res = await fetch(`${API}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title, amount, category, date })
  });

  if (res.ok) {
    fetchExpenses();
    fetchTotal();
  } else {
    const data = await res.json();
    showToast(data.error, 'error');
  }
}
