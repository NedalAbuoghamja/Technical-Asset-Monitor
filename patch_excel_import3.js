const fs = require('fs');
let txt = fs.readFileSync('server.js', 'utf8');

const oldGetValue = `
      const getValue = (headerNames, indexFallback) => {
        for (const name of headerNames) {
          const idx = headers.indexOf(name);
          if (idx !== -1 && row[idx] !== undefined) {
            return String(row[idx]).trim();
          }
        }
        if (row[indexFallback] !== undefined) {
          return String(row[indexFallback]).trim();
        }
        return 'لا يوجد';
      };
`;

const newGetValue = `
      const getValue = (headerNames, indexFallback) => {
        let foundIdx = -1;
        for (const name of headerNames) {
          const idx = headers.indexOf(name);
          if (idx !== -1) {
            foundIdx = idx;
            break;
          }
        }
        
        if (foundIdx !== -1) {
          if (row[foundIdx] !== undefined) {
             return String(row[foundIdx]).trim();
          } else {
             return 'لا يوجد';
          }
        }
        
        if (indexFallback !== undefined && row[indexFallback] !== undefined) {
          return String(row[indexFallback]).trim();
        }
        return 'لا يوجد';
      };
`;

txt = txt.replace(oldGetValue, newGetValue);

fs.writeFileSync('server.js', txt);
