const fs = require('fs');
let txt = fs.readFileSync('server.js', 'utf8');

txt = txt.replace(
  'monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, technicalStatus, customFields, connectionType, osVersion, ipAddress',
  'monitorsCount, deviceNature, serviceTag, recurringIssues, notes, systemsUsed, phone, employeeId, technicalStatus, customFields, connectionType, osVersion, ipAddress'
);

fs.writeFileSync('server.js', txt);
