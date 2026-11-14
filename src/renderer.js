const COUNTRY_RULES = [
  ['DE', /🇩🇪|(?:^|[^A-Za-z])(?:DE|GER)(?=$|[^A-Za-z])/, /german|герман|frankfurt|франкфурт|berlin|munich|falkenstein|nuremberg|dusseldorf|hetzner/i],
  ['NL', /🇳🇱|(?:^|[^A-Za-z])(?:NL|NLD)(?=$|[^A-Za-z])/, /nether|holland|нидерланд|голланд|amster|амстердам|haarlem|rotterdam/i],
  ['PL', /🇵🇱|(?:^|[^A-Za-z])(?:PL|POL)(?=$|[^A-Za-z])/, /poland|польш|warsaw|варшав|gdansk|krakow|wroclaw/i],
  ['FI', /🇫🇮|(?:^|[^A-Za-z])(?:FI|FIN)(?=$|[^A-Za-z])/, /finland|финлянд|helsinki|хельсинки|espoo|tampere/i],
  ['LT', /🇱🇹|(?:^|[^A-Za-z])(?:LT|LTU)(?=$|[^A-Za-z])/, /lithuania|литв|vilnius|вильнюс|kaunas/i],
  ['LV', /🇱🇻|(?:^|[^A-Za-z])(?:LV|LVA)(?=$|[^A-Za-z])/, /latvia|латв|riga|рига/i],
  ['EE', /🇪🇪|(?:^|[^A-Za-z])(?:EE|EST)(?=$|[^A-Za-z])/, /estonia|эстон|tallinn|таллин/i],
  ['SE', /🇸🇪|(?:^|[^A-Za-z])(?:SE|SWE)(?=$|[^A-Za-z])/, /sweden|швец|stockholm|стокгольм|malmo/i],
  ['GB', /🇬🇧|(?:^|[^A-Za-z])(?:GB|UK|GBR)(?=$|[^A-Za-z])/, /united.?kingdom|britain|england|великобрит|британ|англи|london|лондон|manchester/i],
  ['FR', /🇫🇷|(?:^|[^A-Za-z])(?:FR|FRA)(?=$|[^A-Za-z])/, /france|франц|paris|париж|marseille|strasbourg|roubaix|gravelines/i],
  ['CH', /🇨🇭|(?:^|[^A-Za-z])(?:CH|CHE)(?=$|[^A-Za-z])/, /switz|швейцар|zurich|цюрих|geneva|basel/i],
  ['US', /🇺🇸|(?:^|[^A-Za-z])(?:US|USA)(?=$|[^A-Za-z])/, /united.?states|america|сша|америк|new.?york|ashburn|dallas|los.?angeles|miami|seattle|chicago|atlanta|silicon.?valley|virginia|phoenix/i],
  ['CA', /🇨🇦|(?:^|[^A-Za-z])(?:CA|CAN)(?=$|[^A-Za-z])/, /canada|канад|toronto|торонто|montreal|vancouver/i],
  ['CZ', /🇨🇿|(?:^|[^A-Za-z])(?:CZ|CZE)(?=$|[^A-Za-z])/, /czech|чехи|prague|прага|praha/i],
  ['AT', /🇦🇹|(?:^|[\[\(【|•·_\-])(?:AT|AUT)(?:[\]\)】|•·_\-\d]|$)/, /austria|австр|vienna|вена|wien/i],
  ['NO', /🇳🇴|(?:^|[\[\(【|•·_\-])(?:NO|NOR)(?:[\]\)】|•·_\-\d]|$)/, /norway|норвег|oslo|осло/i],
  ['DK', /🇩🇰|(?:^|[^A-Za-z])(?:DK|DNK)(?=$|[^A-Za-z])/, /denmark|дани|copenhagen|копенгаген/i],
  ['BE', /🇧🇪|(?:^|[^A-Za-z])(?:BE|BEL)(?=$|[^A-Za-z])/, /belgium|бельг|brussels|брюссель/i],
  ['IE', /🇮🇪|(?:^|[^A-Za-z])(?:IE|IRL)(?=$|[^A-Za-z])/, /ireland|ирланд|dublin|дублин/i],
  ['ES', /🇪🇸|(?:^|[^A-Za-z])(?:ES|ESP)(?=$|[^A-Za-z])/, /spain|испан|madrid|мадрид|barcelona/i],
  ['IT', /🇮🇹|(?:^|[\[\(【|•·_\-])(?:IT|ITA)(?:[\]\)】|•·_\-\d]|$)/, /italy|итал|milan|милан|rome|рим|turin/i],
  ['PT', /🇵🇹|(?:^|[^A-Za-z])(?:PT|PRT)(?=$|[^A-Za-z])/, /portugal|португал|lisbon|лиссабон/i],
  ['GR', /🇬🇷|(?:^|[^A-Za-z])(?:GR|GRC)(?=$|[^A-Za-z])/, /greece|грец|athens|афины/i],
  ['RO', /🇷🇴|(?:^|[^A-Za-z])(?:RO|ROU)(?=$|[^A-Za-z])/, /romania|румын|bucharest|бухарест/i],
  ['HU', /🇭🇺|(?:^|[^A-Za-z])(?:HU|HUN)(?=$|[^A-Za-z])/, /hungary|венгр|budapest|будапешт/i],
  ['SK', /🇸🇰|(?:^|[^A-Za-z])(?:SK|SVK)(?=$|[^A-Za-z])/, /slovakia|словак|bratislava|братислав/i],
  ['BG', /🇧🇬|(?:^|[^A-Za-z])(?:BG|BGR)(?=$|[^A-Za-z])/, /bulgaria|болгар|sofia|софия/i],
  ['MD', /🇲🇩|(?:^|[^A-Za-z])(?:MD|MDA)(?=$|[^A-Za-z])/, /moldova|молдов|молдав|chisinau|кишин/i],
  ['LU', /🇱🇺|(?:^|[^A-Za-z])(?:LU|LUX)(?=$|[^A-Za-z])/, /luxembourg|люксембург/i],
  ['IS', /🇮🇸|(?:^|[\[\(【|•·_\-])(?:IS|ISL)(?:[\]\)】|•·_\-\d]|$)/, /iceland|исланд|reykjavik/i],
  ['CY', /🇨🇾|(?:^|[^A-Za-z])(?:CY|CYP)(?=$|[^A-Za-z])/, /cyprus|кипр|limassol|nicosia/i],
  ['RS', /🇷🇸|(?:^|[^A-Za-z])(?:RS|SRB)(?=$|[^A-Za-z])/, /serbia|серб|belgrade|белград/i],
  ['HR', /🇭🇷|(?:^|[^A-Za-z])(?:HR|HRV)(?=$|[^A-Za-z])/, /croatia|хорват|zagreb/i],
  ['SI', /🇸🇮|(?:^|[^A-Za-z])(?:SI|SVN)(?=$|[^A-Za-z])/, /slovenia|словен|ljubljana/i],
  ['SG', /🇸🇬|(?:^|[^A-Za-z])(?:SG|SGP)(?=$|[^A-Za-z])/, /singapore|сингапур/i],
  ['JP', /🇯🇵|(?:^|[^A-Za-z])(?:JP|JPN)(?=$|[^A-Za-z])/, /japan|япон|tokyo|токио|osaka/i],
  ['KR', /🇰🇷|(?:^|[^A-Za-z])(?:KR|KOR)(?=$|[^A-Za-z])/, /korea|коре|seoul|сеул/i],
  ['TW', /🇹🇼|(?:^|[^A-Za-z])(?:TW|TWN)(?=$|[^A-Za-z])/, /taiwan|тайван|taipei|тайбэ/i],
  ['AU', /🇦🇺|(?:^|[^A-Za-z])(?:AU|AUS)(?=$|[^A-Za-z])/, /australia|австрал|sydney|сидней|melbourne/i],
  ['NZ', /🇳🇿|(?:^|[^A-Za-z])(?:NZ|NZL)(?=$|[^A-Za-z])/, /new.?zealand|зеланд|auckland/i],
  ['UA', /🇺🇦|(?:^|[^A-Za-z])(?:UA|UKR)(?=$|[^A-Za-z])/, /ukraine|украин|kyiv|kiev|киев|kharkiv|lviv|odessa/i],
  ['TR', /🇹🇷|(?:^|[^A-Za-z])(?:TR|TUR)(?=$|[^A-Za-z])/, /turkey|turkiye|турц|istanbul|стамбул|ankara|izmir/i],
  ['AE', /🇦🇪|(?:^|[^A-Za-z])(?:AE|UAE)(?=$|[^A-Za-z])/, /dubai|emirates|дуба|оаэ/i],
  ['IL', /🇮🇱|(?:^|[^A-Za-z])(?:IL|ISR)(?=$|[^A-Za-z])/, /israel|израил|tel.?aviv/i],
  ['BR', /🇧🇷|(?:^|[^A-Za-z])(?:BR|BRA)(?=$|[^A-Za-z])/, /brazil|бразил|sao.?paulo/i],
  ['KZ', /🇰🇿|(?:^|[^A-Za-z])(?:KZ|KAZ)(?=$|[^A-Za-z])/, /kazakh|казахст|almaty|astana|алмат|астан/i],
  ['AM', /🇦🇲|(?:^|[\[\(【|•·_\-])(?:AM|ARM)(?:[\]\)】|•·_\-\d]|$)/, /armenia|армен|ереван|yerevan/i],
  ['GE', /🇬🇪|(?:^|[^A-Za-z])(?:GE|GEO)(?=$|[^A-Za-z])/, /georgia|груз|тбилис|tbilisi/i],
  ['AZ', /🇦🇿|(?:^|[^A-Za-z])(?:AZ|AZE)(?=$|[^A-Za-z])/, /azerbaijan|азербайдж|baku|баку/i],
  ['UZ', /🇺🇿|(?:^|[^A-Za-z])(?:UZ|UZB)(?=$|[^A-Za-z])/, /uzbek|узбек|tashkent|ташкент/i],
  ['IN', /🇮🇳|(?:^|[\[\(【|•·_\-])(?:IN|IND)(?:[\]\)】|•·_\-\d]|$)/, /india|инди|mumbai|bangalore|delhi/i],
  ['RU', /🇷🇺|(?:^|[\[\(【|•·_\-])(?:RU|RUS)(?:[\]\)】|•·_\-\d]|$)/, /russia|росси|moscow|moskva|москв|saint.?petersburg|petersburg|петербург|питер|\bspb\b|novosibirsk|ekaterinburg|yekaterinburg|kazan|samara|vladivostok|krasnodar|sochi|rostov/i],
  ['BY', /🇧🇾|(?:^|[\[\(【|•·_\-])(?:BY|BLR)(?:[\]\)】|•·_\-\d]|$)/, /belarus|беларус|белорус|minsk|минск|brest|gomel|grodno/i],
  ['CN', /🇨🇳|(?:^|[^A-Za-z])(?:CN|CHN)(?=$|[^A-Za-z])/, /china|кита|beijing|shanghai|shenzhen|guangzhou|hangzhou|chengdu/i],
  ['HK', /🇭🇰|(?:^|[^A-Za-z])(?:HK|HKG)(?=$|[^A-Za-z])/, /hong.?kong|hongkong|гонконг/i],
  ['MO', /🇲🇴|(?:^|[^A-Za-z])(?:MO|MAC)(?=$|[^A-Za-z])/, /macau|macao|макао/i],
  ['IR', /🇮🇷|(?:^|[^A-Za-z])(?:IR|IRN)(?=$|[^A-Za-z])/, /iran|иран|tehran|isfahan|shiraz/i]
];

const ROW_HEIGHT = 58;
const BUFFER_ROWS = 8;

const el = id => document.getElementById(id);

let appState = null;
let profileById = new Map();
let groupCounts = new Map();
let selectedIds = new Set();
let lastCheckedIdx = -1;
let selectedProfileId = Number(localStorage.getItem('sutemi_selected_id') || 0) || null;
let selectedGroupId = -1;
let busy = false;
let connectingAction = false;
let toastTimer = null;
let justDoneTimer = null;
let searchDebounceTimer = null;
let livePolling = false;
let resizeRaf = 0;

const scanState = {
  active: false,
  single: false,
  total: 0,
  done: 0,
  onlineCount: 0,
  targetName: '',
  kind: 'latency',
  label: '',
  targetSet: new Set(),
  activeSet: new Set(),
  completedMap: new Map(),
  justDoneSet: new Set(),
  lastSortAt: 0
};

const virtualState = {
  items: [],
  startIdx: -1,
  endIdx: -1,
  topSpacer: null,
  rowsContainer: null,
  bottomSpacer: null,
  scrollRaf: 0
};

function detectCountry(name, address = '') {
  const raw = String(name || '');
  for (const [code, codeRe] of COUNTRY_RULES) {
    const flag = codeRe.source.split('|')[0];
    if (flag && raw.includes(flag)) return code;
  }
  const cleaned = raw.replace(/https?:\/\/\S+|t\.me\/\S+|@\S+/gi, ' ').trim();
  for (const [code, , wordRe] of COUNTRY_RULES) {
    if (wordRe && wordRe.test(cleaned)) return code;
  }
  for (const [code, codeRe] of COUNTRY_RULES) {
    if (codeRe.test(cleaned)) return code;
  }
  const host = String(address || '').trim().toLowerCase();
  const tldMatch = host.match(/\.(de|nl|pl|fi|ee|lv|lt|se|fr|ch|cz|at|no|dk|be|ie|es|it|pt|gr|ro|hu|sk|bg|md|lu|is|cy|rs|hr|si|sg|jp|kr|tw|au|nz|ua|tr|ae|il|br|kz|am|ge|az|uz|in|ru|by|cn|hk|ir)$/);
  if (tldMatch) return tldMatch[1].toUpperCase();
  return 'WW';
}

function rebuildStateIndexes() {
  profileById = new Map();
  groupCounts = new Map();
  if (!appState || !Array.isArray(appState.profiles)) {
    selectedIds.clear();
    return;
  }

  for (const p of appState.profiles) {
    p._search = `${p.name} ${p.type} ${p.address}`.toLowerCase();
    p._country = p.country || detectCountry(p.name, p.address);
    p._countryVerified = Boolean(p.countryVerified);
    profileById.set(p.id, p);
    groupCounts.set(p.groupId, (groupCounts.get(p.groupId) || 0) + 1);
  }

  for (const id of selectedIds) {
    if (!profileById.has(id)) {
      selectedIds.delete(id);
    }
  }

  if (selectedGroupId >= 0) {
    const groupExists = (appState.groups || []).some(g => g.id === selectedGroupId);
    if (!groupExists) {
      selectedGroupId = -1;
    }
  }
}

function smartFilterOn() {
  const toggle = el('smartFilterToggle');
  return toggle ? toggle.checked : true;
}

function showToast(message) {
  const toast = el('toast');
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function applyCountryBadge(node, code, verified = false) {
  node.textContent = code;
  node.className = node.classList.contains('small') ? 'country-badge small' : 'country-badge';
  if (code !== 'WW') {
    node.classList.add('c-' + code.toLowerCase());
  }
  if (verified) {
    node.classList.add('verified');
    node.title = `Verified exit: ${code}`;
  } else {
    node.removeAttribute('title');
  }
}

function formatRate(bps) {
  const val = Number(bps) || 0;
  if (val >= 1024 * 1024) {
    return `${(val / (1024 * 1024)).toFixed(1)} <small>MB/s</small>`;
  }
  return `${Math.round(val / 1024)} <small>KB/s</small>`;
}

function getActiveProfile() {
  if (!appState || !Array.isArray(appState.profiles) || appState.profiles.length === 0) return null;
  const st = String((appState.status && appState.status.state) || '').toLowerCase();
  const isConnected = ['running', 'connected', 'started'].includes(st);
  const runId = appState.status && appState.status.runningId;
  if (isConnected && runId !== null && runId !== undefined) {
    const running = profileById.get(Number(runId));
    if (running) return running;
  }
  if (selectedProfileId !== null) {
    const chosen = profileById.get(selectedProfileId);
    if (chosen) return chosen;
  }
  if (runId !== null && runId !== undefined) {
    const running = profileById.get(Number(runId));
    if (running) return running;
  }
  return appState.profiles[0];
}

function computeSortRank(p) {
  const lat = p.latency;
  const hasPrevAlive = lat !== null && lat !== undefined && lat > 0;
  const hasPrevDead = lat !== null && lat !== undefined && lat < 0;

  if (scanState.active && !scanState.single) {
    if (scanState.completedMap.has(p.id)) {
      const doneLat = scanState.completedMap.get(p.id);
      if (doneLat !== null && doneLat !== undefined && doneLat > 0) {
        return Math.min(doneLat, 99998);
      }
      return 400000;
    }
    if (scanState.activeSet.has(p.id)) {
      return 100000 + (hasPrevAlive ? Math.min(lat, 99998) : (hasPrevDead ? 99999 : 99998));
    }
    if (scanState.targetSet.has(p.id)) {
      return 200000 + (hasPrevAlive ? Math.min(lat, 99998) : (hasPrevDead ? 99999 : 99998));
    }
    if (hasPrevAlive) return Math.min(lat, 99998);
    if (hasPrevDead) return 400000;
    return 300000;
  }

  if (hasPrevAlive) return Math.min(lat, 99998);
  if (hasPrevDead) return 400000;
  return 300000;
}

function getFilteredProfiles() {
  if (!appState || !Array.isArray(appState.profiles)) return [];
  const query = el('searchInput').value.trim().toLowerCase();
  const hasQuery = query.length > 0;
  const filterGroup = selectedGroupId !== -1;

  const filtered = [];
  for (const p of appState.profiles) {
    if (filterGroup && p.groupId !== selectedGroupId) continue;
    if (hasQuery && !p._search.includes(query)) continue;
    p._sortRank = computeSortRank(p);
    filtered.push(p);
  }

  filtered.sort((a, b) => (a._sortRank - b._sortRank) || (a.id - b.id));

  for (let i = 0; i < filtered.length; i++) {
    filtered[i]._filteredIdx = i;
  }

  return filtered;
}

function renderCardPing(profile) {
  const pingEl = el('pingValue');
  const cardBtn = el('cardPingBtn');
  const isTestingThis = Boolean(
    profile &&
    scanState.active &&
    scanState.targetSet.has(profile.id) &&
    !scanState.completedMap.has(profile.id)
  );

  if (cardBtn) {
    cardBtn.classList.toggle('spinning', isTestingThis);
    cardBtn.disabled = !profile || scanState.active || busy || (appState && appState.engine.phase !== 'ready');
  }

  if (!profile) {
    pingEl.innerHTML = '- <small>ms</small>';
    return;
  }

  if (isTestingThis) {
    pingEl.innerHTML = '<span class="mini-spinner"></span> <small>Testing</small>';
    return;
  }

  const lat = scanState.completedMap.has(profile.id)
    ? scanState.completedMap.get(profile.id)
    : profile.latency;

  if (lat && lat > 0) {
    pingEl.innerHTML = `${lat} <small>ms</small>`;
  } else if (lat !== null && lat < 0) {
    pingEl.textContent = 'ERR';
  } else {
    pingEl.innerHTML = '- <small>ms</small>';
  }
}

function renderMain() {
  if (!appState) return;
  const { engine, status, mode, systemProxyActive, proxyEndpoint } = appState;

  const pill = el('enginePill');
  pill.className = 'engine-pill';
  if (engine.phase === 'ready') {
    pill.classList.add('ready');
    el('engineText').textContent = 'Engine ready';
  } else if (engine.phase === 'error') {
    pill.classList.add('error');
    el('engineText').textContent = 'Engine error';
  } else {
    el('engineText').textContent = 'Starting engine...';
  }

  const stateStr = String((status && status.state) || 'stopped').toLowerCase();
  const isConnected = ['running', 'connected', 'started'].includes(stateStr);
  const isConnecting = stateStr === 'connecting' || connectingAction;

  const area = el('connectArea');
  const btn = el('connectBtn');
  area.classList.toggle('connected', isConnected);
  area.classList.toggle('connecting', isConnecting && !isConnected);
  btn.classList.toggle('connected', isConnected);
  btn.disabled = busy || scanState.active || engine.phase !== 'ready';

  if (isConnected) {
    el('headline').textContent = 'You are protected';
    el('subheadline').textContent = 'Traffic is routed through the secure server';
    el('connectCaption').textContent = 'DISCONNECT';
  } else if (isConnecting) {
    el('headline').textContent = 'Connecting...';
    el('subheadline').textContent = 'Establishing encrypted tunnel';
    el('connectCaption').textContent = 'CONNECTING';
  } else {
    el('headline').textContent = 'Not connected';
    el('subheadline').textContent = 'Select a server and start a secure connection';
    el('connectCaption').textContent = 'CONNECT';
  }

  const profile = getActiveProfile();
  if (profile) {
    selectedProfileId = profile.id;
    localStorage.setItem('sutemi_selected_id', String(profile.id));
    applyCountryBadge(el('serverFlag'), profile._country || detectCountry(profile.name, profile.address), profile._countryVerified);
    el('serverTitle').textContent = profile.name;
    const addrText = profile.address ? ` | ${profile.address}` : '';
    el('serverMeta').textContent = `${profile.type}${addrText}`;
  } else {
    selectedProfileId = null;
    localStorage.removeItem('sutemi_selected_id');
    applyCountryBadge(el('serverFlag'), 'WW');
    el('serverTitle').textContent = 'No servers added';
    el('serverMeta').textContent = 'Click to paste a link or load built-in free servers';
  }
  renderCardPing(profile);
  if (!isConnected) resetAiBar();

  if (!isConnected) {
    el('downValue').innerHTML = formatRate(0);
    el('upValue').innerHTML = formatRate(0);
  }

   document.querySelectorAll('.mode').forEach(m => {
    m.classList.toggle('active', m.dataset.mode === mode);
    m.disabled = busy || scanState.active;
  });

  if (engine.phase === 'error') {
    el('notice').textContent = engine.message || '';
  } else if (status && status.tunConflict) {
    el('notice').textContent = status.tunConflict;
  } else {
    el('notice').textContent = '';
  }

  el('proxyEndpointText').textContent = proxyEndpoint || '127.0.0.1:2080';
  el('winProxyStateText').textContent = systemProxyActive ? 'ON' : 'OFF';
  el('engineVersionText').textContent = (status && status.version) ? status.version : 'Sutemi Headless';
}

function renderBulkBar() {
  const selectAllBtn = el('selectAllBtn');
  const clearSelectBtn = el('clearSelectBtn');
  const deleteSelectedBtn = el('deleteSelectedBtn');
  const bulkInfo = el('bulkInfo');
  if (!selectAllBtn || !clearSelectBtn || !deleteSelectedBtn || !bulkInfo) return;

  const totalFiltered = virtualState.items.length;
  const selCount = selectedIds.size;
  const lockMutations = scanState.active || busy;

  let allFilteredSelected = totalFiltered > 0;
  if (allFilteredSelected) {
    for (const p of virtualState.items) {
      if (!selectedIds.has(p.id)) {
        allFilteredSelected = false;
        break;
      }
    }
  }

  selectAllBtn.disabled = totalFiltered === 0 || busy;
  selectAllBtn.textContent = allFilteredSelected && totalFiltered > 0
    ? `Deselect all (${totalFiltered})`
    : `Select all (${totalFiltered})`;

  clearSelectBtn.hidden = selCount === 0;
  clearSelectBtn.disabled = busy;

  deleteSelectedBtn.hidden = selCount === 0;
  deleteSelectedBtn.disabled = lockMutations;
  if (selCount > 0) {
    deleteSelectedBtn.textContent = `Delete selected (${selCount})`;
    bulkInfo.textContent = `${selCount} selected · Shift+Click for range`;
  } else {
    bulkInfo.textContent = 'Shift+Click for range select';
  }
}

function renderScanControls() {
  const pingBtn = el('pingBtn');
  const pingBtnLabel = el('pingBtnLabel');
  const speedTestBtn = el('speedTestBtn');
  const restartEngineBtn = el('restartEngineBtn');
  const cleanDeadBtn = el('cleanDeadBtn');
  const deleteGroupBtn = el('deleteGroupBtn');
  const importSubmitBtn = el('importSubmitBtn');
  const pasteBtn = el('pasteBtn');
  const bestBtn = el('bestBtn');
  const updateSubsBtn = el('updateSubsBtn');
  const refreshBtn = el('refreshBtn');
  const cancelPingBtn = el('cancelPingBtn');
  const banner = el('scanBanner');
  const scanText = el('scanText');
  const scanStats = el('scanStats');
  const progressEl = el('scanProgress');

  const engineReady = !appState || appState.engine.phase === 'ready';
  const lockMutations = scanState.active || busy || !engineReady;

  if (pingBtn && pingBtnLabel) {
    pingBtn.classList.toggle('scanning', scanState.active);
    pingBtn.disabled = lockMutations;
    pingBtnLabel.textContent = scanState.active ? 'Scanning...' : 'Ping all';
  }

  if (bestBtn) bestBtn.disabled = lockMutations;
  if (speedTestBtn) speedTestBtn.disabled = lockMutations;
  if (restartEngineBtn) restartEngineBtn.disabled = lockMutations;
  if (cleanDeadBtn) cleanDeadBtn.disabled = lockMutations;
  if (importSubmitBtn) importSubmitBtn.disabled = lockMutations;
  if (pasteBtn) pasteBtn.disabled = lockMutations;
  if (updateSubsBtn) updateSubsBtn.disabled = lockMutations;
  if (refreshBtn) refreshBtn.disabled = busy || !engineReady;

  if (deleteGroupBtn) {
    const count = selectedGroupId >= 0 ? (groupCounts.get(selectedGroupId) || 0) : 0;
    deleteGroupBtn.hidden = selectedGroupId < 0 || count === 0;
    deleteGroupBtn.disabled = lockMutations;
    if (!deleteGroupBtn.hidden) {
      deleteGroupBtn.textContent = selectedGroupId === 0
        ? `Clear Default (${count})`
        : `Delete group (${count})`;
    }
  }

  if (cancelPingBtn && !scanState.active) {
    cancelPingBtn.disabled = false;
  }

  renderBulkBar();

  if (!banner) return;

  if (scanState.active) {
    banner.classList.add('open');
    const total = Math.max(1, scanState.total);
    const done = Math.min(scanState.done, total);
    const pct = Math.round((done / total) * 100);

    if (scanState.single && scanState.kind !== 'speed_ip') {
      scanText.textContent = scanState.targetName
        ? `Testing latency: ${scanState.targetName}`
        : 'Testing selected profile...';
      scanStats.textContent = 'Checking...';
      progressEl.value = 18;
    } else {
      if (scanState.kind === 'speed_ip') {
        scanText.textContent = `${scanState.label || 'Speed & IP'} (${pct}%)`;
        scanStats.textContent = `${done} / ${total}`;
      } else {
        scanText.textContent = `Scanning fastest first (${pct}%)`;
        scanStats.textContent = `${done} / ${total} · ${scanState.onlineCount} online`;
      }
      progressEl.value = Math.max(done > 0 ? pct : 4, 0);
    }
  } else {
    banner.classList.remove('open');
    progressEl.value = 0;
  }
}

function applyPingToElement(pingEl, latencyValue) {
  pingEl.className = 'profile-ping';
  if (latencyValue && latencyValue > 0) {
    pingEl.textContent = `${latencyValue} ms`;
    if (latencyValue <= 120) pingEl.classList.add('good');
    else if (latencyValue < 280) pingEl.classList.add('mid');
    else pingEl.classList.add('bad');
  } else if (latencyValue !== null && latencyValue < 0) {
    pingEl.textContent = 'Timeout';
    pingEl.classList.add('bad');
  } else {
    pingEl.textContent = '-';
  }
}

function applyRowScanVisuals(row, profile) {
  const pingEl = row.querySelector('.profile-ping');
  const pingOneBtn = row.querySelector('.ping-one-btn');
  const delBtn = row.querySelector('.delete-btn');
  const checkEl = row.querySelector('.row-check');
  const id = profile.id;
  const isChecked = selectedIds.has(id);

  row.classList.remove('scan-active', 'scan-queued', 'scan-done');
  row.classList.toggle('selected-row', selectedProfileId === id);
  row.classList.toggle('checked-row', isChecked);

  if (checkEl) {
    checkEl.checked = isChecked;
  }
  if (pingOneBtn) {
    pingOneBtn.classList.remove('spinning');
    pingOneBtn.disabled = scanState.active || busy;
  }
  if (delBtn) {
    delBtn.disabled = scanState.active || busy;
  }
  const selectBtn = row.querySelector('.profile-select');
  if (selectBtn) {
    selectBtn.disabled = scanState.active || busy;
  }

  if (scanState.active && scanState.targetSet.has(id)) {
    if (scanState.completedMap.has(id)) {
      applyPingToElement(pingEl, scanState.completedMap.get(id));
      if (scanState.justDoneSet.has(id)) {
        row.classList.add('scan-done');
      }
      return;
    }
    if (scanState.activeSet.has(id)) {
      row.classList.add('scan-active');
      pingEl.className = 'profile-ping testing';
      pingEl.innerHTML = '<span class="mini-spinner"></span><span>Testing</span>';
      if (pingOneBtn) pingOneBtn.classList.add('spinning');
      return;
    }
    row.classList.add('scan-queued');
    pingEl.className = 'profile-ping queued';
    pingEl.textContent = 'Queued';
    return;
  }

  applyPingToElement(pingEl, profile.latency);
  if (scanState.justDoneSet.has(id)) {
    row.classList.add('scan-done');
  }
}

function toggleRowSelection(p, shouldCheck, useRange) {
  const idx = typeof p._filteredIdx === 'number' ? p._filteredIdx : -1;
  if (useRange && lastCheckedIdx >= 0 && idx >= 0 && idx < virtualState.items.length) {
    const start = Math.min(lastCheckedIdx, idx);
    const end = Math.max(lastCheckedIdx, idx);
    for (let i = start; i <= end; i++) {
      const item = virtualState.items[i];
      if (shouldCheck) selectedIds.add(item.id);
      else selectedIds.delete(item.id);
    }
  } else {
    if (shouldCheck) selectedIds.add(p.id);
    else selectedIds.delete(p.id);
  }
  if (idx >= 0) lastCheckedIdx = idx;
  renderBulkBar();
  renderVirtualWindow(true);
}

function rowSubText(p) {
  let text = p.address ? `${p.type} | ${p.address}` : p.type;
  if (p.downloadBps > 0) text += ` · ${(p.downloadBps / 1e6).toFixed(1)} Mbps`;
  if (p.ipOut) text += ` · ${p.ipOut}`;
  return text;
}

function buildRowElement(p, runId, isConnected) {
  const row = document.createElement('div');
  const isActive = isConnected && Number(runId) === p.id;
  row.className = 'profile-row' + (isActive ? ' active-row' : '');
  row.dataset.profileId = String(p.id);

  row.addEventListener('click', e => {
    if (e.shiftKey) {
      const current = profileById.get(Number(row.dataset.profileId));
      if (current) {
        const shouldCheck = !selectedIds.has(current.id);
        toggleRowSelection(current, shouldCheck, true);
      }
      return;
    }
    const currentId = Number(row.dataset.profileId);
    selectedProfileId = currentId;
    localStorage.setItem('sutemi_selected_id', String(currentId));
    renderMain();
    renderVirtualWindow(true);
  });

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'row-check';
  check.checked = selectedIds.has(p.id);
  check.title = 'Select server (Shift+Click for range)';
  check.setAttribute('aria-label', `Select ${p.name}`);
  check.addEventListener('click', e => {
    e.stopPropagation();
    const current = profileById.get(Number(row.dataset.profileId));
    if (!current) return;
    toggleRowSelection(current, check.checked, e.shiftKey);
  });

  const flag = document.createElement('div');
  flag.className = 'country-badge small';
  applyCountryBadge(flag, p._country || detectCountry(p.name, p.address), p._countryVerified);

  const main = document.createElement('div');
  main.className = 'profile-main';
  const strong = document.createElement('strong');
  strong.textContent = p.name;
  const sub = document.createElement('span');
  sub.textContent = rowSubText(p);
  main.appendChild(strong);
  main.appendChild(sub);

  const ping = document.createElement('div');
  ping.className = 'profile-ping';

  const pingOneBtn = document.createElement('button');
  pingOneBtn.className = 'ping-one-btn';
  pingOneBtn.type = 'button';
  pingOneBtn.title = 'Test profile latency (Ctrl+Shift+S)';
  pingOneBtn.setAttribute('aria-label', `Test latency for ${p.name}`);
  pingOneBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3.2-6.9"/><polyline points="21 3 21 8 16 8"/></svg>';
  pingOneBtn.addEventListener('click', e => {
    e.stopPropagation();
    const current = profileById.get(Number(row.dataset.profileId));
    if (!current) return;
    selectedProfileId = current.id;
    localStorage.setItem('sutemi_selected_id', String(current.id));
    renderMain();
    startLatencyScan([current.id], current.name);
  });

  const selectBtn = document.createElement('button');
  selectBtn.className = 'profile-select';
  selectBtn.type = 'button';
  selectBtn.textContent = isActive ? 'Disconnect' : 'Connect';
  selectBtn.addEventListener('click', e => {
    e.stopPropagation();
    const current = profileById.get(Number(row.dataset.profileId));
    if (!current) return;
    const currentlyActive = ['running', 'connected', 'started'].includes(
      String((appState && appState.status && appState.status.state) || '').toLowerCase()
    ) && Number(appState && appState.status && appState.status.runningId) === current.id;

    if (currentlyActive) {
      runAction(async () => {
        appState = await window.sutemiUI.disconnect();
      });
      return;
    }

    runAction(async () => {
      selectedProfileId = current.id;
      localStorage.setItem('sutemi_selected_id', String(current.id));
      el('serverModal').classList.remove('open');
      connectingAction = true;
      renderMain();
      try {
        appState = await window.sutemiUI.connectProfile(current.id);
      } finally {
        connectingAction = false;
      }
    });
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.type = 'button';
  delBtn.textContent = 'x';
  delBtn.addEventListener('click', e => {
    e.stopPropagation();
    const currentId = Number(row.dataset.profileId);
    runAction(async () => {
      selectedIds.delete(currentId);
      appState = await window.sutemiUI.deleteProfiles([currentId]);
    });
  });

  row.appendChild(check);
  row.appendChild(flag);
  row.appendChild(main);
  row.appendChild(ping);
  row.appendChild(pingOneBtn);
  row.appendChild(selectBtn);
  row.appendChild(delBtn);
  applyRowScanVisuals(row, p);
  return row;
}

function ensureVirtualContainers(listEl) {
  if (
    virtualState.topSpacer &&
    virtualState.rowsContainer &&
    virtualState.bottomSpacer &&
    virtualState.topSpacer.parentNode === listEl
  ) {
    return;
  }
  listEl.innerHTML = '';
  const top = document.createElement('div');
  top.className = 'virtual-spacer';
  const rows = document.createElement('div');
  rows.className = 'virtual-rows';
  const bottom = document.createElement('div');
  bottom.className = 'virtual-spacer';
  listEl.appendChild(top);
  listEl.appendChild(rows);
  listEl.appendChild(bottom);
  virtualState.topSpacer = top;
  virtualState.rowsContainer = rows;
  virtualState.bottomSpacer = bottom;
  virtualState.startIdx = -1;
  virtualState.endIdx = -1;
}

function updateRowContents(row, p, runId, isConnected) {
  const isActive = isConnected && Number(runId) === p.id;
  row.classList.toggle('active-row', isActive);
  const flagEl = row.querySelector('.country-badge');
  if (flagEl) applyCountryBadge(flagEl, p._country || detectCountry(p.name, p.address), p._countryVerified);
  const subEl = row.querySelector('.profile-main span');
  if (subEl) subEl.textContent = rowSubText(p);
  const selBtn = row.querySelector('.profile-select');
  if (selBtn) selBtn.textContent = isActive ? 'Disconnect' : 'Connect';
  applyRowScanVisuals(row, p);
}

function renderVirtualWindow(forceRebuild = false) {
  const listEl = el('serverList');
  if (!listEl || !appState) return;

  const items = virtualState.items;
  if (items.length === 0) {
    virtualState.topSpacer = null;
    virtualState.rowsContainer = null;
    virtualState.bottomSpacer = null;
    virtualState.startIdx = -1;
    virtualState.endIdx = -1;
    listEl.innerHTML = '<div class="empty">No servers yet. Click "Paste from clipboard" or "Built-in Free Servers" above.</div>';
    return;
  }

  ensureVirtualContainers(listEl);

  const viewHeight = listEl.clientHeight || 400;
  const maxScrollTop = Math.max(0, items.length * ROW_HEIGHT - viewHeight);
  let scrollTop = listEl.scrollTop;
  if (scrollTop > maxScrollTop) {
    scrollTop = maxScrollTop;
    listEl.scrollTop = scrollTop;
  }
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
  const end = Math.min(items.length, Math.ceil((scrollTop + viewHeight) / ROW_HEIGHT) + BUFFER_ROWS);

  virtualState.topSpacer.style.height = (start * ROW_HEIGHT) + 'px';
  virtualState.bottomSpacer.style.height = ((items.length - end) * ROW_HEIGHT) + 'px';

  const container = virtualState.rowsContainer;
  const visibleSlice = items.slice(start, end);

  if (
    !forceRebuild &&
    start === virtualState.startIdx &&
    end === virtualState.endIdx &&
    container.children.length === visibleSlice.length
  ) {
    return;
  }

  let sameOrder = container.children.length === visibleSlice.length;
  if (sameOrder) {
    for (let i = 0; i < visibleSlice.length; i++) {
      if (Number(container.children[i].dataset.profileId) !== visibleSlice[i].id) {
        sameOrder = false;
        break;
      }
    }
  }

  const runId = appState.status && appState.status.runningId;
  const isConnected = ['running', 'connected', 'started'].includes(
    String((appState.status && appState.status.state) || '').toLowerCase()
  );

  if (sameOrder) {
    for (let i = 0; i < visibleSlice.length; i++) {
      updateRowContents(container.children[i], visibleSlice[i], runId, isConnected);
    }
    virtualState.startIdx = start;
    virtualState.endIdx = end;
    return;
  }

  const existingRows = new Map();
  for (const child of Array.from(container.children)) {
    if (child.dataset && child.dataset.profileId) {
      existingRows.set(Number(child.dataset.profileId), child);
    }
  }

  const frag = document.createDocumentFragment();
  for (const p of visibleSlice) {
    const existing = existingRows.get(p.id);
    if (existing) {
      updateRowContents(existing, p, runId, isConnected);
      frag.appendChild(existing);
    } else {
      frag.appendChild(buildRowElement(p, runId, isConnected));
    }
  }

  container.innerHTML = '';
  container.appendChild(frag);
  virtualState.startIdx = start;
  virtualState.endIdx = end;
}

function renderBuiltinPanel() {
  if (!appState || !Array.isArray(appState.builtinSources)) return;
  const grid = el('builtinGrid');
  grid.innerHTML = '';

  const groups = appState.groups || [];
  const lockMutations = scanState.active || busy;

  for (const src of appState.builtinSources) {
    const matchedGroup = groups.find(g => g.url === src.url || g.name === src.name);
    const count = matchedGroup ? (groupCounts.get(matchedGroup.id) || 0) : 0;

    const card = document.createElement('div');
    card.className = 'builtin-card';

    const info = document.createElement('div');
    info.className = 'builtin-card-info';
    const title = document.createElement('strong');
    title.textContent = src.name;
    const desc = document.createElement('span');
    desc.textContent = matchedGroup ? `${count} servers · loaded` : src.desc;
    info.appendChild(title);
    info.appendChild(desc);

    const actions = document.createElement('div');
    actions.className = 'builtin-card-actions';

    const btn = document.createElement('button');
    btn.className = 'soft-btn small';
    btn.type = 'button';
    btn.textContent = matchedGroup ? 'Update' : 'Load';
    btn.disabled = lockMutations;
    btn.addEventListener('click', () => runAction(async () => {
      showToast(matchedGroup ? 'Updating subscription...' : 'Loading built-in subscription...');
      appState = await window.sutemiUI.addBuiltinSource(src.id, smartFilterOn());
      el('builtinPanel').classList.remove('open');
      showToast(appState.importSummary || 'Subscription ready');
    }));
    actions.appendChild(btn);

    if (matchedGroup) {
      const rmBtn = document.createElement('button');
      rmBtn.className = 'soft-btn small danger-text';
      rmBtn.type = 'button';
      rmBtn.textContent = 'Remove';
      rmBtn.disabled = lockMutations;
      rmBtn.addEventListener('click', () => runAction(async () => {
        showToast(`Removing ${src.name}...`);
        appState = await window.sutemiUI.deleteGroup(matchedGroup.id);
        if (selectedGroupId === matchedGroup.id) selectedGroupId = -1;
        showToast(`Removed ${src.name}`);
      }));
      actions.appendChild(rmBtn);
    }

    card.appendChild(info);
    card.appendChild(actions);
    grid.appendChild(card);
  }
}

function renderGroups() {
  if (!appState) return;
  const tabs = el('groupTabs');
  tabs.innerHTML = '';

  const totalCount = (appState.profiles || []).length;
  const allTab = document.createElement('button');
  allTab.className = 'group-tab' + (selectedGroupId === -1 ? ' active' : '');
  allTab.type = 'button';
  allTab.textContent = `All (${totalCount})`;
  allTab.addEventListener('click', () => {
    selectedGroupId = -1;
    lastCheckedIdx = -1;
    selectedIds.clear();
    renderGroups();
    renderServerList(true);
    renderScanControls();
  });
  tabs.appendChild(allTab);

  for (const g of (appState.groups || [])) {
    const cnt = groupCounts.get(g.id) || 0;
    const tab = document.createElement('button');
    tab.className = 'group-tab' + (selectedGroupId === g.id ? ' active' : '');
    tab.type = 'button';
    tab.textContent = cnt > 0 ? `${g.name} (${cnt})` : g.name;
    tab.addEventListener('click', () => {
      selectedGroupId = g.id;
      lastCheckedIdx = -1;
      selectedIds.clear();
      renderGroups();
      renderServerList(true);
      renderScanControls();
    });
    tabs.appendChild(tab);
  }
}

function renderServerList(resetScroll = false) {
  if (!appState) return;
  const listEl = el('serverList');
  if (resetScroll) listEl.scrollTop = 0;

  virtualState.items = getFilteredProfiles();
  el('profileCount').textContent = `${virtualState.items.length} servers`;
  renderBulkBar();
  renderVirtualWindow(true);
}

function renderAll() {
  rebuildStateIndexes();
  renderMain();
  renderBuiltinPanel();
  renderGroups();
  renderServerList(false);
  renderScanControls();
}

async function runAction(fn) {
  if (busy) {
    showToast('Please wait, another action is running');
    return;
  }
  busy = true;
  renderMain();
  renderScanControls();
  renderBuiltinPanel();
  renderVirtualWindow(true);
  try {
    await fn();
  } catch (err) {
    const msg = (err && err.message) ? err.message : String(err);
    el('notice').textContent = msg;
    showToast(msg);
  } finally {
    busy = false;
    renderAll();
  }
}

async function startLatencyScan(profileIds, singleName = '') {
  if (!appState || appState.engine.phase !== 'ready') {
    showToast('Engine is not ready yet');
    return;
  }
  if (scanState.active || busy) return;

  const ids = Array.isArray(profileIds) ? profileIds : [];
  if (ids.length === 0) {
    showToast('No servers to test');
    return;
  }

  if (justDoneTimer) {
    clearTimeout(justDoneTimer);
    justDoneTimer = null;
  }

  scanState.active = true;
  scanState.single = ids.length === 1;
  scanState.total = ids.length;
  scanState.done = 0;
  scanState.onlineCount = 0;
  scanState.targetName = singleName;
  scanState.targetSet = new Set(ids);
  scanState.activeSet = new Set(ids.slice(0, Math.min(6, ids.length)));
  scanState.completedMap = new Map();
  scanState.justDoneSet = new Set();
  scanState.lastSortAt = 0;
  scanState.kind = 'latency';

  renderScanControls();
  renderBuiltinPanel();
  renderCardPing(getActiveProfile());
  renderVirtualWindow(true);

  try {
    const nextState = await window.sutemiUI.testLatency(
      (!scanState.single && selectedGroupId >= 0 && !el('searchInput').value.trim()) ? selectedGroupId : null,
      ids
    );
    if (nextState) appState = nextState;
  } catch (err) {
    const msg = (err && err.message) ? err.message : String(err);
    showToast(msg);
  } finally {
    scanState.active = false;
    scanState.activeSet.clear();
    renderAll();
  }
}

window.sutemiUI.onLatencyProgress(progress => {
  if (!progress) return;
  if (progress.kind === 'speed_ip') {
    handleSpeedProgress(progress);
    return;
  }

  scanState.justDoneSet.clear();

  let hasNewDelta = false;
  const delta = progress.deltaCompleted || progress.completed;
  if (delta && typeof delta === 'object') {
    for (const [rawId, val] of Object.entries(delta)) {
      hasNewDelta = true;
      const id = Number(rawId);
      const lat = Number(val);
      if (!scanState.completedMap.has(id)) {
        scanState.justDoneSet.add(id);
      }
      scanState.completedMap.set(id, lat);
      const p = profileById.get(id);
      if (p) p.latency = lat;
    }
  }

  scanState.active = Boolean(progress.scanning);
  scanState.single = Boolean(progress.single);
  scanState.total = Number(progress.total || scanState.total || 0);
  scanState.done = Number(progress.done ?? scanState.completedMap.size);
  if (typeof progress.onlineCount === 'number') {
    scanState.onlineCount = progress.onlineCount;
  }
  scanState.activeSet = new Set((progress.activeIds || []).map(Number));

  if (Array.isArray(progress.targetIds)) {
    scanState.targetSet = new Set(progress.targetIds.map(Number));
  }

  renderScanControls();
  renderCardPing(getActiveProfile());

  const now = Date.now();
  const sortCooldown = virtualState.items.length > 1000 ? 1500 : 350;
  if (!scanState.single && (!progress.scanning || (hasNewDelta && now - scanState.lastSortAt >= sortCooldown))) {
    scanState.lastSortAt = now;
    virtualState.items = getFilteredProfiles();
  }
  renderVirtualWindow(true);

  if (!progress.scanning) {
    if (progress.cancelled) {
      showToast(`Scan stopped (${scanState.done}/${scanState.total})`);
    } else if (scanState.single) {
      const onlyId = Array.from(scanState.targetSet)[0];
      const lat = scanState.completedMap.get(onlyId);
      if (lat && lat > 0) showToast(`Latency: ${lat} ms`);
      else showToast('Latency test: Timeout');
    } else {
      showToast(`Scan complete: ${scanState.onlineCount}/${scanState.total} online`);
    }
    scanState.targetSet.clear();
    scanState.activeSet.clear();
    if (justDoneTimer) clearTimeout(justDoneTimer);
    justDoneTimer = setTimeout(() => {
      justDoneTimer = null;
      scanState.justDoneSet.clear();
      renderVirtualWindow(true);
    }, 450);
  }
});

el('serverList').addEventListener('scroll', () => {
  if (virtualState.scrollRaf) return;
  virtualState.scrollRaf = requestAnimationFrame(() => {
    virtualState.scrollRaf = 0;
    renderVirtualWindow(false);
  });
});

window.addEventListener('resize', () => {
  if (!el('serverModal').classList.contains('open')) return;
  if (resizeRaf) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    renderVirtualWindow(false);
  });
});

el('connectBtn').addEventListener('click', () => runAction(async () => {
  const stateStr = String((appState && appState.status && appState.status.state) || '').toLowerCase();
  const isConnected = ['running', 'connected', 'started'].includes(stateStr);
  if (isConnected) {
    appState = await window.sutemiUI.disconnect();
    return;
  }
  const profile = getActiveProfile();
  if (!profile) {
    showToast('Add a server first');
    el('serverModal').classList.add('open');
    return;
  }
  connectingAction = true;
  renderMain();
  try {
    appState = await window.sutemiUI.connectProfile(profile.id);
  } finally {
    connectingAction = false;
  }
}));

el('cardPingBtn').addEventListener('click', e => {
  e.stopPropagation();
  const profile = getActiveProfile();
  if (!profile) {
    showToast('Add a server first');
    return;
  }
  startLatencyScan([profile.id], profile.name);
});


document.querySelectorAll('.mode').forEach(btn => {
  btn.addEventListener('click', () => runAction(async () => {
    appState = await window.sutemiUI.setMode(btn.dataset.mode);
  }));
});

function openServersModal() {
  el('serverModal').classList.add('open');
  renderGroups();
  renderBuiltinPanel();
  renderServerList(false);
  renderScanControls();
}

el('openServers').addEventListener('click', e => {
  if (e.target && e.target.closest('#cardPingBtn')) return;
  openServersModal();
});
el('openServers').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openServersModal();
  }
});

el('closeServersBtn').addEventListener('click', () => el('serverModal').classList.remove('open'));
el('serverModal').addEventListener('click', e => {
  if (e.target === el('serverModal')) el('serverModal').classList.remove('open');
});

el('importSubmitBtn').addEventListener('click', () => runAction(async () => {
  const txt = el('importInput').value.trim();
  if (!txt) return;
  appState = await window.sutemiUI.importText(txt, selectedGroupId >= 0 ? selectedGroupId : null, smartFilterOn());
  el('importInput').value = '';
  showToast(appState.importSummary || 'Servers imported');
}));

el('importInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    el('importSubmitBtn').click();
  }
});

el('pasteBtn').addEventListener('click', () => runAction(async () => {
  const txt = (await window.sutemiUI.readClipboard() || '').trim();
  if (!txt) {
    showToast('Clipboard is empty');
    return;
  }
  el('importInput').value = txt;
  appState = await window.sutemiUI.importText(txt, selectedGroupId >= 0 ? selectedGroupId : null, smartFilterOn());
  el('importInput').value = '';
  showToast('Servers imported');
}));

el('toggleBuiltinBtn').addEventListener('click', () => {
  el('builtinPanel').classList.toggle('open');
});

el('pingBtn').addEventListener('click', () => {
  const items = getFilteredProfiles();
  if (items.length > 500) {
    showToast(`Scanning ${items.length} servers (press Stop anytime)...`);
  }
  startLatencyScan(items.map(p => p.id));
});

el('cancelPingBtn').addEventListener('click', async () => {
  el('cancelPingBtn').disabled = true;
  el('scanText').textContent = 'Stopping scan...';
  await window.sutemiUI.cancelLatency().catch(() => {});
});

function resetAiBar() {
  el('aiExitBadge').textContent = 'EXIT: —';
  el('aiSpeedBadge').hidden = true;
  for (const id of ['aiChipGemini', 'aiChipStudio', 'aiChipGpt', 'aiChipClaude']) {
    const chip = el(id);
    chip.className = 'ai-chip';
    chip.removeAttribute('title');
  }
}

function renderAiBar(res) {
  if (!res) return;
  el('aiExitBadge').textContent = `EXIT: ${res.exitIp || '—'}${res.country ? ' · ' + res.country : ''}`;
  const speedEl = el('aiSpeedBadge');
  if (typeof res.speedMbps === 'number' && res.speedMbps > 0) {
    speedEl.textContent = `${res.speedMbps} Mbps`;
    speedEl.hidden = false;
  } else {
    speedEl.hidden = true;
  }
  const services = res.services || {};
  const chipMap = { aiChipGemini: 'gemini', aiChipStudio: 'aistudio', aiChipGpt: 'chatgpt', aiChipClaude: 'claude' };
  for (const [chipId, key] of Object.entries(chipMap)) {
    const chip = el(chipId);
    const svc = services[key] || { status: 'bad', note: 'No data' };
    chip.className = 'ai-chip ' + svc.status;
    chip.title = svc.note || '';
  }
}

let checkingAi = false;
el('checkAiBtn').addEventListener('click', async () => {
  if (checkingAi || busy) return;
  checkingAi = true;
  const btn = el('checkAiBtn');
  const prevText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Checking...';
  showToast('Checking AI access...');
  try {
    const res = await window.sutemiUI.checkAiAccess(true);
    renderAiBar(res);
    showToast(res && res.ok ? 'AI check complete' : 'AI check: no response through tunnel');
  } catch (err) {
    showToast((err && err.message) ? err.message : String(err));
  } finally {
    checkingAi = false;
    btn.disabled = false;
    btn.textContent = prevText;
  }
});

function handleSpeedProgress(progress) {
  const deltas = progress.deltaProfiles || {};
  for (const [rawId, val] of Object.entries(deltas)) {
    const p = profileById.get(Number(rawId));
    if (!p || !val) continue;
    if (val.country) {
      p.country = val.country;
      p.countryVerified = Boolean(val.countryVerified ?? true);
    }
    if (val.ipOut) p.ipOut = val.ipOut;
    if (Number(val.downloadBps) > 0) p.downloadBps = Number(val.downloadBps);
    if (Number(val.uploadBps) > 0) p.uploadBps = Number(val.uploadBps);
    p._country = p.country || detectCountry(p.name, p.address);
    p._countryVerified = Boolean(p.countryVerified);
  }

  scanState.kind = 'speed_ip';
  scanState.active = Boolean(progress.scanning);
  scanState.done = Number(progress.done || 0);
  scanState.total = Number(progress.total || scanState.total || 0);
  scanState.onlineCount = Number(progress.onlineCount || 0);
  scanState.activeSet = new Set((progress.activeIds || []).map(Number));
  if (Array.isArray(progress.targetIds)) {
    scanState.targetSet = new Set(progress.targetIds.map(Number));
  }
  if (progress.phaseLabel) scanState.label = progress.phaseLabel;

  renderScanControls();
  renderVirtualWindow(true);

  if (!progress.scanning) {
    scanState.activeSet.clear();
    if (progress.cancelled) showToast(`Speed & IP stopped (${scanState.done}/${scanState.total})`);
    else showToast(`Speed & IP done: ${scanState.onlineCount} servers measured`);
  }
}

function startSpeedIpTest(ids) {
  if (!appState || appState.engine.phase !== 'ready') {
    showToast('Engine is not ready yet');
    return;
  }
  if (scanState.active || busy) return;
  if (!ids || ids.length === 0) {
    showToast('No servers to test');
    return;
  }

  scanState.active = true;
  scanState.kind = 'speed_ip';
  scanState.label = 'Checking exit IP & speed';
  scanState.single = false;
  scanState.total = ids.length * 2;
  scanState.done = 0;
  scanState.onlineCount = 0;
  scanState.targetName = '';
  scanState.targetSet = new Set(ids);
  scanState.activeSet = new Set();
  scanState.completedMap = new Map();
  scanState.justDoneSet = new Set();

  renderScanControls();
  renderVirtualWindow(true);

  window.sutemiUI.testSpeedIp(null, ids)
    .then(nextState => { if (nextState) appState = nextState; })
    .catch(err => showToast(err && err.message ? err.message : String(err)))
    .finally(() => {
      scanState.active = false;
      scanState.kind = 'latency';
      scanState.activeSet.clear();
      renderAll();
    });
}

el('speedTestBtn').addEventListener('click', () => {
  let ids = Array.from(selectedIds);
  if (ids.length === 0) {
    const pool = getFilteredProfiles();
    const alive = pool.filter(p => p.latency > 0).sort((a, b) => a.latency - b.latency);
    ids = (alive.length > 0 ? alive : pool).slice(0, 12).map(p => p.id);
  }
  startSpeedIpTest(ids);
});

el('bestBtn').addEventListener('click', () => runAction(async () => {
  const candidates = getFilteredProfiles();
  if (candidates.length === 0) {
    showToast('No servers to connect');
    return;
  }
  const hasAlive = candidates.some(p => p.latency && p.latency > 0);
  showToast(hasAlive ? 'Connecting to fastest server...' : 'Testing servers to find fastest...');
  el('serverModal').classList.remove('open');
  connectingAction = true;
  renderMain();
  try {
    appState = await window.sutemiUI.connectBest(
      selectedGroupId >= 0 ? selectedGroupId : null,
      candidates.map(p => p.id)
    );
    if (appState && appState.status && appState.status.runningId) {
      selectedProfileId = Number(appState.status.runningId);
      localStorage.setItem('sutemi_selected_id', String(selectedProfileId));
    }
    showToast('Connected to fastest server');
  } finally {
    connectingAction = false;
  }
}));

el('updateSubsBtn').addEventListener('click', () => runAction(async () => {
  showToast('Updating subscriptions...');
  appState = await window.sutemiUI.updateAllSubs();
  showToast(appState.importSummary || 'Subscriptions updated');
}));

el('cleanDeadBtn').addEventListener('click', () => runAction(async () => {
  const runId = Number(appState.status && appState.status.runningId);
  const isConnected = ['running', 'connected', 'started'].includes(
    String((appState.status && appState.status.state) || '').toLowerCase()
  );

  let skippedActive = false;
  const removeIds = (appState.profiles || [])
    .filter(p => {
      if (selectedGroupId !== -1 && p.groupId !== selectedGroupId) return false;
      if (p.latency === null || p.latency === undefined || p.latency === 0) return false;
      const shouldRemove = p.latency < 0 || p.latency > 120;
      if (!shouldRemove) return false;
      if (isConnected && p.id === runId) {
        skippedActive = true;
        return false;
      }
      return true;
    })
    .map(p => p.id);

  if (removeIds.length === 0) {
    showToast(skippedActive
      ? 'Only active connected profile is >120ms'
      : 'No dead or >120ms profiles to remove');
    return;
  }

  showToast(`Removing ${removeIds.length} profiles...`);
  appState = await window.sutemiUI.deleteProfiles(removeIds);
  for (const id of removeIds) selectedIds.delete(id);
  showToast(`Removed ${removeIds.length} profiles (dead / >120ms)`);
}));

el('selectAllBtn').addEventListener('click', () => {
  const items = virtualState.items;
  if (items.length === 0) return;

  let allSelected = true;
  for (const p of items) {
    if (!selectedIds.has(p.id)) {
      allSelected = false;
      break;
    }
  }

  if (allSelected) {
    for (const p of items) selectedIds.delete(p.id);
    lastCheckedIdx = -1;
  } else {
    for (const p of items) selectedIds.add(p.id);
  }
  renderBulkBar();
  renderVirtualWindow(true);
});

el('clearSelectBtn').addEventListener('click', () => {
  selectedIds.clear();
  lastCheckedIdx = -1;
  renderBulkBar();
  renderVirtualWindow(true);
});

el('deleteSelectedBtn').addEventListener('click', () => runAction(async () => {
  if (selectedIds.size === 0) return;
  const idsToDelete = Array.from(selectedIds);
  showToast(`Deleting ${idsToDelete.length} servers...`);
  appState = await window.sutemiUI.deleteProfiles(idsToDelete);
  selectedIds.clear();
  lastCheckedIdx = -1;
  showToast(`Deleted ${idsToDelete.length} servers`);
}));

el('deleteGroupBtn').addEventListener('click', () => runAction(async () => {
  if (selectedGroupId < 0) return;
  const targetGroupId = selectedGroupId;
  showToast('Deleting group...');
  appState = await window.sutemiUI.deleteGroup(targetGroupId);
  if (targetGroupId > 0) selectedGroupId = -1;
  selectedIds.clear();
  lastCheckedIdx = -1;
  showToast('Group deleted');
}));

el('refreshBtn').addEventListener('click', () => runAction(async () => {
  appState = await window.sutemiUI.refreshData();
}));

el('searchInput').addEventListener('input', () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    searchDebounceTimer = null;
    lastCheckedIdx = -1;
    renderServerList(true);
    renderScanControls();
  }, 100);
});

async function loadLogsIntoModal() {
  try {
    const txt = await window.sutemiUI.getLogs();
    el('logsBox').textContent = txt || '-';
  } catch (err) {
    el('logsBox').textContent = String(err.message || err);
  }
}

el('openSettingsBtn').addEventListener('click', () => {
  el('settingsModal').classList.add('open');
  loadLogsIntoModal();
});

el('closeSettingsBtn').addEventListener('click', () => el('settingsModal').classList.remove('open'));
el('settingsModal').addEventListener('click', e => {
  if (e.target === el('settingsModal')) el('settingsModal').classList.remove('open');
});
el('refreshLogsBtn').addEventListener('click', loadLogsIntoModal);
el('restartEngineBtn').addEventListener('click', () => runAction(async () => {
  appState = await window.sutemiUI.restartEngine();
  await loadLogsIntoModal();
}));

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
    const profile = getActiveProfile();
    if (!profile) {
      showToast('Add a server first');
      return;
    }
    startLatencyScan([profile.id], profile.name);
  } else if (e.key === 'Escape') {
    el('serverModal').classList.remove('open');
    el('settingsModal').classList.remove('open');
  }
});

window.sutemiUI.onStateChanged(nextState => {
  appState = nextState;
  rebuildStateIndexes();
  if (scanState.active) {
    renderMain();
    renderScanControls();
    renderVirtualWindow(true);
  } else {
    renderAll();
  }
});

setInterval(async () => {
  if (document.hidden || livePolling || !appState || appState.engine.phase !== 'ready') return;
  const st = String((appState.status && appState.status.state) || '').toLowerCase();
  if (!['running', 'connected', 'started'].includes(st)) return;
  livePolling = true;
  try {
    const stats = await window.sutemiUI.getLiveStats();
    el('downValue').innerHTML = formatRate(stats.downloadBps);
    el('upValue').innerHTML = formatRate(stats.uploadBps);
  } catch (_) {}
  livePolling = false;
}, 1500);

(async () => {
  try {
    appState = await window.sutemiUI.getState();
    renderAll();
  } catch (err) {
    el('notice').textContent = 'Failed to load state: ' + (err && err.message ? err.message : String(err));
  }
})();