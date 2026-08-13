let token = null;

async function login(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const result = await response.json();
  if (result.success) {
    token = result.token;
    document.getElementById('admin-panel').classList.remove('hidden');
    loadData();
  } else {
    alert(result.message || 'Erreur');
  }
}

async function loadData() {
  const [appointmentsRes, contactsRes] = await Promise.all([
    fetch('/api/appointments'),
    fetch('/api/contacts')
  ]);
  const appointments = await appointmentsRes.json();
  const contacts = await contactsRes.json();

  document.getElementById('stats').innerHTML = `
    <div class="card"><h3>Rendez-vous</h3><p>${appointments.length}</p></div>
    <div class="card"><h3>Messages</h3><p>${contacts.length}</p></div>
  `;

  document.getElementById('appointments-list').innerHTML = appointments.map((item) => `
    <li class="card admin-item">
      <strong>${item.name || item.vehicle || 'Rendez-vous'}</strong>
      <p>${item.service || 'Service'}</p>
      <p>${item.email || ''}</p>
      <p>Status : ${item.status}</p>
      <button class="btn btn-secondary" onclick="updateStatus('${item.id}', 'confirmé')">Confirmer</button>
      <button class="btn btn-secondary" onclick="updateStatus('${item.id}', 'annulé')">Annuler</button>
    </li>
  `).join('');

  document.getElementById('contacts-list').innerHTML = contacts.map((item) => `
    <li class="card admin-item">
      <strong>${item.name}</strong>
      <p>${item.email}</p>
      <p>${item.message}</p>
    </li>
  `).join('');
}

async function updateStatus(id, status) {
  await fetch(`/api/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  loadData();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    login(document.getElementById('username').value, document.getElementById('password').value);
  });
});
