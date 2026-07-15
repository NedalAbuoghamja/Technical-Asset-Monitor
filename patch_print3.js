const fs = require('fs');
let txt = fs.readFileSync('public/css/styles.css', 'utf8');

const oldPrintRegex = /@media print\s*\{[\s\S]*?\}(?=\s*(?:\/\*|\w|\n\n|@media|@keyframes|\.user-session-info))/;

const newPrintCss = `@media print {
  body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    color: black !important;
    display: block !important;
    min-height: auto !important;
  }
  .app-container, .bg-blobs {
    display: none !important;
  }
  .modal:not(#detailsModal) {
    display: none !important;
  }
  #detailsModal {
    position: static !important;
    display: block !important;
    background: white !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
  .modal-content, .detail-modal-content, .tech-card {
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    transform: none !important;
  }
  .modal-header button, .modal-footer, .print-btn {
    display: none !important;
  }
  .tech-detail-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 1rem !important;
  }
}
`;

txt = txt.replace(oldPrintRegex, newPrintCss);

fs.writeFileSync('public/css/styles.css', txt);
