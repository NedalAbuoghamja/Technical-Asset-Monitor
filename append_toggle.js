const fs = require('fs');

const func = `
function toggleDeviceFields() {
  const nature = document.getElementById('deviceNature').value;
  const pcFields = document.querySelectorAll('.pc-only-fields');
  const printerFields = document.querySelectorAll('.printer-only-fields');
  const sharedBtn = document.getElementById('sharedPrinterBtn');
  
  if (nature === 'Printer') {
    pcFields.forEach(el => el.style.display = 'none');
    printerFields.forEach(el => el.style.display = 'block');
    if (sharedBtn) sharedBtn.style.display = 'block';
  } else {
    pcFields.forEach(el => el.style.display = 'block');
    printerFields.forEach(el => el.style.display = 'none');
    if (sharedBtn) sharedBtn.style.display = 'none';
  }
}
`;

fs.appendFileSync('public/js/app.js', func);
console.log('Appended toggle function successfully');
