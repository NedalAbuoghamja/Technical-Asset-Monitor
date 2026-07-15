const fs = require('fs');
let txt = fs.readFileSync('public/css/styles.css', 'utf8');

const oldPrintRegex = /@media print\s*\{[\s\S]*?\}(?=\s*(?:\/\*|\w|\n\n|@media|@keyframes|\.user-session-info))/;

const newPrintCss = `@media print {
  @page {
    size: auto;
    margin: 10mm;
  }
  html, body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    color: black !important;
    display: block !important;
    min-height: auto !important;
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
  }
  body > *:not(#detailsModal) {
    display: none !important;
  }
  .modal:not(#detailsModal) {
    display: none !important;
  }
  #detailsModal {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    display: block !important;
    background: white !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
  }
  .modal-content, .detail-modal-content {
    position: static !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: none !important;
    min-width: 100% !important;
    transform: none !important;
    overflow: visible !important;
    display: block !important;
  }
  .tech-card {
    border: 2px solid #ddd !important;
    box-shadow: none !important;
    width: 100% !important;
    margin: 0 !important;
  }
  .modal-header button, .modal-footer, .print-btn {
    display: none !important;
  }
  .tech-detail-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 1rem !important;
    width: 100% !important;
  }
}
`;

txt = txt.replace(oldPrintRegex, newPrintCss);

fs.writeFileSync('public/css/styles.css', txt);
