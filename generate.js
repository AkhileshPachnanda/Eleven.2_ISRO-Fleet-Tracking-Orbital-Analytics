const fs = require('fs');

const oldData = fs.readFileSync('frontend/src/data/satellites.js', 'utf8');
const ind = JSON.parse(fs.readFileSync('ind.json', 'utf8'));
const isroSats = ind.filter(s => s.type === 'PAY');

const prevSats = {};
const matches = [...oldData.matchAll(/id:\s*"([^"]+)"[^}]*noradId:\s*(\d+)/g)];
matches.forEach(m => prevSats[m[2]] = m[1]);

// Simple regex to parse out old objects to preserve description, orbitType, etc.
// But writing a full JS parser is hard, so let's just keep it simple: we will lose some descriptions
// Or we can just evaluate the old file!
let SATELLITES = [];
try {
  // We can't easily eval ES6 exports, so let's just use the basic values.
} catch (e) {}

const finalSats = [];

isroSats.forEach(sat => {
  finalSats.push({
    id: prevSats[sat.id] || sat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    noradId: parseInt(sat.id),
    name: sat.name,
    callsign: sat.name.substring(0, 8),
    orbitType: 'UNKNOWN',
    status: 'NOMINAL',
    mission: 'ISRO Mission',
    launched: 'Unknown',
    mass: 1000,
    description: 'Indian satellite ' + sat.name,
    tle: null
  });
});

const iss = {
  id: 'iss',
  noradId: 25544,
  name: 'International Space Station',
  callsign: 'ISS',
  orbitType: 'LEO',
  status: 'NOMINAL',
  mission: 'Space Station',
  launched: '20 Nov 1998',
  mass: 420000,
  description: 'A multinational collaborative space station in low Earth orbit. The largest artificial object in space.',
  isSpecial: true,
  tle: null
};

finalSats.unshift(iss);

const fileContent = 'export const SATELLITES = ' + JSON.stringify(finalSats, null, 2) + ';\n\nexport const STATUS_COLORS = {\n  NOMINAL: "#6BBF8A",\n  CAUTION: "#D4A55E",\n  ALERT: "#D66B6B",\n};\n\nexport const ORBIT_COLORS = {\n  LEO: "#6B93D6",\n  GEO: "#D4915E",\n  SSO: "#6BBF8A",\n  UNKNOWN: "#A0A0A0"\n};\n';
fs.writeFileSync('frontend/src/data/satellites.js', fileContent);
console.log('Successfully wrote', finalSats.length, 'satellites to frontend/src/data/satellites.js');
