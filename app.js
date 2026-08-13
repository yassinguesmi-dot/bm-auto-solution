document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.querySelector('.booking-form');
  const contactForm = document.querySelector('.contact-form');

  async function sendApiRequest(path, method, data) {
    const response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erreur API');
    }
    return response.json();
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(bookingForm);
      const appointment = Object.fromEntries(formData.entries());
      try {
        const result = await sendApiRequest('/api/appointments', 'POST', appointment);
        const adminNumber = '21697917199';
        const parts = [];
        if (appointment.name) parts.push(`Nom: ${appointment.name}`);
        if (appointment.phone) parts.push(`Téléphone: ${appointment.phone}`);
        if (appointment.email) parts.push(`Email: ${appointment.email}`);
        if (appointment.vehicle) parts.push(`Véhicule: ${appointment.vehicle}`);
        if (appointment.service) parts.push(`Service: ${appointment.service}`);
        if (appointment.subservice) parts.push(`Sous-service: ${appointment.subservice}`);
        if (appointment.date) parts.push(`Date: ${appointment.date}`);
        if (appointment.time) parts.push(`Heure: ${appointment.time}`);
        if (appointment.comment) parts.push(`Commentaire: ${appointment.comment}`);
        const message = `Nouvelle demande de rendez-vous\n${parts.join('\n')}`;
        const waUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        bookingForm.reset();
        alert('Votre demande a été enregistrée et WhatsApp s’est ouvert pour envoyer le message.');
      } catch (err) {
        console.warn('Impossible d’enregistrer la demande de rendez-vous', err);
        alert('Erreur lors de l’envoi du rendez-vous. Réessayez plus tard.');
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const contact = Object.fromEntries(formData.entries());
      try {
        await sendApiRequest('/api/contacts', 'POST', contact);
        contactForm.reset();
        alert('Votre message a bien été envoyé. Nous vous contacterons bientôt.');
      } catch (err) {
        console.warn('Impossible d’envoyer le message de contact', err);
        alert('Erreur lors de l’envoi du message. Réessayez plus tard.');
      }
    });
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Booking form: conditional sub-service / duration fields
  const serviceSelect = document.getElementById('service-select');
  const subserviceGroup = document.getElementById('subservice-group');
  const subserviceSelect = document.getElementById('subservice-select');
  const durationGroup = document.getElementById('duration-group');

  if (serviceSelect && subserviceGroup && subserviceSelect && durationGroup) {
    const subserviceMap = {
      'Freinage': ['Plaquettes & disques', 'Purge du circuit', 'Contrôle ABS'],
      'Suspension & Direction': ['Amortisseurs', 'Réglage géométrie', 'Remplacement ressorts'],
      'Vidange & Filtration': ['Vidange huile', 'Remplacement filtre huile', 'Remplacement filtre air'],
      'Reprogrammation Stage 1': ['Stage 1', 'Stage 2', 'Remap personnalisé'],
      'Réparation de calculateurs': ['Diagnostic ECU', 'Réparation carte', 'Remplacement connectique'],
      'Codage de clés': ['Ajout clé', 'Remplacement transpondeur', 'Synchronisation'],
      'Diagnostic complet': ['Moteur', 'Transmission', 'Électronique (ABS/airbag)']
    };

    // Additional keys to match updated select option texts
    subserviceMap['Reprogrammation et réparation calculateur'] = subserviceMap['Reprogrammation Stage 1'];
    subserviceMap['Réparation mécanique générale'] = ['Révision', 'Réparation moteur', 'Remplacement pièces'];
    subserviceMap['Diagnostic électronique avancé'] = subserviceMap['Diagnostic complet'];

    function updateConditionalFields() {
      const val = serviceSelect.value;
      const subs = subserviceMap[val] || null;
      if (subs && subs.length) {
        subserviceSelect.innerHTML = '<option value="">-- Sélectionnez --</option>' + subs.map(s => `<option>${s}</option>`).join('');
        subserviceGroup.style.display = '';
        durationGroup.style.display = 'none';
      } else {
        subserviceGroup.style.display = 'none';
        durationGroup.style.display = '';
      }
    }

    serviceSelect.addEventListener('change', updateConditionalFields);
    // initialize on page load
    updateConditionalFields();
  }
});
