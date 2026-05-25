const fs = require('fs');
const https = require('https');

const ISRO_PREFIXES = [
  'CARTOSAT', 'GSAT', 'RISAT', 'EOS-', 'INSAT', 'OCEANSAT', 'RESOURCESAT', 
  'IRNSS', 'NAVIC', 'MICROSAT', 'ASTROSAT', 'CHANDRAYAAN', 'ADITYA', 'XPOSAT', 
  'SCATSAT', 'SARAL', 'MEGHA-TROPIQUES', 'KALPANA', 'EDUSAT', 'HAMSAT', 
  'YOUTHSAT', 'SRMSAT', 'JUGNU', 'PRATHAM', 'PISAT', 'NIUSAT', 'ANAND', 
  'BHUVAN', 'KMS', 'SRE-', 'IMS-', 'TES', 'TEBHUI'
];

https.get('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const allSats = JSON.parse(data);
      console.log(`Loaded ${allSats.length} active satellites from CelesTrak.`);
      
      const isroSats = [];
      let issSat = null;

      allSats.forEach(sat => {
        const name = sat.OBJECT_NAME.toUpperCase();
        
        if (name === 'ISS (ZARYA)') {
          issSat = {
            id: "iss",
            noradId: sat.NORAD_CAT_ID,
            name: "International Space Station",
            callsign: "ISS",
            orbitType: "LEO",
            status: "NOMINAL",
            mission: "Space Station",
            launched: sat.LAUNCH_DATE || "20 Nov 1998",
            mass: 420000,
            description: "A multinational collaborative space station in low Earth orbit. The largest artificial object in space.",
            isSpecial: true,
            tle: null
          };
        } else {
          for (const prefix of ISRO_PREFIXES) {
            if (name.startsWith(prefix)) {
              isroSats.push({
                id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                noradId: sat.NORAD_CAT_ID,
                name: sat.OBJECT_NAME,
                callsign: name.substring(0, 8),
                orbitType: "UNKNOWN", // We can refine later
                status: "NOMINAL",
                mission: "ISRO Mission",
                launched: "Unknown",
                mass: 1000,
                description: `Indian satellite ${sat.OBJECT_NAME}`,
                tle: null
              });
              break;
            }
          }
        }
      });

      console.log(`Found ${isroSats.length} ISRO satellites and ${issSat ? 'found ISS' : 'missed ISS'}.`);
      
      const finalSats = issSat ? [issSat, ...isroSats] : isroSats;
      fs.writeFileSync('generated_satellites.json', JSON.stringify(finalSats, null, 2));
      console.log('Saved to generated_satellites.json');
      
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  });
}).on('error', err => {
  console.error(err);
});
