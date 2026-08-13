const STORAGE_KEYS = {
  appointments: 'bm_appointments',
  contacts: 'bm_contacts',
  services: 'bm_services'
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getAppointments() {
  return readStorage(STORAGE_KEYS.appointments, []);
}

function saveAppointment(appointment) {
  const appointments = getAppointments();
  const newAppointment = { id: Date.now().toString(), status: 'en attente', createdAt: new Date().toISOString(), ...appointment };
  appointments.push(newAppointment);
  writeStorage(STORAGE_KEYS.appointments, appointments);
  return newAppointment;
}

function updateAppointmentStatus(id, status) {
  const appointments = getAppointments();
  const updated = appointments.map((item) => (item.id === id ? { ...item, status } : item));
  writeStorage(STORAGE_KEYS.appointments, updated);
  return updated;
}

function getContacts() {
  return readStorage(STORAGE_KEYS.contacts, []);
}

function saveContact(contact) {
  const contacts = getContacts();
  const newContact = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...contact };
  contacts.push(newContact);
  writeStorage(STORAGE_KEYS.contacts, contacts);
  return newContact;
}

function getServices() {
  return readStorage(STORAGE_KEYS.services, [
    { id: 'ecu', name: 'Reprogrammation ECU', description: 'Stage 1 / Stage 2, optimisation moteur', active: true },
    { id: 'meca', name: 'Réparation mécanique', description: 'Diagnostic, freinage, climatisation', active: true },
    { id: 'diag', name: 'Diagnostic électronique', description: 'Analyse de pannes moteur et calculateur', active: true }
  ]);
}

function saveServices(services) {
  writeStorage(STORAGE_KEYS.services, services);
}
