// check-candidates.mjs
const candidates = {
  'Hiearcool 7-in-1':     ['B0B2GRTDTH','B0BPNRFLLD','B0C4BDHKWR','B09G9XZQGM'],
  'Baseus 13-in-1':       ['B094BZTQFL','B0BXC78BWW','B09CY5SLMX','B0CZVQ3Z8S'],
  'Lamicall Phone Stand': ['B07D77TBNF','B09B1SMYNQ','B0C5ZPWMYX','B0D7CQ6H4V'],
  'Govee LED 32.8ft':     ['B09BBHK7TL','B0D5KKTD3T','B08T3J8T4K','B0CXJC6WF5'],
  'Levitating Moon Lamp': ['B09NKK3NKJ','B08LQL8ZQJ','B0CZMQ15XP','B0BVTHZ35X'],
  'Ferrofluid Bottle':    ['B07QLVNDL9','B08VHFGXHH','B0BG4NVTLN','B0C6TLXKWD'],
  'Satechi Slim 4K':      ['B07BTQCPQF','B09V5GQPPH','B0D5HV4BYN','B0BWQXTBBJ'],
  'Insta360 Link AI':     ['B0D3SJD8BY','B0CPMGMH7T','B0CX7BZZNT','B0D9JRQW7V'],
  'NexiGo N980P':         ['B09BHVKZXF','B09DDJKGSY','B0C6GH8V7S','B0D5GH7Y43'],
  'Orbitkey Desk Mat':    ['B0CVRL4N8N','B09QWWMHVZ','B0B73N6P4D','B09G3XLNZR'],
  'Levitating Globe':     ['B0B7KGPLHJ','B0C3FXLKWZ','B0CNDPMPZZ','B09JWDLWJK'],
  'Keychron C3 Pro':      ['B0BF9F11QV','B09WQSLF7Y','B0C2X21F7Z','B0BLQD3ZTG'],
  'Keychron V1 QMK':      ['B0B3L6QFKH','B0C6HHMSHF','B0CTLQRMGQL','B0C2VTT66B'],
  'UGREEN Nexode 65W':    ['B0BPWXCQL3','B09N3MHMJ8','B09M61W6JB','B0CF5DHSQ7'],
  'NexiGo N60 1080p':     ['B08MJ1NW4X','B092YW3KDC','B0C6GN7JVL','B09D45HGWL']
};

async function isLive(asin) {
  try {
    const r = await fetch(`https://m.media-amazon.com/images/P/${asin}.01._SX300_QL70_.jpg`, {
      method: 'HEAD', signal: AbortSignal.timeout(5000)
    });
    const ct = r.headers.get('content-type') || '';
    const cl = parseInt(r.headers.get('content-length') || '0');
    return ct.includes('jpeg') || cl > 200;
  } catch { return false; }
}

for (const [name, asins] of Object.entries(candidates)) {
  let found = null;
  for (const asin of asins) {
    if (await isLive(asin)) { found = asin; break; }
  }
  if (found) console.log(`LIVE  ${name.padEnd(25)} -> ${found}`);
  else       console.log(`DEAD  ${name}`);
}
