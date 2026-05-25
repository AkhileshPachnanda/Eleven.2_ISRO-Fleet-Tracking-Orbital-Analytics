const fs = require('fs');

const NEW_SATS = [
  {
    id: "cartosat-2c",
    noradId: 41599,
    name: "Cartosat-2C",
    callsign: "CRTS-2C",
    orbitType: "SSO",
    status: "NOMINAL",
    mission: "Earth Observation",
    launched: "22 Jun 2016",
    mass: 727,
    description: "High-resolution Earth observation satellite with panchromatic and multispectral cameras.",
    tle: null
  },
  {
    id: "cartosat-2d",
    noradId: 41948,
    name: "Cartosat-2D",
    callsign: "CRTS-2D",
    orbitType: "SSO",
    status: "NOMINAL",
    mission: "Earth Observation",
    launched: "15 Feb 2017",
    mass: 714,
    description: "Earth observation satellite launched with a record-breaking 104 satellites on a single PSLV.",
    tle: null
  },
  {
    id: "cartosat-2e",
    noradId: 42767,
    name: "Cartosat-2E",
    callsign: "CRTS-2E",
    orbitType: "SSO",
    status: "NOMINAL",
    mission: "Earth Observation",
    launched: "23 Jun 2017",
    mass: 712,
    description: "Earth observation satellite for cartographic applications, urban and rural applications, coastal land use and regulation.",
    tle: null
  },
  {
    id: "cartosat-2f",
    noradId: 43111,
    name: "Cartosat-2F",
    callsign: "CRTS-2F",
    orbitType: "SSO",
    status: "NOMINAL",
    mission: "Earth Observation",
    launched: "12 Jan 2018",
    mass: 710,
    description: "The seventh satellite in the Cartosat-2 series, providing high-resolution scene specific spot imagery.",
    tle: null
  },
  {
    id: "risat-2b",
    noradId: 44233, // Wait, RISAT-2B is 44233. In existing satellites.js, 44233 is Cartosat-3? Wait! 
    // Let me check my previous knowledge: Cartosat-3 is 44804! In my existing file I had Cartosat-3 as 44233? 
    // Let me look at ind.json lines: 
    // "name": "RISAT-2B", "id": "44233"
    // "name": "CARTOSAT-3", "id": "44804"
    name: "RISAT-2B",
    callsign: "RSAT-2B",
    orbitType: "SSO",
    status: "NOMINAL",
    mission: "Radar Imaging",
    launched: "22 May 2019",
    mass: 615,
    description: "Radar imaging earth observation satellite, replacing RISAT-2. Used for agriculture, forestry and disaster management support.",
    tle: null
  },
  {
    id: "gsat-7",
    noradId: 39234,
    name: "GSAT-7",
    callsign: "RUKMINI",
    orbitType: "GEO",
    status: "NOMINAL",
    mission: "Military Comms",
    launched: "30 Aug 2013",
    mass: 2650,
    description: "Also known as Rukmini, a multi-band communication satellite dedicated to the Indian Navy for secure, real-time communications.",
    tle: null
  },
  {
    id: "gsat-7a",
    noradId: 43864,
    name: "GSAT-7A",
    callsign: "GSAT-7A",
    orbitType: "GEO",
    status: "NOMINAL",
    mission: "Military Comms",
    launched: "19 Dec 2018",
    mass: 2250,
    description: "Advanced military communications satellite primarily for the Indian Air Force with Ku-band capabilities.",
    tle: null
  },
  {
    id: "gsat-9",
    noradId: 42695,
    name: "GSAT-9",
    callsign: "SAS",
    orbitType: "GEO",
    status: "NOMINAL",
    mission: "Communications",
    launched: "05 May 2017",
    mass: 2230,
    description: "South Asia Satellite, providing communication and disaster support for SAARC region countries.",
    tle: null
  },
  {
    id: "gsat-11",
    noradId: 43824,
    name: "GSAT-11",
    callsign: "GSAT-11",
    orbitType: "GEO",
    status: "NOMINAL",
    mission: "Communications",
    launched: "04 Dec 2018",
    mass: 5854,
    description: "The heaviest Indian communication satellite, providing high-speed broadband connectivity across India.",
    tle: null
  },
  {
    id: "gsat-29",
    noradId: 43698,
    name: "GSAT-29",
    callsign: "GSAT-29",
    orbitType: "GEO",
    status: "NOMINAL",
    mission: "Communications",
    launched: "14 Nov 2018",
    mass: 3423,
    description: "High-throughput communication satellite designed to provide connectivity to remote areas like Jammu & Kashmir and Northeast India.",
    tle: null
  },
  {
    id: "insat-3dr",
    noradId: 41752,
    name: "INSAT-3DR",
    callsign: "IN3DR",
    orbitType: "GEO",
    status: "NOMINAL",
    mission: "Meteorology",
    launched: "08 Sep 2016",
    mass: 2211,
    description: "Advanced meteorological satellite configured with an imaging System and an Atmospheric Sounder.",
    tle: null
  },
  {
    id: "irnss-1b",
    noradId: 39635,
    name: "IRNSS-1B",
    callsign: "NAVIC1B",
    orbitType: "GEO",
    status: "NOMINAL",
    mission: "Navigation",
    launched: "04 Apr 2014",
    mass: 1432,
    description: "The second satellite in the NavIC regional navigation satellite system constellation.",
    tle: null
  },
  {
    id: "xposat",
    noradId: 58694,
    name: "XPoSat",
    callsign: "XPOSAT",
    orbitType: "LEO",
    status: "NOMINAL",
    mission: "Astronomy",
    launched: "01 Jan 2024",
    mass: 469,
    description: "X-ray Polarimeter Satellite. India's first dedicated polarimetry mission to study dynamics of bright astronomical X-ray sources.",
    tle: null
  }
];

let fileContent = fs.readFileSync('frontend/src/data/satellites.js', 'utf8');

// Fix Cartosat-3 NORAD ID which was incorrect in the original file
fileContent = fileContent.replace(/id:\s*"cartosat-3",\s*noradId:\s*44233,/, 'id: "cartosat-3",\n    noradId: 44804,');

// Insert the new satellites right before the closing bracket of SATELLITES array
const arrayEndMarker = '];';
const insertionIndex = fileContent.indexOf(arrayEndMarker);

let insertionString = '';
NEW_SATS.forEach(sat => {
  insertionString += `  ${JSON.stringify(sat, null, 4).replace(/\"([^(\")"]+)\":/g, "$1:")},\n`;
});

const newFileContent = fileContent.slice(0, insertionIndex) + insertionString + fileContent.slice(insertionIndex);

fs.writeFileSync('frontend/src/data/satellites.js', newFileContent);
console.log('Successfully appended 13 new satellites.');
