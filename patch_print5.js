const fs = require('fs');
let txt = fs.readFileSync('public/css/styles.css', 'utf8');

const oldPrintRegex = /@media print\s*\{[\s\S]*?\}(?=\s*(?:\/\*|\w|\n\n|@media|@keyframes|\.user-session-info))/;

const newPrintCss = `@media print {
  @page {
    size: A4 portrait;
    margin: 1.5cm;
  }
  
  html, body {
    background: white !important;
    color: black !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
  }

  /* Hide absolutely everything else */
  body > *:not(#detailsModal) {
    display: none !important;
  }
  
  .app-container, .bg-blobs, .modal:not(#detailsModal) {
    display: none !important;
  }

  /* Reset the modal and make it take full page flow */
  #detailsModal {
    position: static !important;
    display: block !important;
    background: white !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    transform: none !important;
  }

  .modal-content, .detail-modal-content {
    position: static !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    transform: none !important;
    display: block !important;
  }

  .tech-card {
    border: 2px solid #ccc !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
  }

  /* Hide unnecessary modal elements */
  .modal-header, .modal-footer, .print-btn {
    display: none !important;
  }

  /* Enforce grid layouts against mobile overrides in print */
  .tech-card-sections {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 1.5rem !important;
    width: 100% !important;
  }

  .tech-detail-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 1rem !important;
    width: 100% !important;
  }
}
`;

txt = txt.replace(oldPrintRegex, newPrintCss);

fs.writeFileSync('public/css/styles.css', txt);
