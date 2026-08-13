document.addEventListener('DOMContentLoaded', () => {
  const appointmentsList = document.getElementById('appointments-list');
  const contactsList = document.getElementById('contacts-list');
  const servicesList = document.getElementById('services-list');
  const stats = document.getElementById('stats');

  function render() {
    const appointments = getAppointments();
    const contacts = getContacts();
    const services = getServices();

    appointmentsList.innerHTML = appointments.map((item) => `
      <li class="card admin-item">
        <strong>${item.name || item.vehicle || 'Rendez-vous'}</strong>
        <p>${item.service || 'Service'}</p>
        <p>${item.email || ''}</p>
        <p>Status : ${item.status}</p>
        <button data-id="${item.id}" class="btn btn-secondary" data-action="confirm">Confirmer</button>
        <button data-id="${item.id}" class="btn btn-secondary" data-action="cancel">Annuler</button>
      </li>
    `).join('');

    contactsList.innerHTML = contacts.map((item) => `
      <li class="card admin-item">
        <strong>${item.name}</strong>
        <p>${item.email}</p>
        <p>${item.message}</p>
      </li>
    `).join('');

    servicesList.innerHTML = services.map((service) => `
      <li class="card admin-item">
        <strong>${service.name}</strong>
        <p>${service.description}</p>
        <p>Actif : ${service.active ? 'Oui' : 'Non'}</p>
      </li>
    `).join('');

    stats.innerHTML = `
      <div class="card"><h3>Rendez-vous</h3><p>${appointments.length}</p></div>
      <div class="card"><h3>Messages</h3><p>${contacts.length}</p></div>
      <div class="card"><h3>Services</h3><p>${services.length}</p></div>
    `;
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const id = button.getAttribute('data-id');
    const action = button.getAttribute('data-action');
    if (action === 'confirm') updateAppointmentStatus(id, 'confirmé');
    if (action === 'cancel') updateAppointmentStatus(id, 'annulé');
    render();
  });

  render();
});
