const fs = require('fs');
const https = require('https');

https.get('https://celestrak.org/pub/satcat.csv', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    const indSats = [];
    
    // Simple CSV parser function to handle quotes
    function parseCSVLine(text) {
      const re_valid = /^\s*(?:'[^'\\]*(?:\\[\s\S][^'\\]*)*'|"[^"\\]*(?:\\[\s\S][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\s\S][^'\\]*)*'|"[^"\\]*(?:\\[\s\S][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
      const re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\s\S][^'\\]*)*)'|"([^"\\]*(?:\\[\s\S][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
      
      let a = [];
      text.replace(re_value, function(m0, m1, m2, m3) {
        if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
        else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
        else if (m3 !== undefined) a.push(m3);
        return '';
      });
      if (/,\s*$/.test(text)) a.push('');
      return a;
    }

    let headers = [];
    lines.forEach((line, index) => {
      if (index === 0) {
        headers = parseCSVLine(line);
        return;
      }
      if (!line.trim()) return;
      
      const cols = parseCSVLine(line);
      const sat = {};
      headers.forEach((h, i) => sat[h] = cols[i]);
      
      if (sat.OWNER === 'IND' && !sat.DECAY_DATE && sat.OBJECT_TYPE === 'PAYLOAD') {
        indSats.push({
          name: sat.OBJECT_NAME,
          noradId: parseInt(sat.NORAD_CAT_ID, 10),
          launched: sat.LAUNCH_DATE,
          orbitType: sat.ORBIT_TYPE
        });
      }
    });

    console.log(`Found ${indSats.length} active Indian payloads.`);
    fs.writeFileSync('ind_sats.json', JSON.stringify(indSats, null, 2));
  });
}).on('error', err => {
  console.error(err);
});
