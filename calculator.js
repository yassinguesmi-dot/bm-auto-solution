2document.addEventListener('DOMContentLoaded', () => {
  const rateInput = document.getElementById('hourlyRate');
  const hoursInput = document.getElementById('hours');
  const partsInput = document.getElementById('parts');
  const result = document.getElementById('result');
  const button = document.getElementById('calculateBtn');

  if (!rateInput || !hoursInput || !partsInput || !result || !button) return;

  button.addEventListener('click', () => {
    const rate = Number(rateInput.value) || 0;
    const hours = Number(hoursInput.value) || 0;
    const parts = Number(partsInput.value) || 0;
    const total = rate * hours + parts;
    result.textContent = `Total estimé : ${total} DT`;
  });
});
