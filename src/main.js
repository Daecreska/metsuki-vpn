const { app, BrowserWindow, Tray, Menu, ipcMain, clipboard, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const net = require('net');
const tls = require('tls');
const http = require('http');
const https = require('https');
const { spawn, execFile, execFileSync } = require('child_process');
const dns = require('dns');

const API_ADDR = '127.0.0.1:9095';
const DEFAULT_PROXY_ENDPOINT = process.env.SUTEMI_SYSTEM_PROXY || process.env.THRONE_SYSTEM_PROXY || '127.0.0.1:2080';

const SCAN_CONCURRENCY = 24;
const SCAN_TIMEOUT_MS = 3500;
const REAL_TEST_URL = 'https://www.gstatic.com/generate_204';
const SMART_IMPORT_LIMIT = 120;

const BLOCKED_AI_COUNTRIES = new Set(['RU', 'BY', 'CN', 'HK', 'MO', 'IR', 'KP', 'SY', 'CU', 'AF', 'VE', 'MM']);
const EU_TIER1_COUNTRIES = new Set(['PL', 'LT', 'LV', 'EE', 'FI', 'SE', 'DE', 'NL', 'CZ', 'AT', 'NO', 'DK']);
const EU_TIER2_COUNTRIES = new Set(['GB', 'FR', 'CH', 'BE', 'IE', 'ES', 'IT', 'RO', 'HU', 'SK', 'BG', 'MD', 'PT', 'GR']);
const AI_TIER3_COUNTRIES = new Set(['US', 'CA', 'JP', 'SG', 'KR', 'AU', 'TW', 'NZ']);

const COUNTRY_NAME_RULES = [
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

const BUILTIN_SOURCES = [
  {
    id: 'pulseproxy-23',
    name: 'PulseProxy #23 (Anti-DPI)',
    desc: 'Curated anti-DPI mix (smart-filtered)',
    url: 'https://raw.githubusercontent.com/pie-with-jam/PulseProxy/main/githubmirror/23.txt'
  },
  {
    id: 'pulseproxy-22',
    name: 'PulseProxy #22 (VLESS/Xray)',
    desc: 'Xray/VLESS Reality mix (smart-filtered)',
    url: 'https://raw.githubusercontent.com/pie-with-jam/PulseProxy/main/githubmirror/22.txt'
  },
  {
    id: 'pulseproxy-3',
    name: 'PulseProxy #3 (Best 120)',
    desc: 'Filters 10k+ nodes to top 120 AI-ready',
    url: 'https://raw.githubusercontent.com/pie-with-jam/PulseProxy/main/githubmirror/3.txt'
  },
  {
    id: 'pulseproxy-25',
    name: 'PulseProxy #25 (Clean EU/US)',
    desc: 'Compact EU/US mix (smart-filtered)',
    url: 'https://raw.githubusercontent.com/pie-with-jam/PulseProxy/main/githubmirror/25.txt'
  },
  {
    id: 'igareck-mobile',
    name: 'BLACK VLESS Mobile',
    desc: 'TOP-150 VLESS, SS, Hy2 (smart-filtered)',
    url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/refs/heads/main/BLACK_VLESS_RUS_mobile.txt'
  },
  {
    id: 'hidashimora-34',
    name: 'Anti-RKN Mix (#34)',
    desc: 'Filtered free configs (smart-filtered)',
    url: 'https://raw.githubusercontent.com/Hidashimora/free-vpn-anti-rkn/main/configs/34.txt'
  }
];

let mainWindow = null;
let tray = null;
let throneProcess = null;
let isQuitting = false;
let cleaningUp = false;
let engineRestarting = false;
let engineState = { phase: 'starting', message: 'Starting Sutemi engine...' };
let currentMode = 'proxy';
let systemProxyActive = false;
let proxyEndpoint = DEFAULT_PROXY_ENDPOINT;
let engineLogs = [];
let cachedStatus = { state: 'stopped', runningId: null, runningName: '', tun: false, version: '' };
let cachedGroups = [];
let cachedProfiles = [];

let latencyScanRunning = false;
let latencyScanCancelRequested = false;
let activeLatencyJobId = null;
let activeLatencyPromise = null;

let mutationChain = Promise.resolve();
function runExclusive(fn) {
  const run = mutationChain.then(fn, fn);
  mutationChain = run.catch(() => {});
  return run;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addLog(line) {
  const text = String(line || '').trim();
  if (!text) return;
  const stamp = new Date().toISOString().slice(11, 19);
  for (const part of text.split(/\r?\n/)) {
    if (!part.trim()) continue;
    engineLogs.push(`[${stamp}] ${part.trim()}`);
    if (engineLogs.length > 220) engineLogs.shift();
  }
}

function getPaths() {
  const projectRoot = path.resolve(__dirname, '..');
  const runtimeRoot = app.isPackaged
    ? path.join(process.resourcesPath, 'runtime')
    : path.join(projectRoot, 'runtime');
  const dataRoot = app.isPackaged
    ? app.getPath('userData')
    : path.join(projectRoot, 'data');

  return {
    throneExe: path.join(runtimeRoot, 'throne', 'Throne.exe'),
    thronectlExe: path.join(runtimeRoot, 'bin', 'thronectl.exe'),
    dataDir: path.join(dataRoot, 'throne'),
    keyFile: path.join(dataRoot, 'throne', 'config', 'api.key'),
    stateFile: path.join(dataRoot, 'ui-state.json')
  };
}

function readUiState() {
  try {
    const { stateFile } = getPaths();
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function writeUiState(patch) {
  try {
    const { stateFile } = getPaths();
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    const next = { ...readUiState(), ...patch };
    fs.writeFileSync(stateFile, JSON.stringify(next, null, 2), 'utf8');
  } catch (_) {}
}

function createAppIcon() {
  const size = 32;
  const raw = Buffer.alloc(size * (1 + size * 4));
  const cx = 15.5;
  const cy = 15.5;

  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const idx = rowStart + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const t = (x + y) / (size * 2);

      let R = 14, G = 16, B = 24, A = 0;
      if (r <= 14.5) {
        A = 255;
        R = 16; G = 18; B = 28;
        if (r >= 10.5 && r <= 13.5) {
          R = Math.round(87 + (155 - 87) * t);
          G = Math.round(230 + (120 - 230) * t);
          B = Math.round(209 + (255 - 209) * t);
        } else if (Math.abs(dx) < 1.3 && r < 11) {
          R = 167; G = 139; B = 250;
        } else if (Math.abs(Math.abs(dy) - Math.abs(dx) * 0.58) < 1.3 && r < 11) {
          R = 87; G = 230; B = 209;
        } else if (r < 3.2) {
          R = 232; G = 224; B = 255;
        }
      }
      raw[idx] = R;
      raw[idx + 1] = G;
      raw[idx + 2] = B;
      raw[idx + 3] = A;
    }
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const compressed = zlib.deflateSync(raw);
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
  return nativeImage.createFromBuffer(png);
}

function runPowerShell(scriptText, sync = false) {
  const args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', scriptText];
  if (sync) {
    return execFileSync('powershell.exe', args, { windowsHide: true, timeout: 5000, encoding: 'utf8' });
  }
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', args, { windowsHide: true, timeout: 7000, encoding: 'utf8' }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout);
    });
  });
}

function buildWinInetRefreshPs() {
  const dllPath = path.join(path.dirname(getPaths().stateFile), 'SutemiWinInet.dll').replace(/'/g, "''");
  return `
$sutemiDll = '${dllPath}'
$sutemiSrc = @"
using System;
using System.Runtime.InteropServices;
public static class SutemiWinInet {
  [DllImport("wininet.dll", SetLastError = true)]
  public static extern bool InternetSetOption(IntPtr hInternet, int dwOption, IntPtr lpBuffer, int dwBufferLength);
}
"@
try {
  if (Test-Path -LiteralPath $sutemiDll) {
    Add-Type -LiteralPath $sutemiDll
  } else {
    Add-Type -TypeDefinition $sutemiSrc -OutputAssembly $sutemiDll -PassThru | Out-Null
  }
} catch {
  Remove-Item -LiteralPath $sutemiDll -Force -ErrorAction SilentlyContinue
  Add-Type -TypeDefinition $sutemiSrc
}
[void][SutemiWinInet]::InternetSetOption([IntPtr]::Zero, 39, [IntPtr]::Zero, 0)
[void][SutemiWinInet]::InternetSetOption([IntPtr]::Zero, 37, [IntPtr]::Zero, 0)
`;
}

async function enableSystemProxy(endpoint) {
  if (process.platform !== 'win32') return;
  if (!/^[a-zA-Z0-9.:-]+:\d{1,5}$/.test(endpoint)) {
    throw new Error('Invalid proxy endpoint: ' + endpoint);
  }
  const saved = readUiState();
  if (!saved.backupProxy) {
    const readPs = `
$p = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'
$item = Get-ItemProperty -Path $p -ErrorAction SilentlyContinue
@{
  ProxyEnable = if ($null -ne $item.ProxyEnable) { [int]$item.ProxyEnable } else { 0 }
  ProxyServer = if ($null -ne $item.ProxyServer) { [string]$item.ProxyServer } else { $null }
  ProxyOverride = if ($null -ne $item.ProxyOverride) { [string]$item.ProxyOverride } else { $null }
} | ConvertTo-Json -Compress
`;
    try {
      const out = await runPowerShell(readPs);
      const backup = JSON.parse((out || '{}').trim() || '{}');
      writeUiState({ backupProxy: backup, proxyActiveByUs: true });
    } catch (_) {
      writeUiState({ backupProxy: { ProxyEnable: 0, ProxyServer: null, ProxyOverride: null }, proxyActiveByUs: true });
    }
  } else {
    writeUiState({ proxyActiveByUs: true });
  }

  const enablePs = `
$p = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'
Set-ItemProperty -Path $p -Name ProxyEnable -Value 1 -Type DWord
Set-ItemProperty -Path $p -Name ProxyServer -Value '${endpoint}' -Type String
Set-ItemProperty -Path $p -Name ProxyOverride -Value 'localhost;127.*;10.*;172.16.*;192.168.*;<local>' -Type String
${buildWinInetRefreshPs()}
`;
  await runPowerShell(enablePs);
  systemProxyActive = true;
  addLog(`Windows System Proxy enabled -> ${endpoint}`);
}

function buildRestoreProxyPs(backup) {
  const enableVal = backup && typeof backup.ProxyEnable === 'number' ? backup.ProxyEnable : 0;
  const serverCmd = backup && backup.ProxyServer
    ? `Set-ItemProperty -Path $p -Name ProxyServer -Value '${String(backup.ProxyServer).replace(/'/g, "''")}' -Type String`
    : `Remove-ItemProperty -Path $p -Name ProxyServer -ErrorAction SilentlyContinue`;
  const overrideCmd = backup && backup.ProxyOverride
    ? `Set-ItemProperty -Path $p -Name ProxyOverride -Value '${String(backup.ProxyOverride).replace(/'/g, "''")}' -Type String`
    : `Remove-ItemProperty -Path $p -Name ProxyOverride -ErrorAction SilentlyContinue`;
  return `
$p = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'
Set-ItemProperty -Path $p -Name ProxyEnable -Value ${enableVal} -Type DWord
${serverCmd}
${overrideCmd}
${buildWinInetRefreshPs()}
`;
}

async function restoreSystemProxy() {
  if (process.platform !== 'win32') return;
  const saved = readUiState();
  if (!saved.proxyActiveByUs && !systemProxyActive) return;
  try {
    await runPowerShell(buildRestoreProxyPs(saved.backupProxy));
    addLog('Windows System Proxy restored');
  } catch (err) {
    addLog('Failed to restore Windows System Proxy: ' + err.message);
  } finally {
    systemProxyActive = false;
    writeUiState({ proxyActiveByUs: false, backupProxy: null });
  }
}

function restoreSystemProxySync() {
  if (process.platform !== 'win32') return;
  const saved = readUiState();
  if (!saved.proxyActiveByUs && !systemProxyActive) return;
  try {
    runPowerShell(buildRestoreProxyPs(saved.backupProxy), true);
  } catch (_) {}
  systemProxyActive = false;
  writeUiState({ proxyActiveByUs: false, backupProxy: null });
}

function parseCtlOutput(stdout) {
  const trimmed = String(stdout || '').trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (_) {}
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  for (const line of lines) {
    try {
      parsed.push(JSON.parse(line));
    } catch (_) {}
  }
  if (parsed.length === 1) return parsed[0];
  if (parsed.length > 1) return parsed;
  return trimmed;
}

function translateCtlError(rawMsg) {
  const msg = String(rawMsg || 'Unknown error').trim();
  const lower = msg.toLowerCase();
  if (lower.includes('tun_conflict')) {
    return 'TUN is held by another engine process. Close conflicting VPN client and try again.';
  }
  if (lower.includes('forbidden')) {
    return 'API access denied. Restart the engine.';
  }
  if (lower.includes('privilege') || lower.includes('administrator') || lower.includes('access is denied') || lower.includes('elevat')) {
    return 'TUN mode requires Administrator privileges (or switch to System Proxy).';
  }
  if (lower.includes('address already in use')) {
    return 'Port is in use. Close another running VPN client and try again.';
  }
  if (lower.includes('busy')) {
    return 'Engine is busy with another task. Please wait a second and try again.';
  }
  return msg;
}

function runCtl(args, options = {}) {
  const { thronectlExe, keyFile } = getPaths();
  if (!fs.existsSync(thronectlExe)) {
    return Promise.reject(new Error('thronectl.exe not found in runtime\\bin'));
  }
  if (!fs.existsSync(keyFile)) {
    return Promise.reject(new Error('api.key not created by engine yet'));
  }

  const cliTimeout = options.cliTimeout || '30s';
  const nodeTimeoutMs = options.nodeTimeoutMs || 35000;
  const fullArgs = ['--addr', API_ADDR, '--key-file', keyFile, '--json', '--timeout', cliTimeout, ...args];

  return new Promise((resolve, reject) => {
    const child = spawn(thronectlExe, fullArgs, {
      windowsHide: true,
      stdio: [options.stdinText != null ? 'pipe' : 'ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try { child.kill(); } catch (_) {}
        reject(new Error('Engine command timed out'));
      }
    }, nodeTimeoutMs);

    child.stdout.on('data', chunk => { stdout += chunk.toString('utf8'); });
    child.stderr.on('data', chunk => { stderr += chunk.toString('utf8'); });

    child.on('error', err => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });

    child.on('close', code => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const data = parseCtlOutput(stdout);
      if (code === 0) {
        resolve(data);
        return;
      }
      const errDetail = (data && (data.message || data.error)) || stderr || stdout || `thronectl exited with code ${code}`;
      reject(new Error(translateCtlError(errDetail)));
    });

    if (options.stdinText != null && child.stdin) {
      child.stdin.write(options.stdinText, 'utf8');
      child.stdin.end();
    }
  });
}

function normalizeStatus(raw) {
  if (!raw || typeof raw !== 'object') {
    return { state: 'stopped', runningId: null, runningName: '', tun: false, version: '' };
  }
  const state = String(raw.state || raw.status || (raw.running ? 'running' : 'stopped')).toLowerCase();
  const runningId = raw.profile_id ?? raw.running_id ?? raw.active_profile_id ?? (raw.profile && raw.profile.id) ?? null;
  const runningName = raw.profile_name || (raw.profile && raw.profile.name) || '';
  const tun = Boolean(raw.tun ?? raw.tun_mode ?? (raw.modes && raw.modes.tun));
  const version = raw.version || raw.throne_version || '';
  const tunConflict = raw.tun_conflict || '';
  return { state, runningId, runningName, tun, version, tunConflict };
}

function normalizeGroups(raw) {
  const list = Array.isArray(raw) ? raw : (raw && (raw.groups || raw.items)) || [];
  return list.map(g => ({
    id: Number(g.id ?? g.ID ?? 0),
    name: String(g.name ?? g.Name ?? 'Default'),
    url: String(g.url || g.subscription_url || ''),
    archive: Boolean(g.archive)
  })).filter(g => !g.archive);
}

let geoHostMap = null;
let profileExitMap = null;
const geoCooldownMap = new Map();
let geoLookupRunning = false;

function ensureGeoCachesLoaded() {
  if (geoHostMap && profileExitMap) return;
  const saved = readUiState();
  geoHostMap = new Map(Object.entries(saved.geoHostCache || {}));
  profileExitMap = new Map(Object.entries(saved.profileExitCache || {}));
}

function saveGeoHostCache() {
  if (!geoHostMap) return;
  const entries = Array.from(geoHostMap.entries()).slice(-2000);
  geoHostMap = new Map(entries);
  writeUiState({ geoHostCache: Object.fromEntries(entries) });
}

function saveProfileExitCache() {
  if (!profileExitMap) return;
  writeUiState({ profileExitCache: Object.fromEntries(profileExitMap.entries()) });
}

function normalizeProfiles(raw) {
  ensureGeoCachesLoaded();
  const list = Array.isArray(raw) ? raw : (raw && (raw.profiles || raw.items || raw.results)) || [];
  return list.map(p => {
    const id = Number(p.id ?? p.ID ?? 0);
    const groupId = Number(p.group_id ?? p.group ?? p.groupId ?? p.gid ?? 0);
    const type = String(p.type ?? p.protocol ?? p.outbound_type ?? 'PROXY').toUpperCase();
    const address = String(p.address ?? p.server ?? p.addr ?? '').trim();
    const port = p.port ? Number(p.port) : null;
    const rawName = String(p.name ?? p.Name ?? '').trim();
    const name = rawName || (address ? `${address}${port ? ':' + port : ''}` : `Profile #${id}`);

    let latency = p.latency ?? p.latency_ms ?? p.ping ?? p.delay ?? null;
    if (latency !== null && latency !== undefined) latency = Number(latency);
    const latencyAt = Number(p.latency_at ?? p.latencyAt ?? 0) || 0;
    const downloadBps = Number(p.download_bps ?? p.downloadBps ?? 0) || 0;
    const uploadBps = Number(p.upload_bps ?? p.uploadBps ?? 0) || 0;

    const cachedExit = profileExitMap.get(String(id));
    let country = String(p.country || p.country_code || '').trim().toUpperCase();
    let ipOut = String(p.ip_out ?? p.ipOut ?? '').trim();
    let countryVerified = Boolean(country);

    if (!country && cachedExit && cachedExit.country) {
      country = cachedExit.country;
      countryVerified = true;
    }
    if (!ipOut && cachedExit && cachedExit.ipOut) {
      ipOut = cachedExit.ipOut;
    }

    if (!country) {
      const fromLabel = detectCountryFromLabel(name, address);
      if (fromLabel !== 'WW') {
        country = fromLabel;
      } else if (address && geoHostMap.has(address.toLowerCase())) {
        country = geoHostMap.get(address.toLowerCase());
      }
    }

    return {
      id,
      groupId,
      name,
      type,
      address,
      port,
      latency,
      latencyAt,
      downloadBps,
      uploadBps,
      country,
      countryVerified,
      ipOut
    };
  });
}

function fetchIpApiBatch(ips) {
  return new Promise(resolve => {
    const body = JSON.stringify(ips);
    const req = http.request(
      {
        hostname: 'ip-api.com',
        path: '/batch?fields=query,countryCode,status',
        method: 'POST',
        timeout: 6000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      res => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            resolve(Array.isArray(parsed) ? parsed : []);
          } catch (_) {
            resolve([]);
          }
        });
      }
    );
    req.on('timeout', () => { req.destroy(); resolve([]); });
    req.on('error', () => resolve([]));
    req.end(body);
  });
}

async function resolveMissingGeoInBackground() {
  if (geoLookupRunning) return;
  ensureGeoCachesLoaded();

  const now = Date.now();
  const pendingHosts = new Set();
  for (const p of cachedProfiles) {
    if (p.country || !p.address) continue;
    const hostKey = p.address.toLowerCase();
    if (geoHostMap.has(hostKey)) continue;
    if ((geoCooldownMap.get(hostKey) || 0) > now) continue;
    pendingHosts.add(p.address);
  }
  if (pendingHosts.size === 0) return;

  geoLookupRunning = true;
  try {
    const hosts = Array.from(pendingHosts).slice(0, 150);
    const ipToHosts = new Map();

    let idx = 0;
    await Promise.all(Array.from({ length: Math.min(10, hosts.length) }, async () => {
      while (idx < hosts.length) {
        const host = hosts[idx++];
        let ip = host;
        if (net.isIP(host) === 0) {
          try {
            const res = await dns.promises.lookup(host, { family: 4 });
            ip = res.address;
          } catch (_) {
            geoCooldownMap.set(host.toLowerCase(), Date.now() + 120000);
            continue;
          }
        }
        if (!ipToHosts.has(ip)) ipToHosts.set(ip, []);
        ipToHosts.get(ip).push(host.toLowerCase());
      }
    }));

    const uniqueIps = Array.from(ipToHosts.keys());
    let changed = false;

    for (let i = 0; i < uniqueIps.length; i += 100) {
      const batch = uniqueIps.slice(i, i + 100);
      const results = await fetchIpApiBatch(batch);
      if (results.length === 0) {
        for (const ip of batch) {
          for (const h of (ipToHosts.get(ip) || [])) {
            geoCooldownMap.set(h, Date.now() + 120000);
          }
        }
        continue;
      }

      for (const item of results) {
        if (!item || item.status !== 'success' || !item.countryCode) continue;
        const cc = String(item.countryCode).trim().toUpperCase();
        if (!/^[A-Z]{2}$/.test(cc)) continue;
        geoHostMap.set(String(item.query).toLowerCase(), cc);
        for (const h of (ipToHosts.get(item.query) || [])) {
          geoHostMap.set(h, cc);
        }
        changed = true;
      }
    }

    if (changed) {
      saveGeoHostCache();
      for (const p of cachedProfiles) {
        if (!p.country && p.address) {
          const cc = geoHostMap.get(p.address.toLowerCase());
          if (cc) p.country = cc;
        }
      }
      broadcastState();
    }
  } finally {
    geoLookupRunning = false;
  }
}

async function detectProxyEndpoint() {
  try {
    const s = await runCtl(['settings', 'get'], { cliTimeout: '8s', nodeTimeoutMs: 10000 });
    if (s && typeof s === 'object') {
      const addr = s.inbound_address || s.listen || '127.0.0.1';
      const port = s.inbound_socks_port || s.mixed_port || s.inbound_port || s.port;
      if (port && Number(port) > 0) {
        const host = (addr === '0.0.0.0' || addr === '::') ? '127.0.0.1' : String(addr);
        proxyEndpoint = `${host}:${Number(port)}`;
        return;
      }
    }
  } catch (_) {}
  proxyEndpoint = DEFAULT_PROXY_ENDPOINT;
}

async function applyOptimalScanSettings() {
  try {
    const current = await runCtl(['settings', 'get'], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => null);
    await runCtl(
      [
        'settings',
        'set',
        `test_url=${REAL_TEST_URL}`,
        `test_concurrency=${SCAN_CONCURRENCY}`,
        `test_timeout_ms=${SCAN_TIMEOUT_MS}`
      ],
      { cliTimeout: '5s', nodeTimeoutMs: 6000 }
    );
    if (current && typeof current === 'object' && 'speed_test_timeout_ms' in current) {
      const stMs = Number(current.speed_test_timeout_ms || 0);
      if (stMs > 0 && stMs < 15000) {
        await runCtl(['settings', 'set', 'speed_test_timeout_ms=15000'], {
          cliTimeout: '4s',
          nodeTimeoutMs: 5000
        }).catch(() => {});
      }
    }
    addLog(`Real HTTPS scan tuning active: url=${REAL_TEST_URL}, concurrency=${SCAN_CONCURRENCY}, timeout=${SCAN_TIMEOUT_MS}ms`);
  } catch (err) {
    addLog('Scan tuning skipped: ' + err.message);
  }
}

async function refreshSnapshot() {
  if (engineState.phase !== 'ready') return getFullSnapshot();
  ensureGeoCachesLoaded();
  try {
    let groupsOk = false;
    let profilesOk = false;
    const [rawStatus, rawGroups, rawProfiles] = await Promise.all([
      runCtl(['status']),
      runCtl(['groups']).then(r => { groupsOk = true; return r; }).catch(() => null),
      runCtl(['profiles'], { cliTimeout: '20s', nodeTimeoutMs: 25000 }).then(r => { profilesOk = true; return r; }).catch(() => null)
    ]);
    cachedStatus = normalizeStatus(rawStatus);
    if (groupsOk) cachedGroups = normalizeGroups(rawGroups);
    if (profilesOk) cachedProfiles = normalizeProfiles(rawProfiles);

    const saved = readUiState();
    if (groupsOk && saved.smartSubs && typeof saved.smartSubs === 'object') {
      const groupIdSet = new Set(cachedGroups.map(g => String(g.id)));
      let dirty = false;
      const nextSmart = {};
      for (const [gid, meta] of Object.entries(saved.smartSubs)) {
        if (groupIdSet.has(gid)) nextSmart[gid] = meta;
        else dirty = true;
      }
      if (dirty) writeUiState({ smartSubs: nextSmart });
    }

    if (profilesOk && profileExitMap.size > 0) {
      const profIdSet = new Set(cachedProfiles.map(p => String(p.id)));
      let exitDirty = false;
      for (const key of Array.from(profileExitMap.keys())) {
        if (!profIdSet.has(key)) {
          profileExitMap.delete(key);
          exitDirty = true;
        }
      }
      if (exitDirty) saveProfileExitCache();
    }

    const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);
    if (cachedStatus.tun) {
      currentMode = 'tun';
    }
    if (!isConnected && systemProxyActive) {
      await restoreSystemProxy();
    }
  } catch (err) {
    addLog('Refresh error: ' + err.message);
  }
  resolveMissingGeoInBackground().catch(() => {});
  updateTrayMenu();
  return getFullSnapshot();
}

function getFullSnapshot() {
  const saved = readUiState();
  return {
    engine: engineState,
    status: cachedStatus,
    groups: cachedGroups,
    profiles: cachedProfiles,
    mode: currentMode,
    systemProxyActive,
    proxyEndpoint,
    builtinSources: BUILTIN_SOURCES,
    smartSubs: saved.smartSubs || {},
    logs: engineLogs.slice(-80)
  };
}

function broadcastState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('app:state-changed', getFullSnapshot());
  }
}

function emitLatencyProgress(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('app:latency-progress', payload);
  }
}

/* =========================================================================
   Smart Subscription Filter & Fast TCP Pre-Probe (cuts 10k junk -> top 120)
   ========================================================================= */

function decodeBase64Safe(input) {
  let clean = String(input || '').trim().replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
  if (!clean) return '';
  const pad = clean.length % 4;
  if (pad === 2) clean += '==';
  else if (pad === 3) clean += '=';
  else if (pad === 1) return '';
  try {
    return Buffer.from(clean, 'base64').toString('utf8');
  } catch (_) {
    return '';
  }
}

function detectCountryFromLabel(name, address = '') {
  const raw = String(name || '');
  for (const [code, codeRe] of COUNTRY_NAME_RULES) {
    const flag = codeRe.source.split('|')[0];
    if (flag && raw.includes(flag)) return code;
  }
  const cleaned = raw.replace(/https?:\/\/\S+|t\.me\/\S+|@\S+/gi, ' ').trim();
  for (const [code, , wordRe] of COUNTRY_NAME_RULES) {
    if (wordRe && wordRe.test(cleaned)) return code;
  }
  for (const [code, codeRe] of COUNTRY_NAME_RULES) {
    if (codeRe.test(cleaned)) return code;
  }
  const host = String(address || '').trim().toLowerCase();
  const tldMatch = host.match(/\.(de|nl|pl|fi|ee|lv|lt|se|fr|ch|cz|at|no|dk|be|ie|es|it|pt|gr|ro|hu|sk|bg|md|lu|is|cy|rs|hr|si|sg|jp|kr|tw|au|nz|ua|tr|ae|il|br|kz|am|ge|az|uz|in|ru|by|cn|hk|ir)$/);
  if (tldMatch) return tldMatch[1].toUpperCase();
  return 'WW';
}

function isPrivateOrInvalidHost(host) {
  const h = String(host || '').trim().toLowerCase();
  if (!h || h === 'localhost' || h === '0.0.0.0' || h === '::1' || h === '127.0.0.1') return true;
  if (h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (h.includes(':') && (/^f[cd]/.test(h) || /^fe[89ab]/.test(h))) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return true;
  const m172 = h.match(/^172\.(\d+)\./);
  if (m172 && Number(m172[1]) >= 16 && Number(m172[1]) <= 31) return true;
  return false;
}

function extractProxyMeta(rawLine) {
  let line = String(rawLine || '').trim().replace(/&amp;/g, '&');
  if (!line || line.startsWith('#') || line.startsWith('//')) return null;

  const protoMatch = line.match(/^(vless|vmess|trojan|ss|hy2|hysteria2|tuic):\/\//i);
  if (!protoMatch) return null;
  const proto = protoMatch[1].toLowerCase();

  let host = '';
  let port = 0;
  let name = '';
  let security = '';
  let sni = '';
  let pathVal = '';
  let allowInsecure = false;

  try {
    if (proto === 'vmess') {
      const bodyAndHash = line.slice('vmess://'.length);
      const hashIdx = bodyAndHash.indexOf('#');
      const rawB64 = hashIdx >= 0 ? bodyAndHash.slice(0, hashIdx) : bodyAndHash;
      if (hashIdx >= 0) {
        try { name = decodeURIComponent(bodyAndHash.slice(hashIdx + 1)); } catch (_) { name = bodyAndHash.slice(hashIdx + 1); }
      }
      if (rawB64.includes('@')) {
        const u = new URL(line);
        host = u.hostname.replace(/^\[|\]$/g, '');
        port = Number(u.port || 0);
        if (!port && (proto === 'hy2' || proto === 'hysteria2')) {
          const mport = u.searchParams.get('mport') || '';
          const firstPort = mport.match(/\d+/);
          port = firstPort ? Number(firstPort[0]) : 443;
        }
        if (!name && u.hash) {
          try { name = decodeURIComponent(u.hash.slice(1)); } catch (_) { name = u.hash.slice(1); }
        }
        security = (u.searchParams.get('security') || u.searchParams.get('tls') || '').toLowerCase();
        sni = (u.searchParams.get('sni') || u.searchParams.get('host') || '').toLowerCase();
        pathVal = u.searchParams.get('path') || '';
      } else {
        const decoded = decodeBase64Safe(rawB64);
        if (!decoded) return null;
        const cfg = JSON.parse(decoded);
        host = String(cfg.add || cfg.host_ip || '').trim().replace(/^\[|\]$/g, '');
        port = Number(cfg.port || 0);
        name = String(cfg.ps || name || '');
        security = String(cfg.tls || '').toLowerCase();
        sni = String(cfg.sni || cfg.host || '').toLowerCase();
        pathVal = String(cfg.path || '');
        allowInsecure = Boolean(cfg.allowInsecure || cfg.insecure === 1 || cfg.insecure === '1');
      }
    } else if (proto === 'ss') {
      const rest = line.slice('ss://'.length);
      const hashIdx = rest.indexOf('#');
      if (hashIdx >= 0) {
        try { name = decodeURIComponent(rest.slice(hashIdx + 1)); } catch (_) { name = rest.slice(hashIdx + 1); }
      }
      const noHash = hashIdx >= 0 ? rest.slice(0, hashIdx) : rest;
      const qIdx = noHash.indexOf('?');
      const mainPart = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;
      const atIdx = mainPart.lastIndexOf('@');
      let hostPort = '';
      if (atIdx >= 0) {
        hostPort = mainPart.slice(atIdx + 1);
      } else {
        const decoded = decodeBase64Safe(mainPart);
        const dAt = decoded.lastIndexOf('@');
        if (dAt >= 0) hostPort = decoded.slice(dAt + 1);
      }
      hostPort = hostPort.replace(/\/+$/, '');
      if (hostPort.startsWith('[')) {
        const closeIdx = hostPort.indexOf(']');
        if (closeIdx > 0) {
          host = hostPort.slice(1, closeIdx);
          port = Number(hostPort.slice(closeIdx + 2) || 0);
        }
      } else {
        const colonIdx = hostPort.lastIndexOf(':');
        if (colonIdx > 0) {
          host = hostPort.slice(0, colonIdx);
          port = Number(hostPort.slice(colonIdx + 1) || 0);
        }
      }
    } else {
      try {
        const u = new URL(line);
        host = u.hostname.replace(/^\[|\]$/g, '');
        port = Number(u.port || 0);
        if (!port && (proto === 'hy2' || proto === 'hysteria2')) {
          const mport = u.searchParams.get('mport') || '';
          const firstPort = mport.match(/\d+/);
          port = firstPort ? Number(firstPort[0]) : 443;
        }
        if (u.hash) {
          try { name = decodeURIComponent(u.hash.slice(1)); } catch (_) { name = u.hash.slice(1); }
        }
        security = (u.searchParams.get('security') || '').toLowerCase();
        sni = (u.searchParams.get('sni') || u.searchParams.get('peer') || u.searchParams.get('host') || '').toLowerCase();
        pathVal = u.searchParams.get('path') || u.searchParams.get('serviceName') || '';
        const insec = u.searchParams.get('allowInsecure') || u.searchParams.get('insecure');
        allowInsecure = insec === '1' || insec === 'true';
      } catch (_) {
        const hashIdx = line.indexOf('#');
        const noHash = hashIdx >= 0 ? line.slice(0, hashIdx) : line;
        if (hashIdx >= 0) name = line.slice(hashIdx + 1);
        const m = noHash.match(/^[a-z0-9]+:\/\/[^@]*@(\[[^\]]+\]|[^:\/?#]+):(\d+)/i);
        if (!m) return null;
        host = m[1].replace(/^\[|\]$/g, '');
        port = Number(m[2] || 0);
      }
    }
  } catch (_) {
    return null;
  }

  if (!host || !Number.isFinite(port) || port < 1 || port > 65535) return null;
  if (isPrivateOrInvalidHost(host)) return null;

  const hostLower = host.toLowerCase();
  if (
    hostLower.endsWith('.ru') ||
    hostLower.endsWith('.by') ||
    hostLower.endsWith('.cn') ||
    hostLower.endsWith('.ir') ||
    hostLower.endsWith('.kp')
  ) {
    return null;
  }

  const country = detectCountryFromLabel(name, host);
  if (BLOCKED_AI_COUNTRIES.has(country)) {
    return null;
  }

  const isUdp = proto === 'hy2' || proto === 'hysteria2' || proto === 'tuic';
  if (allowInsecure && !isUdp) {
    return null;
  }

  let score = 0;
  if (proto === 'vless') {
    if (security === 'reality') score += 55;
    else if (security === 'tls') score += 38;
    else score += 12;
  } else if (proto === 'hy2' || proto === 'hysteria2') {
    score += 36;
  } else if (proto === 'tuic') {
    score += 34;
  } else if (proto === 'trojan') {
    score += 28;
  } else if (proto === 'vmess') {
    score += security === 'tls' ? 20 : 8;
  } else if (proto === 'ss') {
    score += 2;
  }

  if (EU_TIER1_COUNTRIES.has(country)) score += 45;
  else if (EU_TIER2_COUNTRIES.has(country)) score += 28;
  else if (AI_TIER3_COUNTRIES.has(country)) score += 14;

  if (port === 443 || port === 8443 || port === 2053 || port === 2083 || port === 2087 || port === 2096) {
    score += 6;
  }

  const dedupKey = `${proto}|${hostLower}|${port}|${sni}|${pathVal}`;
  return {
    line,
    proto,
    host,
    port,
    isUdp,
    country,
    name: name || `${host}:${port}`,
    score,
    dedupKey
  };
}

async function resolveHostIpv4(host) {
  const clean = String(host || '').trim().replace(/^\[|\]$/g, '');
  if (!clean) return '';
  if (net.isIP(clean) !== 0) return clean;
  try {
    const addrs = await Promise.race([
      dns.promises.resolve4(clean),
      sleep(1500).then(() => null)
    ]);
    if (Array.isArray(addrs) && addrs.length > 0) return addrs[0];
  } catch (_) {}
  try {
    const res = await Promise.race([
      dns.promises.lookup(clean, { family: 4 }),
      sleep(1500).then(() => null)
    ]);
    if (res && res.address) return res.address;
  } catch (_) {}
  return clean;
}

function probeTcpOnce(host, port, timeoutMs = 2000) {
  return new Promise(resolve => {
    const start = Date.now();
    const socket = net.connect({ host, port });
    let done = false;
    const finish = (rtt) => {
      if (done) return;
      done = true;
      try { socket.destroy(); } catch (_) {}
      resolve(rtt);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(Math.max(1, Date.now() - start)));
    socket.once('timeout', () => finish(-1));
    socket.once('error', () => finish(-1));
  });
}

async function probeTcpBatch(candidates, concurrency = 45, timeoutMs = 2000) {
  if (!candidates.length) return [];
  const results = new Array(candidates.length);
  const resolvedCache = new Map();
  let cursor = 0;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= candidates.length) break;
      const item = candidates[idx];
      const hostKey = item.host.toLowerCase();
      let targetIp = resolvedCache.get(hostKey);
      if (!targetIp) {
        targetIp = await resolveHostIpv4(item.host);
        resolvedCache.set(hostKey, targetIp);
      }
      const rtt = targetIp ? await probeTcpOnce(targetIp, item.port, timeoutMs) : -1;
      results[idx] = { ...item, tcpMs: rtt };
    }
  }

  const workerCount = Math.min(concurrency, candidates.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function curateLinksList(rawLines, maxKeep = SMART_IMPORT_LIMIT) {
  const seen = new Set();
  const parsed = [];

  for (const raw of rawLines) {
    const meta = extractProxyMeta(raw);
    if (!meta) continue;
    if (seen.has(meta.dedupKey)) continue;
    seen.add(meta.dedupKey);
    parsed.push(meta);
  }

  if (parsed.length === 0) {
    return { lines: [], totalRaw: rawLines.length, parsedCount: 0, aliveTcpCount: 0 };
  }

  parsed.sort((a, b) => b.score - a.score);

  const tunActive = cachedStatus.tun && ['running', 'connected', 'started'].includes(cachedStatus.state);
  const maxProbeTcp = tunActive ? 500 : 2200;

  const tcpCandidates = [];
  const udpCandidates = [];
  for (const item of parsed) {
    if (item.isUdp) {
      if (udpCandidates.length < 180) udpCandidates.push(item);
    } else if (tcpCandidates.length < maxProbeTcp) {
      tcpCandidates.push(item);
    }
  }

  const probedTcp = await probeTcpBatch(tcpCandidates, tunActive ? 20 : 45, 2000);
  const aliveTcp = probedTcp.filter(x => x.tcpMs > 0);
  aliveTcp.sort((a, b) => (b.score - b.tcpMs * 0.35) - (a.score - a.tcpMs * 0.35));

  const selected = [];
  const ipCounts = new Map();
  const udpReserve = Math.min(20, udpCandidates.length);
  const tcpQuota = Math.max(20, maxKeep - udpReserve);

  for (const item of aliveTcp) {
    if (selected.length >= tcpQuota) break;
    const ipKey = item.host.toLowerCase();
    const c = ipCounts.get(ipKey) || 0;
    if (c >= 4) continue;
    ipCounts.set(ipKey, c + 1);
    selected.push(item);
  }

  for (const item of udpCandidates) {
    if (selected.length >= maxKeep) break;
    const ipKey = item.host.toLowerCase();
    const c = ipCounts.get(ipKey) || 0;
    if (c >= 3) continue;
    ipCounts.set(ipKey, c + 1);
    selected.push(item);
  }

  if (selected.length < Math.min(12, maxKeep)) {
    for (const item of parsed) {
      if (selected.length >= Math.min(maxKeep, 40)) break;
      if (!selected.some(s => s.dedupKey === item.dedupKey)) {
        selected.push(item);
      }
    }
  }

  return {
    lines: selected.map(x => x.line),
    totalRaw: rawLines.length,
    parsedCount: parsed.length,
    aliveTcpCount: aliveTcp.length
  };
}

function fetchUrlText(targetUrl, maxBytes = 12 * 1024 * 1024, timeoutMs = 20000, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (_) {
      reject(new Error('Invalid URL: ' + targetUrl));
      return;
    }

    const mod = parsedUrl.protocol === 'https:' ? https : http;
    const req = mod.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'v2rayNG/1.9.0',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate'
        }
      },
      res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
          res.resume();
          const nextUrl = new URL(res.headers.location, targetUrl).toString();
          fetchUrlText(nextUrl, maxBytes, timeoutMs, redirectsLeft - 1).then(resolve, reject);
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(new Error(`Subscription download failed (HTTP ${res.statusCode})`));
          return;
        }

        let stream = res;
        const enc = String(res.headers['content-encoding'] || '').toLowerCase();
        if (enc === 'gzip') stream = res.pipe(zlib.createGunzip());
        else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());

        const chunks = [];
        let total = 0;
        stream.on('data', chunk => {
          total += chunk.length;
          if (total > maxBytes) {
            req.destroy(new Error('Subscription file too large'));
            return;
          }
          chunks.push(chunk);
        });
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        stream.on('error', reject);
      }
    );

    req.on('timeout', () => req.destroy(new Error('Subscription request timed out')));
    req.on('error', reject);
    req.end();
  });
}

function extractShareLinkLinesFromBody(bodyText) {
  const trimmed = String(bodyText || '').trim();
  if (!trimmed) return [];
  if (/^\s*(proxies:|outbounds:|mixed-port:|port:)/m.test(trimmed)) {
    return null;
  }

  let text = trimmed;
  if (!/(?:vless|vmess|trojan|ss|hy2|hysteria2|tuic):\/\//i.test(text)) {
    const decoded = decodeBase64Safe(text);
    if (decoded && /(?:vless|vmess|trojan|ss|hy2|hysteria2|tuic):\/\//i.test(decoded)) {
      text = decoded;
    }
  }

  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => /^(?:vless|vmess|trojan|ss|hy2|hysteria2|tuic):\/\//i.test(l));
}

async function createOrGetSmartGroup(groupName, existingGroup) {
  if (existingGroup && !existingGroup.url) {
    return existingGroup.id;
  }
  if (!existingGroup) {
    const byName = cachedGroups.find(g => g.name === groupName && !g.url);
    if (byName) return byName.id;
  }

  if (existingGroup && existingGroup.url && existingGroup.id > 0) {
    const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);
    const runId = Number(cachedStatus.runningId);
    if (isConnected && cachedProfiles.some(p => p.id === runId && p.groupId === existingGroup.id)) {
      await handleDisconnect().catch(() => {});
    }
    await runCtl(['group', 'rm', String(existingGroup.id)], { cliTimeout: '60s', nodeTimeoutMs: 65000 }).catch(() => {});
  }

  const created = await runCtl(['group', 'add', groupName], { cliTimeout: '10s', nodeTimeoutMs: 12000 });
  const directId = created && typeof created === 'object'
    ? Number(created.id ?? created.ID ?? (created.group && created.group.id) ?? 0)
    : 0;
  if (directId > 0) return directId;

  const groups = normalizeGroups(await runCtl(['groups'], { cliTimeout: '8s', nodeTimeoutMs: 10000 }));
  const matched = groups.filter(g => g.name === groupName && !g.url).sort((a, b) => b.id - a.id)[0];
  if (!matched) throw new Error('Failed to create group: ' + groupName);
  return matched.id;
}

async function smartImportSubscription(url, groupName, existingGroup = null) {
  addLog(`Smart import fetching: ${url}`);
  const body = await fetchUrlText(url);
  const rawLines = extractShareLinkLinesFromBody(body);

  if (rawLines === null || rawLines.length === 0) {
    return { fallbackToRaw: true };
  }

  const curated = await curateLinksList(rawLines, SMART_IMPORT_LIMIT);
  if (curated.lines.length === 0) {
    throw new Error('No valid AI-compatible (non-RU/CN/BY) servers found in this subscription');
  }

  const targetGroupId = await createOrGetSmartGroup(groupName, existingGroup);

  const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);
  const runId = Number(cachedStatus.runningId);
  if (isConnected && cachedProfiles.some(p => p.id === runId && p.groupId === targetGroupId)) {
    await handleDisconnect().catch(() => {});
  }

  try {
    await runCtl(['profile', 'rm', '--group', String(targetGroupId)], { cliTimeout: '45s', nodeTimeoutMs: 50000 });
  } catch (_) {
    const rawProfs = await runCtl(['profiles'], { cliTimeout: '20s', nodeTimeoutMs: 25000 }).catch(() => null);
    if (rawProfs) {
      const oldIds = normalizeProfiles(rawProfs).filter(p => p.groupId === targetGroupId).map(p => p.id);
      if (oldIds.length > 0) await deleteProfilesChunked(oldIds);
    }
  }

  const payload = curated.lines.join('\n');
  await runCtl(['import', '--group', String(targetGroupId), '-'], {
    stdinText: payload,
    cliTimeout: '60s',
    nodeTimeoutMs: 65000
  });

  const saved = readUiState();
  const smartSubs = { ...(saved.smartSubs || {}) };
  smartSubs[String(targetGroupId)] = {
    url,
    name: groupName,
    updatedAt: Date.now(),
    rawCount: curated.totalRaw,
    keptCount: curated.lines.length
  };
  writeUiState({ smartSubs });

  addLog(`Smart import "${groupName}": ${curated.totalRaw} raw -> ${curated.parsedCount} non-blocked -> ${curated.aliveTcpCount} TCP-alive -> imported top ${curated.lines.length}`);

  return {
    fallbackToRaw: false,
    groupId: targetGroupId,
    rawCount: curated.totalRaw,
    aliveTcpCount: curated.aliveTcpCount,
    keptCount: curated.lines.length
  };
}

/* =========================================================================
   Real End-to-End HTTPS Proxy Probe (Gemini / AI Studio / ChatGPT / Claude)
   ========================================================================= */

function parseProxyEndpoint() {
  const idx = proxyEndpoint.lastIndexOf(':');
  if (idx <= 0) return { host: '127.0.0.1', port: 2080 };
  return {
    host: proxyEndpoint.slice(0, idx).replace(/^\[|\]$/g, ''),
    port: Number(proxyEndpoint.slice(idx + 1)) || 2080
  };
}

function connectViaHttpConnect(proxyHost, proxyPort, targetHost, targetPort, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: proxyHost, port: proxyPort });
    let buffer = Buffer.alloc(0);
    let settled = false;

    const fail = (err) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch (_) {}
      reject(err);
    };

    const onClose = () => fail(new Error('Proxy closed connection early'));
    socket.setTimeout(timeoutMs);
    socket.once('timeout', () => fail(new Error('Proxy CONNECT timeout')));
    socket.once('error', fail);
    socket.once('close', onClose);

    socket.once('connect', () => {
      socket.write(
        `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\n` +
        `Host: ${targetHost}:${targetPort}\r\n` +
        `Proxy-Connection: keep-alive\r\n\r\n`
      );
    });

    const onData = (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) {
        if (buffer.length > 8192) fail(new Error('Invalid proxy CONNECT header'));
        return;
      }
      socket.removeListener('data', onData);
      const head = buffer.slice(0, headerEnd).toString('ascii');
      const statusMatch = head.match(/^HTTP\/\d\.\d\s+(\d{3})/);
      if (!statusMatch || Number(statusMatch[1]) !== 200) {
        fail(new Error('Proxy CONNECT rejected: ' + head.split('\r\n')[0]));
        return;
      }
      settled = true;
      socket.setTimeout(0);
      socket.pause();
      const leftover = buffer.slice(headerEnd + 4);
      socket.removeListener('close', onClose);
      resolve({ socket, leftover });
    };

    socket.on('data', onData);
  });
}

function connectViaSocks5(proxyHost, proxyPort, targetHost, targetPort, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: proxyHost, port: proxyPort });
    let stage = 0;
    let buf = Buffer.alloc(0);
    let settled = false;

    const fail = (err) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch (_) {}
      reject(err);
    };

    const onClose = () => fail(new Error('SOCKS5 closed connection early'));
    socket.setTimeout(timeoutMs);
    socket.once('timeout', () => fail(new Error('SOCKS5 timeout')));
    socket.once('error', fail);
    socket.once('close', onClose);

    socket.once('connect', () => {
      socket.write(Buffer.from([0x05, 0x01, 0x00]));
    });

    const onData = (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (stage === 0) {
        if (buf.length < 2) return;
        if (buf[0] !== 0x05 || buf[1] !== 0x00) {
          fail(new Error('SOCKS5 auth unsupported'));
          return;
        }
        buf = buf.slice(2);
        stage = 1;
        const hostBuf = Buffer.from(targetHost, 'utf8');
        const req = Buffer.alloc(7 + hostBuf.length);
        req[0] = 0x05;
        req[1] = 0x01;
        req[2] = 0x00;
        req[3] = 0x03;
        req[4] = hostBuf.length;
        hostBuf.copy(req, 5);
        req.writeUInt16BE(targetPort, 5 + hostBuf.length);
        socket.write(req);
      } else if (stage === 1) {
        if (buf.length < 4) return;
        const atyp = buf[3];
        let needLen = 4;
        if (atyp === 1) needLen = 10;
        else if (atyp === 3) {
          if (buf.length < 5) return;
          needLen = 5 + buf[4] + 2;
        } else if (atyp === 4) needLen = 22;
        else {
          fail(new Error('SOCKS5 bad address type'));
          return;
        }
        if (buf.length < needLen) return;
        if (buf[1] !== 0x00) {
          fail(new Error('SOCKS5 connect failed: ' + buf[1]));
          return;
        }
        socket.removeListener('data', onData);
        settled = true;
        socket.setTimeout(0);
        socket.pause();
        const leftover = buf.slice(needLen);
        socket.removeListener('close', onClose);
        resolve({ socket, leftover });
      }
    };

    socket.on('data', onData);
  });
}

function decodeChunkedBody(rawBuf) {
  const chunks = [];
  let pos = 0;
  while (pos < rawBuf.length) {
    const lineEnd = rawBuf.indexOf('\r\n', pos);
    if (lineEnd === -1) break;
    const sizeStr = rawBuf.slice(pos, lineEnd).toString('ascii').split(';')[0].trim();
    const len = parseInt(sizeStr, 16);
    if (!Number.isFinite(len) || len <= 0) break;
    const dataStart = lineEnd + 2;
    const dataEnd = Math.min(rawBuf.length, dataStart + len);
    chunks.push(rawBuf.slice(dataStart, dataEnd));
    pos = dataEnd + 2;
  }
  return Buffer.concat(chunks);
}

async function proxyHttpsGet(host, urlPath, options = {}) {
  const timeoutMs = options.timeoutMs || 5500;
  const maxBodyBytes = options.maxBodyBytes || 196608;
  const { host: proxyHost, port: proxyPort } = parseProxyEndpoint();
  const startedAt = Date.now();

  let tunnel;
  try {
    tunnel = await connectViaHttpConnect(proxyHost, proxyPort, host, 443, Math.min(timeoutMs, 3500));
  } catch (_) {
    tunnel = await connectViaSocks5(proxyHost, proxyPort, host, 443, Math.min(timeoutMs, 3500));
  }

  if (tunnel.leftover && tunnel.leftover.length > 0) {
    tunnel.socket.unshift(tunnel.leftover);
  }

  return new Promise((resolve, reject) => {
    const tlsSocket = tls.connect({
      socket: tunnel.socket,
      servername: host,
      ALPNProtocols: ['http/1.1']
    });

    let settled = false;
    const rawChunks = [];
    let totalRaw = 0;
    let bodyStartTime = 0;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try { tlsSocket.destroy(); } catch (_) {}
        reject(new Error(`HTTPS timeout for ${host}`));
      }
    }, timeoutMs);

    const finishFromBuffer = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { tlsSocket.destroy(); } catch (_) {}

      const fullBuf = Buffer.concat(rawChunks);
      const sep = fullBuf.indexOf('\r\n\r\n');
      if (sep === -1) {
        reject(new Error(`Empty HTTP response from ${host}`));
        return;
      }
      const headStr = fullBuf.slice(0, sep).toString('latin1');
      const headLines = headStr.split('\r\n');
      const statusMatch = headLines[0].match(/^HTTP\/\d\.\d\s+(\d{3})/);
      const statusCode = statusMatch ? Number(statusMatch[1]) : 0;
      const headers = {};
      for (let i = 1; i < headLines.length; i++) {
        const cIdx = headLines[i].indexOf(':');
        if (cIdx > 0) {
          const k = headLines[i].slice(0, cIdx).trim().toLowerCase();
          const v = headLines[i].slice(cIdx + 1).trim();
          headers[k] = v;
        }
      }

      let bodyBuf = fullBuf.slice(sep + 4);
      if (String(headers['transfer-encoding'] || '').toLowerCase().includes('chunked')) {
        const decoded = decodeChunkedBody(bodyBuf);
        if (decoded.length > 0) bodyBuf = decoded;
      }

      const elapsedMs = Math.max(1, Date.now() - startedAt);
      const rawTransfer = bodyStartTime > 0 ? (Date.now() - bodyStartTime) : 0;
      const transferMs = rawTransfer > 25 ? rawTransfer : elapsedMs;

      resolve({
        statusCode,
        headers,
        bodyBytes: bodyBuf.length,
        bodyText: options.skipBodyText ? '' : bodyBuf.toString('utf8', 0, Math.min(bodyBuf.length, 32768)),
        elapsedMs,
        transferMs
      });
    };

    tlsSocket.once('error', err => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { tlsSocket.destroy(); } catch (_) {}
      reject(err);
    });

    tlsSocket.once('secureConnect', () => {
      tlsSocket.write(
        `GET ${urlPath} HTTP/1.1\r\n` +
        `Host: ${host}\r\n` +
        `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36\r\n` +
        `Accept: text/html,application/json,*/*\r\n` +
        `Accept-Encoding: identity\r\n` +
        `Connection: close\r\n\r\n`
      );
    });

    tlsSocket.on('data', chunk => {
      if (!bodyStartTime) bodyStartTime = Date.now();
      rawChunks.push(chunk);
      totalRaw += chunk.length;
      if (totalRaw >= maxBodyBytes + 16384) {
        finishFromBuffer();
      }
    });

    tlsSocket.once('end', finishFromBuffer);
    tlsSocket.once('close', finishFromBuffer);
  });
}

async function checkAiAndIpInternal({ withSpeed = false } = {}) {
  const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);
  if (!isConnected) {
    throw new Error('Connect to a server first');
  }

  const tracePromise = proxyHttpsGet('www.cloudflare.com', '/cdn-cgi/trace', { timeoutMs: 5000 })
    .then(res => {
      const map = {};
      for (const line of res.bodyText.split(/\r?\n/)) {
        const eq = line.indexOf('=');
        if (eq > 0) map[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }
      return {
        ok: Boolean(map.ip),
        ip: map.ip || '',
        country: (map.loc || '').toUpperCase(),
        colo: map.colo || '',
        rttMs: res.elapsedMs
      };
    })
    .catch(() => ({ ok: false, ip: '', country: '', colo: '', rttMs: 0 }));

  const googleApiGeoPromise = proxyHttpsGet('generativelanguage.googleapis.com', '/v1beta/models', { timeoutMs: 5500 })
    .then(res => {
      const low = res.bodyText.toLowerCase();
      const geoBlocked = low.includes('location is not supported') || low.includes('user location');
      return { reachable: true, geoBlocked, status: res.statusCode, ms: res.elapsedMs };
    })
    .catch(err => ({ reachable: false, geoBlocked: false, status: 0, error: err.message }));

  const geminiWebPromise = proxyHttpsGet('gemini.google.com', '/', { timeoutMs: 5500 })
    .then(res => {
      const loc = String(res.headers.location || '').toLowerCase();
      const blocked = res.statusCode === 403 || res.statusCode === 451 || loc.includes('unavailable') || loc.includes('sorry/index');
      return { reachable: res.statusCode > 0 && res.statusCode < 500, blocked, status: res.statusCode, ms: res.elapsedMs };
    })
    .catch(err => ({ reachable: false, blocked: false, status: 0, error: err.message }));

  const studioWebPromise = proxyHttpsGet('aistudio.google.com', '/', { timeoutMs: 5500 })
    .then(res => {
      const loc = String(res.headers.location || '').toLowerCase();
      const blocked = res.statusCode === 403 || res.statusCode === 451 || loc.includes('unavailable') || loc.includes('available_regions') || loc.includes('sorry/index');
      return { reachable: res.statusCode > 0 && res.statusCode < 500, blocked, status: res.statusCode, ms: res.elapsedMs };
    })
    .catch(err => ({ reachable: false, blocked: false, status: 0, error: err.message }));

  const openaiApiPromise = proxyHttpsGet('api.openai.com', '/v1/models', { timeoutMs: 5500 })
    .then(res => {
      const low = res.bodyText.toLowerCase();
      const geoBlocked = low.includes('unsupported_country') || low.includes('country, region, or territory');
      const allowed = res.statusCode === 401 || res.statusCode === 200;
      return { reachable: true, allowed, geoBlocked, status: res.statusCode, ms: res.elapsedMs };
    })
    .catch(err => ({ reachable: false, allowed: false, geoBlocked: false, status: 0, error: err.message }));

  const chatgptWebPromise = proxyHttpsGet('chatgpt.com', '/', { timeoutMs: 5500 })
    .then(res => {
      const cfChallenge = res.statusCode === 403 && Boolean(res.headers['cf-mitigated']);
      const geoBlocked = res.bodyText.toLowerCase().includes('unsupported_country');
      return { reachable: res.statusCode > 0 && res.statusCode < 500, cfChallenge, geoBlocked, status: res.statusCode, ms: res.elapsedMs };
    })
    .catch(err => ({ reachable: false, cfChallenge: false, geoBlocked: false, status: 0, error: err.message }));

  const anthropicApiPromise = proxyHttpsGet('api.anthropic.com', '/v1/models', { timeoutMs: 5500 })
    .then(res => {
      const low = res.bodyText.toLowerCase();
      const allowed = res.statusCode === 401 || res.statusCode === 200;
      const geoBlocked = res.statusCode === 403 && (low.includes('not allowed') || low.includes('region') || low.includes('country'));
      return { reachable: true, allowed, geoBlocked, status: res.statusCode, ms: res.elapsedMs };
    })
    .catch(err => ({ reachable: false, allowed: false, geoBlocked: false, status: 0, error: err.message }));

  const claudeWebPromise = proxyHttpsGet('claude.ai', '/login', { timeoutMs: 5500 })
    .then(res => {
      const cfChallenge = res.statusCode === 403 && Boolean(res.headers['cf-mitigated']);
      const loc = String(res.headers.location || '').toLowerCase();
      const geoBlocked = loc.includes('unavailable') || res.statusCode === 451;
      return { reachable: res.statusCode > 0 && res.statusCode < 500, cfChallenge, geoBlocked, status: res.statusCode, ms: res.elapsedMs };
    })
    .catch(err => ({ reachable: false, cfChallenge: false, geoBlocked: false, status: 0, error: err.message }));

  const speedPromise = withSpeed
    ? proxyHttpsGet('speed.cloudflare.com', '/__down?bytes=1500000', {
        timeoutMs: 7500,
        maxBodyBytes: 1600000,
        skipBodyText: true
      })
        .then(res => {
          if (res.statusCode >= 200 && res.statusCode < 400 && res.bodyBytes > 16384) {
            const mbps = (res.bodyBytes * 8) / (res.transferMs / 1000) / 1e6;
            return Number(mbps.toFixed(1));
          }
          return 0;
        })
        .catch(() => 0)
    : Promise.resolve(null);

  const [trace, gApi, gWeb, sWeb, oApi, cWeb, aApi, clWeb, speedMbps] = await Promise.all([
    tracePromise,
    googleApiGeoPromise,
    geminiWebPromise,
    studioWebPromise,
    openaiApiPromise,
    chatgptWebPromise,
    anthropicApiPromise,
    claudeWebPromise,
    speedPromise
  ]);

  const exitCountry = trace.country || '';
  const countryBlocked = Boolean(exitCountry && BLOCKED_AI_COUNTRIES.has(exitCountry));

  const geminiOk = !countryBlocked && gWeb.reachable && !gWeb.blocked && (!gApi.reachable || !gApi.geoBlocked);
  const geminiStatus = !gWeb.reachable && !gApi.reachable
    ? 'bad'
    : (countryBlocked || gWeb.blocked || gApi.geoBlocked ? 'bad' : (geminiOk ? 'ok' : 'warn'));

  const studioOk = !countryBlocked && sWeb.reachable && !sWeb.blocked && (!gApi.reachable || !gApi.geoBlocked);
  const studioStatus = !sWeb.reachable && !gApi.reachable
    ? 'bad'
    : (countryBlocked || sWeb.blocked || gApi.geoBlocked ? 'bad' : (studioOk ? 'ok' : 'warn'));

  let gptStatus = 'bad';
  let gptNote = 'Unreachable';
  if (countryBlocked || oApi.geoBlocked || cWeb.geoBlocked) {
    gptStatus = 'bad';
    gptNote = `Geo blocked (${exitCountry || 'IP'})`;
  } else if (cWeb.reachable && !cWeb.cfChallenge && cWeb.status < 400) {
    gptStatus = 'ok';
    gptNote = `OK (${cWeb.ms} ms)`;
  } else if (oApi.allowed && cWeb.cfChallenge) {
    gptStatus = 'ok';
    gptNote = 'OK (IP clean, browser CF)';
  } else if (oApi.allowed) {
    gptStatus = 'ok';
    gptNote = `API OK (${oApi.ms} ms)`;
  } else if (cWeb.cfChallenge) {
    gptStatus = 'warn';
    gptNote = 'Cloudflare check';
  }

  let claudeStatus = 'bad';
  let claudeNote = 'Unreachable';
  if (countryBlocked || aApi.geoBlocked || clWeb.geoBlocked) {
    claudeStatus = 'bad';
    claudeNote = `Geo blocked (${exitCountry || 'IP'})`;
  } else if (clWeb.reachable && !clWeb.cfChallenge && clWeb.status < 400) {
    claudeStatus = 'ok';
    claudeNote = `OK (${clWeb.ms} ms)`;
  } else if (aApi.allowed && clWeb.cfChallenge) {
    claudeStatus = 'ok';
    claudeNote = 'OK (IP clean, browser CF)';
  } else if (aApi.allowed) {
    claudeStatus = 'ok';
    claudeNote = `API OK (${aApi.ms} ms)`;
  } else if (clWeb.cfChallenge) {
    claudeStatus = 'warn';
    claudeNote = 'Cloudflare check';
  }

  const runningId = Number(cachedStatus.runningId || 0);
  if (runningId > 0 && exitCountry) {
    ensureGeoCachesLoaded();
    profileExitMap.set(String(runningId), {
      country: exitCountry,
      ipOut: trace.ip || ''
    });
    saveProfileExitCache();

    const p = cachedProfiles.find(x => x.id === runningId);
    if (p) {
      p.country = exitCountry;
      p.countryVerified = true;
      if (trace.ip) p.ipOut = trace.ip;
      if (typeof speedMbps === 'number' && speedMbps > 0 && !p.downloadBps) {
        p.downloadBps = Math.round(speedMbps * 1e6);
      }
    }
    broadcastState();
  }

  return {
    ok: trace.ok || gWeb.reachable || oApi.reachable,
    profileId: runningId || null,
    exitIp: trace.ip,
    country: exitCountry,
    colo: trace.colo,
    speedMbps,
    checkedAt: Date.now(),
    services: {
      gemini: {
        status: geminiStatus,
        note: geminiStatus === 'ok'
          ? `OK (${gWeb.ms || gApi.ms} ms)`
          : (countryBlocked || gApi.geoBlocked ? `Blocked (${exitCountry || 'Geo'})` : (gWeb.error || 'Blocked'))
      },
      aistudio: {
        status: studioStatus,
        note: studioStatus === 'ok'
          ? `OK (${sWeb.ms || gApi.ms} ms)`
          : (countryBlocked || gApi.geoBlocked ? `Blocked (${exitCountry || 'Geo'})` : (sWeb.error || 'Blocked'))
      },
      chatgpt: { status: gptStatus, note: gptNote },
      claude: { status: claudeStatus, note: claudeNote }
    }
  };
}

async function verifyConnectedTunnelForAi() {
  try {
    const [trace, gApi] = await Promise.all([
      proxyHttpsGet('www.cloudflare.com', '/cdn-cgi/trace', { timeoutMs: 3200 }),
      proxyHttpsGet('generativelanguage.googleapis.com', '/v1beta/models', { timeoutMs: 3500 })
    ]);
    let country = '';
    for (const line of trace.bodyText.split(/\r?\n/)) {
      if (line.startsWith('loc=')) country = line.slice(4).trim().toUpperCase();
    }
    const geoBlocked = (country && BLOCKED_AI_COUNTRIES.has(country)) || gApi.bodyText.toLowerCase().includes('location is not supported');
    if (geoBlocked) {
      return { ok: false, reason: `Exit blocked for AI (${country || 'Geo'})`, country };
    }
    return { ok: true, country };
  } catch (err) {
    return { ok: false, reason: err.message, country: '' };
  }
}

/* =========================================================================
   Latency, IP & Real Speed Test Engine
   ========================================================================= */

async function cancelActiveLatencyScan(waitForFinish = false) {
  if (!latencyScanRunning) return;
  latencyScanCancelRequested = true;
  if (activeLatencyJobId) {
    await runCtl(['cancel', String(activeLatencyJobId)], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => {});
  }
  if (waitForFinish && activeLatencyPromise) {
    await Promise.race([
      activeLatencyPromise.catch(() => {}),
      sleep(4000)
    ]);
  }
}

function isFinishedJobState(state) {
  const s = String(state || '').toLowerCase();
  return ['done', 'finished', 'completed', 'succeeded', 'failed', 'error', 'cancelled', 'canceled'].includes(s);
}

function ingestJobResults(job, recordCompletion, tickDelta, kind = 'latency') {
  if (!job || typeof job !== 'object' || !Array.isArray(job.results)) return;
  for (const r of job.results) {
    if (!r || typeof r !== 'object') continue;
    const rid = Number(r.id ?? r.profile_id ?? r.ID ?? 0);
    if (!rid) continue;

    if (kind === 'latency') {
      let rlat = r.latency_ms ?? r.latency ?? r.ping ?? r.delay ?? null;
      if ((rlat === null || rlat === undefined || Number(rlat) === 0) && (r.error || r.timed_out || r.timeout)) {
        rlat = -1;
      }
      if (rlat !== null && rlat !== undefined && Number(rlat) !== 0) {
        recordCompletion(rid, { latency: Number(rlat) }, tickDelta);
      }
    } else if (kind === 'ip') {
      const country = String(r.country || '').trim().toUpperCase();
      const ipOut = String(r.ip_out ?? r.ipOut ?? '').trim();
      if (country || ipOut || r.error || r.timed_out || r.timeout) {
        recordCompletion(rid, { country, ipOut, failed: Boolean(r.error || r.timed_out || r.timeout) }, tickDelta);
      }
    } else if (kind === 'speed') {
      let down = r.download_bps ?? r.downloadBps ?? null;
      let up = r.upload_bps ?? r.uploadBps ?? null;
      if ((down === null || Number(down) === 0) && (r.error || r.timed_out || r.timeout)) {
        down = -1;
        up = -1;
      }
      if ((down !== null && Number(down) !== 0) || (up !== null && Number(up) !== 0)) {
        recordCompletion(rid, { downloadBps: Number(down || 0), uploadBps: Number(up || 0) }, tickDelta);
      }
    }
  }
}

function buildPriorityBatches(targetIds) {
  if (targetIds.length <= 1) return [targetIds];

  const byId = new Map(cachedProfiles.map(p => [p.id, p]));
  const alive = [];
  const untested = [];
  const dead = [];

  for (const id of targetIds) {
    const p = byId.get(id);
    const lat = p ? p.latency : null;
    if (lat !== null && lat !== undefined && lat > 0) {
      alive.push({ id, lat });
    } else if (lat !== null && lat !== undefined && lat < 0) {
      dead.push(id);
    } else {
      untested.push(id);
    }
  }

  alive.sort((a, b) => a.lat - b.lat);

  const pushChunks = (list, size, dest) => {
    for (let i = 0; i < list.length; i += size) {
      dest.push(list.slice(i, i + size));
    }
  };

  const batches = [];
  pushChunks(alive.map(x => x.id), 180, batches);
  pushChunks(untested, 400, batches);
  pushChunks(dead, 400, batches);
  return batches;
}

async function clearProfilesResultsChunked(ids, gid = null) {
  if (gid !== null && gid >= 0) {
    await runCtl(['clear', '--group', String(gid)], { cliTimeout: '12s', nodeTimeoutMs: 14000 }).catch(() => {});
    return;
  }
  const chunkSize = 400;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize).map(String);
    await runCtl(['clear', ...chunk], { cliTimeout: '12s', nodeTimeoutMs: 14000 }).catch(() => {});
  }
}

async function runLatencyTestInternal({ groupId, profileIds }) {
  if (engineState.phase !== 'ready') throw new Error(engineState.message);
  if (latencyScanRunning) throw new Error('Another test is already running');

  let targetIds = [];
  if (Array.isArray(profileIds) && profileIds.length > 0) {
    const existing = new Set(cachedProfiles.map(p => p.id));
    const seen = new Set();
    for (const rawId of profileIds) {
      const id = Number(rawId);
      if (id > 0 && existing.has(id) && !seen.has(id)) {
        seen.add(id);
        targetIds.push(id);
      }
    }
  } else if (groupId !== null && groupId !== undefined && Number(groupId) >= 0) {
    const gid = Number(groupId);
    targetIds = cachedProfiles.filter(p => p.groupId === gid).map(p => p.id);
  } else {
    targetIds = cachedProfiles.map(p => p.id);
  }

  if (targetIds.length === 0) {
    return refreshSnapshot();
  }

  latencyScanRunning = true;
  latencyScanCancelRequested = false;
  activeLatencyJobId = null;

  const profileByIdLocal = new Map();
  for (const p of cachedProfiles) {
    profileByIdLocal.set(p.id, p);
  }

  const gid = (groupId !== null && groupId !== undefined && Number(groupId) > 0) ? Number(groupId) : null;
  let groupTotalCount = 0;
  if (gid !== null) {
    for (const p of cachedProfiles) {
      if (p.groupId === gid) groupTotalCount++;
    }
  }
  const useWholeGroupCmd = gid !== null && targetIds.length > 1 && targetIds.length === groupTotalCount && targetIds.length <= 400;

  const batches = useWholeGroupCmd ? [targetIds] : buildPriorityBatches(targetIds);
  const orderedTargetIds = batches.flat();
  const completedMap = new Map();
  let onlineCount = 0;
  const isSingle = orderedTargetIds.length === 1;
  const fallbackPollIntervalMs = orderedTargetIds.length > 600 ? 3000 : 1400;

  const recordCompletion = (id, patch, tickDelta) => {
    const lat = Number(patch.latency);
    if (!completedMap.has(id)) {
      completedMap.set(id, lat);
      if (lat > 0) onlineCount++;
      tickDelta[id] = lat;
      const existing = profileByIdLocal.get(id);
      if (existing) existing.latency = lat;
    }
  };

  const publish = (activeIds, tickDelta, includeTargets = false) => {
    emitLatencyProgress({
      kind: 'latency',
      scanning: true,
      single: isSingle,
      total: orderedTargetIds.length,
      done: completedMap.size,
      onlineCount,
      targetIds: includeTargets ? orderedTargetIds : undefined,
      activeIds,
      deltaCompleted: tickDelta
    });
  };

  try {
    publish(orderedTargetIds.slice(0, Math.min(6, orderedTargetIds.length)), {}, true);

    for (const batchIds of batches) {
      if (latencyScanCancelRequested) break;

      await clearProfilesResultsChunked(batchIds, useWholeGroupCmd ? gid : null);
      for (const id of batchIds) {
        const p = profileByIdLocal.get(id);
        if (p) {
          p.latency = 0;
          p.latencyAt = 0;
        }
      }

      const batchSet = new Set(batchIds);
      let job = null;
      let asyncSupported = true;

      const ctlArgs = useWholeGroupCmd
        ? ['test', 'latency', '--group', String(gid), '--no-wait']
        : ['test', 'latency', ...batchIds.map(String), '--no-wait'];

      try {
        job = await runCtl(ctlArgs, {
          cliTimeout: '12s',
          nodeTimeoutMs: 15000
        });
      } catch (err) {
        const msg = String(err.message || '').toLowerCase();
        if (msg.includes('unknown flag') || msg.includes('flag provided but not defined') || msg.includes('no-wait')) {
          asyncSupported = false;
        } else {
          throw err;
        }
      }

      const jobId = job && typeof job === 'object' ? (job.id ?? job.job_id ?? job.ID) : null;

      if (asyncSupported && jobId !== null && jobId !== undefined) {
        activeLatencyJobId = String(jobId);
        const initDelta = {};
        ingestJobResults(job, recordCompletion, initDelta, 'latency');
        let jobState = String((job && (job.state || job.status)) || 'running').toLowerCase();
        let jobStreamsResults = Object.keys(initDelta).length > 0;

        const getPendingInBatch = () => {
          const pending = [];
          for (const id of batchIds) {
            if (!completedMap.has(id)) {
              pending.push(id);
              if (pending.length >= 6) break;
            }
          }
          return pending;
        };

        publish(getPendingInBatch(), initDelta);

        let lastProfilesPoll = Date.now();
        const batchDeadline = Date.now() + Math.max(180000, batchIds.length * 180);
        while (!isFinishedJobState(jobState) && Date.now() < batchDeadline) {
          await sleep(550);

          if (latencyScanCancelRequested) {
            await runCtl(['cancel', activeLatencyJobId], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => {});
            break;
          }

          const tickDelta = {};
          const jobInfo = await runCtl(['job', activeLatencyJobId], {
            cliTimeout: '6s',
            nodeTimeoutMs: 7000
          }).catch(() => null);

          if (jobInfo && typeof jobInfo === 'object') {
            ingestJobResults(jobInfo, recordCompletion, tickDelta, 'latency');
            if (Object.keys(tickDelta).length > 0) {
              jobStreamsResults = true;
            }
            if (jobInfo.state || jobInfo.status) {
              jobState = String(jobInfo.state || jobInfo.status).toLowerCase();
            }
          }

          const needFallbackPoll = !jobStreamsResults && (Date.now() - lastProfilesPoll) >= fallbackPollIntervalMs;
          if (needFallbackPoll) {
            lastProfilesPoll = Date.now();
            const profileQuery = useWholeGroupCmd ? ['profiles', '--group', String(gid)] : ['profiles'];
            const rawProfiles = await runCtl(profileQuery, { cliTimeout: '12s', nodeTimeoutMs: 15000 }).catch(() => null);
            if (rawProfiles) {
              const parsed = normalizeProfiles(rawProfiles);
              for (const np of parsed) {
                const existing = profileByIdLocal.get(np.id);
                if (existing) {
                  existing.latency = np.latency;
                  existing.latencyAt = np.latencyAt;
                }
                if (!batchSet.has(np.id) || completedMap.has(np.id)) continue;
                if ((np.latencyAt && np.latencyAt > 0) || (np.latency !== null && np.latency !== 0)) {
                  recordCompletion(np.id, { latency: np.latency > 0 ? np.latency : -1 }, tickDelta);
                }
              }
            }
          }

          publish(getPendingInBatch(), tickDelta);
        }

        if (!isFinishedJobState(jobState) && !latencyScanCancelRequested) {
          await runCtl(['cancel', activeLatencyJobId], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => {});
        }

        if (!latencyScanCancelRequested) {
          const endDelta = {};
          const profileQuery = useWholeGroupCmd ? ['profiles', '--group', String(gid)] : ['profiles'];
          const rawProfiles = await runCtl(profileQuery, { cliTimeout: '12s', nodeTimeoutMs: 15000 }).catch(() => null);
          if (rawProfiles) {
            const parsed = normalizeProfiles(rawProfiles);
            for (const np of parsed) {
              const existing = profileByIdLocal.get(np.id);
              if (existing) {
                existing.latency = np.latency;
                existing.latencyAt = np.latencyAt;
              }
            }
          }
          for (const id of batchIds) {
            if (!completedMap.has(id)) {
              const p = profileByIdLocal.get(id);
              const val = p && p.latency !== null && p.latency !== 0 ? p.latency : -1;
              recordCompletion(id, { latency: val }, endDelta);
            }
          }
          publish([], endDelta);
        }
        activeLatencyJobId = null;
      } else {
        const syncChunkSize = isSingle ? 1 : 20;
        for (let k = 0; k < batchIds.length; k += syncChunkSize) {
          if (latencyScanCancelRequested) break;
          const subIds = batchIds.slice(k, k + syncChunkSize);
          publish(subIds, {});

          const tickDelta = {};
          const res = await runCtl(['test', 'latency', ...subIds.map(String)], {
            cliTimeout: '45s',
            nodeTimeoutMs: 50000
          }).catch(() => null);

          ingestJobResults(res, recordCompletion, tickDelta, 'latency');

          let missingAny = false;
          for (const id of subIds) {
            if (!completedMap.has(id)) {
              missingAny = true;
              break;
            }
          }
          if (missingAny) {
            const rawProfiles = await runCtl(['profiles'], { cliTimeout: '12s', nodeTimeoutMs: 15000 }).catch(() => null);
            if (rawProfiles) {
              const parsed = normalizeProfiles(rawProfiles);
              for (const np of parsed) {
                const existing = profileByIdLocal.get(np.id);
                if (existing) {
                  existing.latency = np.latency;
                  existing.latencyAt = np.latencyAt;
                }
              }
            }
            for (const id of subIds) {
              if (!completedMap.has(id)) {
                const p = profileByIdLocal.get(id);
                const val = p && p.latency !== null && p.latency !== 0 ? p.latency : -1;
                recordCompletion(id, { latency: val }, tickDelta);
              }
            }
          }
          publish([], tickDelta);
        }
      }
    }
  } finally {
    const wasCancelled = latencyScanCancelRequested;
    latencyScanRunning = false;
    latencyScanCancelRequested = false;
    activeLatencyJobId = null;
    await refreshSnapshot();
    emitLatencyProgress({
      kind: 'latency',
      scanning: false,
      cancelled: wasCancelled,
      single: isSingle,
      total: orderedTargetIds.length,
      done: completedMap.size,
      onlineCount,
      activeIds: [],
      deltaCompleted: {}
    });
  }

  return getFullSnapshot();
}

async function runSpeedAndIpTestInternal({ groupId, profileIds }) {
  if (engineState.phase !== 'ready') throw new Error(engineState.message);
  if (latencyScanRunning) throw new Error('Another test is already running');

  let targetIds = [];
  if (Array.isArray(profileIds) && profileIds.length > 0) {
    const existing = new Set(cachedProfiles.map(p => p.id));
    for (const rawId of profileIds) {
      const id = Number(rawId);
      if (id > 0 && existing.has(id) && !targetIds.includes(id)) targetIds.push(id);
    }
  } else {
    const gid = (groupId !== null && groupId !== undefined && Number(groupId) >= 0) ? Number(groupId) : null;
    const pool = gid !== null ? cachedProfiles.filter(p => p.groupId === gid) : cachedProfiles;
    const alive = pool.filter(p => p.latency && p.latency > 0).sort((a, b) => a.latency - b.latency);
    const source = alive.length > 0 ? alive : pool.filter(p => !(p.latency !== null && p.latency < 0));
    targetIds = (source.length > 0 ? source : pool).slice(0, 12).map(p => p.id);
  }

  if (targetIds.length === 0) {
    throw new Error('No servers available to test');
  }

  latencyScanRunning = true;
  latencyScanCancelRequested = false;
  activeLatencyJobId = null;

  const profileByIdLocal = new Map(cachedProfiles.map(p => [p.id, p]));
  let totalSteps = targetIds.length * 2;
  let doneSteps = 0;
  let okSpeedCount = 0;
  const ipFailedSet = new Set();

  const publishSpeedProgress = (phaseLabel, activeIds, deltaProfiles = {}, includeTargets = false) => {
    emitLatencyProgress({
      kind: 'speed_ip',
      phaseLabel,
      scanning: true,
      single: targetIds.length === 1,
      total: totalSteps,
      done: doneSteps,
      onlineCount: okSpeedCount,
      targetIds: includeTargets ? targetIds : undefined,
      activeIds,
      deltaProfiles
    });
  };

  async function runOneSubBatch(kind, batchIds, deadlinePerItemMs) {
    const chunkCompleted = new Set();
    let job = null;
    let asyncSupported = true;
    try {
      job = await runCtl(['test', kind, ...batchIds.map(String), '--no-wait'], {
        cliTimeout: '12s',
        nodeTimeoutMs: 15000
      });
    } catch (err) {
      const msg = String(err.message || '').toLowerCase();
      if (msg.includes('unknown flag') || msg.includes('flag provided but not defined') || msg.includes('no-wait')) {
        asyncSupported = false;
      } else {
        throw err;
      }
    }

    const recordFn = (rid, data, delta) => {
      if (chunkCompleted.has(rid)) return;
      chunkCompleted.add(rid);
      doneSteps++;
      const p = profileByIdLocal.get(rid);
      if (kind === 'ip') {
        if (!data.country && !data.ipOut) {
          ipFailedSet.add(rid);
        }
        if (data.country) {
          ensureGeoCachesLoaded();
          profileExitMap.set(String(rid), {
            country: data.country,
            ipOut: data.ipOut || ''
          });
        }
        if (p) {
          if (data.country) {
            p.country = data.country;
            p.countryVerified = true;
          }
          if (data.ipOut) p.ipOut = data.ipOut;
        }
        delta[rid] = { country: data.country || '', ipOut: data.ipOut || '', countryVerified: Boolean(data.country) };
      } else {
        if (data.downloadBps > 0) okSpeedCount++;
        if (p) {
          p.downloadBps = data.downloadBps;
          p.uploadBps = data.uploadBps;
        }
        delta[rid] = { downloadBps: data.downloadBps, uploadBps: data.uploadBps };
      }
    };

    const jobId = job && typeof job === 'object' ? (job.id ?? job.job_id ?? job.ID) : null;
    if (asyncSupported && jobId !== null && jobId !== undefined) {
      activeLatencyJobId = String(jobId);
      const initDelta = {};
      ingestJobResults(job, recordFn, initDelta, kind);
      let jobState = String((job && (job.state || job.status)) || 'running').toLowerCase();
      publishSpeedProgress(
        kind === 'ip' ? 'Checking real exit IP & country...' : 'Measuring real download & upload speed...',
        batchIds.filter(id => !chunkCompleted.has(id)),
        initDelta
      );

      const deadline = Date.now() + Math.max(90000, batchIds.length * deadlinePerItemMs);
      while (!isFinishedJobState(jobState) && Date.now() < deadline) {
        await sleep(750);
        if (latencyScanCancelRequested) {
          await runCtl(['cancel', activeLatencyJobId], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => {});
          break;
        }
        const tickDelta = {};
        const jobInfo = await runCtl(['job', activeLatencyJobId], {
          cliTimeout: '6s',
          nodeTimeoutMs: 7000
        }).catch(() => null);
        if (jobInfo && typeof jobInfo === 'object') {
          ingestJobResults(jobInfo, recordFn, tickDelta, kind);
          if (jobInfo.state || jobInfo.status) {
            jobState = String(jobInfo.state || jobInfo.status).toLowerCase();
          }
        }
        publishSpeedProgress(
          kind === 'ip' ? 'Checking real exit IP & country...' : 'Measuring real download & upload speed...',
          batchIds.filter(id => !chunkCompleted.has(id)),
          tickDelta
        );
      }

      if (!isFinishedJobState(jobState) && !latencyScanCancelRequested) {
        await runCtl(['cancel', activeLatencyJobId], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => {});
      }
      activeLatencyJobId = null;
    } else {
      const res = await runCtl(['test', kind, ...batchIds.map(String)], {
        cliTimeout: '120s',
        nodeTimeoutMs: 125000
      }).catch(() => null);
      const delta = {};
      ingestJobResults(res, recordFn, delta, kind);
      publishSpeedProgress(
        kind === 'ip' ? 'Checking real exit IP & country...' : 'Measuring real download & upload speed...',
        [],
        delta
      );
    }

    if (!latencyScanCancelRequested) {
      const rawProfiles = await runCtl(['profiles'], { cliTimeout: '12s', nodeTimeoutMs: 15000 }).catch(() => null);
      const endDelta = {};
      if (rawProfiles) {
        const parsed = normalizeProfiles(rawProfiles);
        for (const np of parsed) {
          const existing = profileByIdLocal.get(np.id);
          if (existing) {
            existing.country = np.country;
            existing.ipOut = np.ipOut;
            existing.downloadBps = np.downloadBps;
            existing.uploadBps = np.uploadBps;
          }
        }
      }
      for (const id of batchIds) {
        if (!chunkCompleted.has(id)) {
          const p = profileByIdLocal.get(id);
          if (kind === 'ip') {
            recordFn(id, { country: p ? p.country : '', ipOut: p ? p.ipOut : '' }, endDelta);
          } else {
            recordFn(id, { downloadBps: p && p.downloadBps ? p.downloadBps : -1, uploadBps: p && p.uploadBps ? p.uploadBps : -1 }, endDelta);
          }
        }
      }
      publishSpeedProgress(
        kind === 'ip' ? 'Checking real exit IP & country...' : 'Measuring real download & upload speed...',
        [],
        endDelta
      );
    }
  }

  try {
    publishSpeedProgress('Checking real exit IP & country...', targetIds.slice(0, 6), {}, true);

    for (let i = 0; i < targetIds.length; i += 10) {
      if (latencyScanCancelRequested) break;
      await runOneSubBatch('ip', targetIds.slice(i, i + 10), 8000).catch(err => {
        addLog('IP check batch skipped: ' + err.message);
      });
    }

    const speedTargets = targetIds.length <= 3
      ? targetIds
      : targetIds.filter(id => {
          if (ipFailedSet.has(id)) return false;
          const p = profileByIdLocal.get(id);
          if (!p) return false;
          if (p.country && BLOCKED_AI_COUNTRIES.has(p.country)) return false;
          return true;
        });

    doneSteps = targetIds.length;
    totalSteps = targetIds.length + speedTargets.length;

    for (let i = 0; i < speedTargets.length; i += 4) {
      if (latencyScanCancelRequested) break;
      await runOneSubBatch('speed', speedTargets.slice(i, i + 4), 25000).catch(err => {
        addLog('Speed batch skipped: ' + err.message);
      });
    }
  } finally {
    saveProfileExitCache();
    const wasCancelled = latencyScanCancelRequested;
    latencyScanRunning = false;
    latencyScanCancelRequested = false;
    activeLatencyJobId = null;
    await refreshSnapshot();
    emitLatencyProgress({
      kind: 'speed_ip',
      scanning: false,
      cancelled: wasCancelled,
      single: targetIds.length === 1,
      total: totalSteps,
      done: doneSteps,
      onlineCount: okSpeedCount,
      activeIds: [],
      deltaCompleted: {}
    });
  }

  return getFullSnapshot();
}

function runLatencyTest(payload) {
  if (latencyScanRunning) {
    return Promise.reject(new Error('Another test is already running'));
  }
  const p = runLatencyTestInternal(payload || {});
  activeLatencyPromise = p.finally(() => {
    if (activeLatencyPromise === p) activeLatencyPromise = null;
  });
  return activeLatencyPromise;
}

function runSpeedAndIpTest(payload) {
  if (latencyScanRunning) {
    return Promise.reject(new Error('Another test is already running'));
  }
  const p = runSpeedAndIpTestInternal(payload || {});
  activeLatencyPromise = p.finally(() => {
    if (activeLatencyPromise === p) activeLatencyPromise = null;
  });
  return activeLatencyPromise;
}

/* =========================================================================
   Engine Lifecycle & Connection Management
   ========================================================================= */

async function startEngine() {
  const { throneExe, thronectlExe, dataDir, keyFile } = getPaths();
  fs.mkdirSync(dataDir, { recursive: true });

  await restoreSystemProxy();

  if (!fs.existsSync(throneExe) || !fs.existsSync(thronectlExe)) {
    engineState = {
      phase: 'error',
      message: 'Throne.exe or thronectl.exe not found in runtime. Run setup.ps1.'
    };
    broadcastState();
    return;
  }

  engineState = { phase: 'starting', message: 'Starting Sutemi engine...' };
  broadcastState();
  addLog(`Launching ${throneExe} --headless --data-dir ${dataDir}`);

  throneProcess = spawn(throneExe, ['--headless', '--data-dir', dataDir, '--no-resume', '--no-kill-switch'], {
    cwd: path.dirname(throneExe),
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  throneProcess.on('error', err => {
    addLog('Failed to launch engine: ' + err.message);
    throneProcess = null;
    if (!isQuitting && !engineRestarting) {
      engineState = { phase: 'error', message: 'Failed to start Throne.exe: ' + err.message };
      restoreSystemProxy().catch(() => {});
      broadcastState();
    }
  });

  throneProcess.stdout.on('data', d => addLog('[Engine] ' + d.toString('utf8')));
  throneProcess.stderr.on('data', d => addLog('[Engine ERR] ' + d.toString('utf8')));

  throneProcess.on('exit', (code, signal) => {
    addLog(`Engine exited (code=${code}, signal=${signal})`);
    throneProcess = null;
    if (!isQuitting && !engineRestarting) {
      engineState = {
        phase: 'error',
        message: 'Engine stopped. Make sure no conflicting VPN client is running.'
      };
      restoreSystemProxy().catch(() => {});
      broadcastState();
    }
  });

  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (!throneProcess) return;
    if (fs.existsSync(keyFile)) {
      try {
        const st = normalizeStatus(await runCtl(['status'], { cliTimeout: '3s', nodeTimeoutMs: 4000 }));
        if (st.state !== 'starting') {
          cachedStatus = st;
          engineState = { phase: 'ready', message: 'Engine ready' };
          await detectProxyEndpoint();
          await applyOptimalScanSettings();
          await refreshSnapshot();
          broadcastState();
          return;
        }
      } catch (_) {}
    }
    await sleep(350);
  }

  engineState = {
    phase: 'error',
    message: 'Engine did not respond in 20s. Restart Sutemi engine.'
  };
  broadcastState();
}

async function stopEngineGracefully() {
  await cancelActiveLatencyScan(true).catch(() => {});
  await restoreSystemProxy();
  try {
    await runCtl(['disconnect'], { cliTimeout: '5s', nodeTimeoutMs: 5500 });
  } catch (_) {}
  try {
    await runCtl(['shutdown', '--yes'], { cliTimeout: '4s', nodeTimeoutMs: 4500 });
  } catch (_) {}
  if (throneProcess) {
    const proc = throneProcess;
    const exited = new Promise(resolve => {
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve();
        }
      };
      proc.once('exit', finish);
      setTimeout(finish, 1800);
    });
    await sleep(500);
    if (throneProcess) {
      try { throneProcess.kill(); } catch (_) {}
    }
    await exited;
    throneProcess = null;
  }
}

async function handleConnect(profileId) {
  if (engineState.phase !== 'ready') throw new Error(engineState.message);
  if (latencyScanRunning) {
    await cancelActiveLatencyScan(true).catch(() => {});
  }
  if (currentMode === 'tun') {
    await restoreSystemProxy();
    await runCtl(['tun', 'on'], { cliTimeout: '15s', nodeTimeoutMs: 18000 });
  } else if (cachedStatus.tun) {
    await runCtl(['tun', 'off'], { cliTimeout: '10s', nodeTimeoutMs: 12000 }).catch(() => {});
  }

  const target = (profileId !== null && profileId !== undefined)
    ? String(profileId)
    : (cachedProfiles.length > 0 ? String(cachedProfiles[0].id) : 'last');

  await runCtl(['connect', target], { cliTimeout: '35s', nodeTimeoutMs: 40000 });

  if (currentMode === 'proxy') {
    try {
      await enableSystemProxy(proxyEndpoint);
    } catch (err) {
      await runCtl(['disconnect'], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => {});
      throw err;
    }
  }
  return refreshSnapshot();
}

function rankProfileForAi(p) {
  const realCountry = p.country || detectCountryFromLabel(p.name);
  let score = 0;

  if (BLOCKED_AI_COUNTRIES.has(realCountry)) score -= 500;
  else if (EU_TIER1_COUNTRIES.has(realCountry)) score += 60;
  else if (EU_TIER2_COUNTRIES.has(realCountry)) score += 40;
  else if (AI_TIER3_COUNTRIES.has(realCountry)) score += 20;

  if (p.country && !BLOCKED_AI_COUNTRIES.has(p.country)) score += 25;
  if (p.downloadBps > 0) score += Math.min(45, (p.downloadBps / 1e6) * 1.5);

  if (p.type.includes('VLESS')) score += 20;
  else if (p.type.includes('HYSTERIA') || p.type.includes('TUIC')) score += 16;
  else if (p.type.includes('TROJAN')) score += 12;
  else if (p.type.includes('SHADOWSOCKS')) score -= 10;

  if (p.latency && p.latency > 0) {
    score -= Math.min(80, p.latency * 0.25);
  }
  return score;
}

async function handleConnectBest(payload) {
  if (engineState.phase !== 'ready') throw new Error(engineState.message);
  await cancelActiveLatencyScan(true).catch(() => {});

  const groupId = payload && typeof payload === 'object' ? payload.groupId : payload;
  const candidateIds = payload && typeof payload === 'object' && Array.isArray(payload.candidateIds)
    ? payload.candidateIds.map(Number).filter(n => n > 0)
    : null;

  if (cachedProfiles.length === 0) {
    await refreshSnapshot();
  } else {
    try {
      cachedStatus = normalizeStatus(await runCtl(['status'], { cliTimeout: '5s', nodeTimeoutMs: 6000 }));
    } catch (_) {}
  }

  let pool = cachedProfiles;
  if (candidateIds && candidateIds.length > 0) {
    const idSet = new Set(candidateIds);
    pool = cachedProfiles.filter(p => idSet.has(p.id));
  } else if (groupId !== null && groupId !== undefined && Number(groupId) >= 0) {
    const gid = Number(groupId);
    pool = cachedProfiles.filter(p => p.groupId === gid);
  }

  if (pool.length === 0) {
    throw new Error('No servers available in this list');
  }

  const aiEligiblePool = pool.filter(p => !BLOCKED_AI_COUNTRIES.has(p.country || detectCountryFromLabel(p.name, p.address)));
  const workingPool = aiEligiblePool.length > 0 ? aiEligiblePool : pool;

  try {
    if (currentMode === 'tun') {
      await restoreSystemProxy();
      await runCtl(['tun', 'on'], { cliTimeout: '15s', nodeTimeoutMs: 18000 });
    } else if (cachedStatus.tun) {
      await runCtl(['tun', 'off'], { cliTimeout: '10s', nodeTimeoutMs: 12000 }).catch(() => {});
    }

    const tryVerifyAndConnect = async (profilesList) => {
      const top = [...profilesList]
        .filter(p => p.latency !== null && p.latency !== undefined && p.latency > 0)
        .sort((a, b) => rankProfileForAi(b) - rankProfileForAi(a))
        .slice(0, 15);

      for (const p of top) {
        try {
          await runCtl(['connect', String(p.id)], { cliTimeout: '20s', nodeTimeoutMs: 25000 });
          const verify = await verifyConnectedTunnelForAi();
          if (verify.ok) {
            if (verify.country) {
              ensureGeoCachesLoaded();
              profileExitMap.set(String(p.id), { country: verify.country, ipOut: p.ipOut || '' });
              saveProfileExitCache();
              p.country = verify.country;
              p.countryVerified = true;
            }
            addLog(`Auto AI verified #${p.id} (${p.name}) -> ${verify.country || 'OK'}`);
            return true;
          }
          addLog(`Auto AI rejected #${p.id} (${p.name}): ${verify.reason}`);
          await runCtl(['disconnect'], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => {});
        } catch (err) {
          addLog(`Auto AI skipped #${p.id}: ${err.message}`);
        }
      }
      return false;
    };

    let connected = await tryVerifyAndConnect(workingPool);

    if (!connected) {
      const untested = workingPool.filter(p => p.latency === null || p.latency === undefined || p.latency === 0);
      const dead = workingPool.filter(p => p.latency !== null && p.latency < 0);
      const scanOrder = [...untested, ...dead].sort((a, b) => rankProfileForAi(b) - rankProfileForAi(a));
      const batchSize = 40;

      for (let i = 0; i < Math.min(scanOrder.length, 240); i += batchSize) {
        const batchIds = scanOrder.slice(i, i + batchSize).map(p => String(p.id));
        await clearProfilesResultsChunked(batchIds);
        const res = await runCtl(['test', 'latency', ...batchIds], {
          cliTimeout: '55s',
          nodeTimeoutMs: 60000
        }).catch(() => null);

        const batchResults = [];
        const batchMap = new Map(workingPool.map(p => [p.id, p]));
        if (res && typeof res === 'object' && Array.isArray(res.results)) {
          for (const r of res.results) {
            const rid = Number(r.id ?? r.profile_id ?? r.ID ?? 0);
            const rlat = r.latency_ms ?? r.latency ?? r.ping ?? r.delay ?? null;
            if (rid > 0 && rlat !== null && Number(rlat) > 0) {
              const existing = batchMap.get(rid);
              if (existing) {
                existing.latency = Number(rlat);
                batchResults.push(existing);
              }
            }
          }
        }

        if (batchResults.length > 0) {
          if (await tryVerifyAndConnect(batchResults)) {
            connected = true;
            break;
          }
        } else {
          const rawProfiles = await runCtl(['profiles'], { cliTimeout: '12s', nodeTimeoutMs: 15000 }).catch(() => null);
          if (rawProfiles) {
            cachedProfiles = normalizeProfiles(rawProfiles);
            const batchSet = new Set(batchIds.map(Number));
            const updatedBatch = cachedProfiles.filter(p => batchSet.has(p.id));
            if (await tryVerifyAndConnect(updatedBatch)) {
              connected = true;
              break;
            }
          }
        }
      }
    }

    if (!connected) {
      throw new Error('No working AI-ready servers found. Try updating or importing another subscription.');
    }

    if (currentMode === 'proxy') {
      try {
        await enableSystemProxy(proxyEndpoint);
      } catch (err) {
        await runCtl(['disconnect'], { cliTimeout: '5s', nodeTimeoutMs: 6000 }).catch(() => {});
        throw err;
      }
    }

    return refreshSnapshot();
  } catch (err) {
    await restoreSystemProxy().catch(() => {});
    await refreshSnapshot().catch(() => {});
    broadcastState();
    throw err;
  }
}

async function handleDisconnect() {
  await restoreSystemProxy();
  await cancelActiveLatencyScan(true).catch(() => {});
  if (engineState.phase === 'ready') {
    await runCtl(['disconnect'], { cliTimeout: '12s', nodeTimeoutMs: 15000 }).catch(() => {});
    if (cachedStatus.tun) {
      await runCtl(['tun', 'off'], { cliTimeout: '10s', nodeTimeoutMs: 12000 }).catch(() => {});
    }
  }
  return refreshSnapshot();
}

async function handleSetMode(mode) {
  await cancelActiveLatencyScan(true).catch(() => {});
  const next = mode === 'tun' ? 'tun' : 'proxy';
  const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);

  if (next === 'tun') {
    if (isConnected) {
      await restoreSystemProxy();
      await runCtl(['tun', 'on'], { cliTimeout: '15s', nodeTimeoutMs: 18000 });
    }
    currentMode = 'tun';
  } else {
    if (cachedStatus.tun) {
      await runCtl(['tun', 'off'], { cliTimeout: '10s', nodeTimeoutMs: 12000 }).catch(() => {});
    }
    currentMode = 'proxy';
    if (isConnected) {
      await enableSystemProxy(proxyEndpoint);
    }
  }
  return refreshSnapshot();
}

async function handleImport(text, groupId, smartFilter = true) {
  await cancelActiveLatencyScan(true).catch(() => {});
  const trimmed = String(text || '').trim();
  if (!trimmed) throw new Error('Paste a link or subscription URL');

  let importSummary = null;
  const isSingleUrl = /^https?:\/\/\S+$/i.test(trimmed);

  if (isSingleUrl) {
    const existing = cachedGroups.find(g => g.url === trimmed) ||
      Object.entries((readUiState().smartSubs) || {})
        .map(([gid, meta]) => meta.url === trimmed ? cachedGroups.find(g => g.id === Number(gid)) : null)
        .find(Boolean) ||
      null;

    if (smartFilter) {
      let hostLabel = 'Custom Sub';
      try {
        const u = new URL(trimmed);
        const seg = u.pathname.split('/').filter(Boolean).pop() || '';
        hostLabel = seg ? `${u.hostname}/${seg}`.slice(0, 34) : u.hostname;
      } catch (_) {}
      const groupName = existing ? existing.name : hostLabel;
      const res = await smartImportSubscription(trimmed, groupName, existing);
      if (!res.fallbackToRaw) {
        importSummary = `Filtered ${res.rawCount} -> top ${res.keptCount} AI-ready nodes`;
        const snap = await refreshSnapshot();
        return { ...snap, importSummary };
      }
    }

    if (existing && existing.url) {
      await runCtl(['sub', 'update', String(existing.id)], { cliTimeout: '120s', nodeTimeoutMs: 125000 });
    } else {
      if (existing) {
        await runCtl(['group', 'rm', String(existing.id)], { cliTimeout: '60s', nodeTimeoutMs: 65000 }).catch(() => {});
      }
      try {
        await runCtl(['sub', 'add', trimmed], { cliTimeout: '120s', nodeTimeoutMs: 125000 });
      } catch (_) {
        await runCtl(['import', '--url', trimmed], { cliTimeout: '120s', nodeTimeoutMs: 125000 });
      }
    }
  } else {
    const decodedLines = extractShareLinkLinesFromBody(trimmed);
    const rawLines = (decodedLines && decodedLines.length > 0)
      ? decodedLines
      : trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let importText = rawLines.join('\n') || trimmed;
    if (smartFilter && rawLines.length > 150) {
      const curated = await curateLinksList(rawLines, SMART_IMPORT_LIMIT);
      if (curated.lines.length > 0) {
        importText = curated.lines.join('\n');
        importSummary = `Filtered ${curated.totalRaw} -> top ${curated.lines.length} AI-ready nodes`;
      }
    }
    const args = ['import'];
    if (groupId !== null && groupId !== undefined && Number(groupId) >= 0) {
      args.push('--group', String(groupId));
    }
    args.push('-');
    await runCtl(args, { stdinText: importText, cliTimeout: '60s', nodeTimeoutMs: 65000 });
  }

  const snap = await refreshSnapshot();
  return { ...snap, importSummary };
}

async function handleAddBuiltin(sourceId, smartFilter = true) {
  await cancelActiveLatencyScan(true).catch(() => {});
  const src = BUILTIN_SOURCES.find(s => s.id === sourceId);
  if (!src) throw new Error('Source not found');

  const saved = readUiState();
  const smartSubs = saved.smartSubs || {};
  const existing = cachedGroups.find(g => g.url === src.url || g.name === src.name) ||
    Object.entries(smartSubs)
      .map(([gid, meta]) => meta.url === src.url ? cachedGroups.find(g => g.id === Number(gid)) : null)
      .find(Boolean) ||
    null;

  if (smartFilter) {
    const res = await smartImportSubscription(src.url, src.name, existing);
    if (!res.fallbackToRaw) {
      const snap = await refreshSnapshot();
      return {
        ...snap,
        importSummary: `${src.name}: filtered ${res.rawCount} -> top ${res.keptCount} AI-ready (${res.aliveTcpCount} alive)`
      };
    }
  }

  if (existing && existing.url) {
    await runCtl(['sub', 'update', String(existing.id)], { cliTimeout: '120s', nodeTimeoutMs: 125000 });
  } else {
    if (existing && !existing.url) {
      await runCtl(['group', 'rm', String(existing.id)], { cliTimeout: '30s', nodeTimeoutMs: 35000 }).catch(() => {});
    }
    await runCtl(['sub', 'add', src.url, '--name', src.name], { cliTimeout: '120s', nodeTimeoutMs: 125000 });
  }
  return refreshSnapshot();
}

async function deleteProfilesChunked(rawIds) {
  const seen = new Set();
  const cleanIds = [];
  for (const raw of rawIds) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0 && !seen.has(n)) {
      seen.add(n);
      cleanIds.push(n);
    }
  }
  if (cleanIds.length === 0) return;

  const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);
  const runId = Number(cachedStatus.runningId);
  if (isConnected && runId > 0 && seen.has(runId)) {
    await handleDisconnect().catch(() => {});
  }

  const chunkSize = 500;
  for (let i = 0; i < cleanIds.length; i += chunkSize) {
    const chunk = cleanIds.slice(i, i + chunkSize).map(String);
    await runCtl(['profile', 'rm', ...chunk], { cliTimeout: '60s', nodeTimeoutMs: 65000 });
  }
}

function updateTrayMenu() {
  if (!tray) return;
  const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);
  const menu = Menu.buildFromTemplate([
    { label: 'Open Sutemi', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
    { type: 'separator' },
    {
      label: isConnected ? 'Disconnect VPN' : 'Connect fastest AI server',
      click: async () => {
        try {
          await runExclusive(() => (isConnected ? handleDisconnect() : handleConnectBest({ groupId: null })));
        } catch (_) {}
        broadcastState();
      }
    },
    { type: 'separator' },
    { label: 'Quit completely', click: () => { isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(menu);
  tray.setToolTip(isConnected ? `Sutemi - Connected (${cachedStatus.runningName || 'VPN'})` : 'Sutemi - Disconnected');
}

function createWindow() {
  const icon = createAppIcon();
  mainWindow = new BrowserWindow({
    width: 1060,
    height: 760,
    minWidth: 820,
    minHeight: 620,
    title: 'Sutemi',
    icon,
    backgroundColor: '#0c0e13',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('close', event => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  if (!tray) {
    tray = new Tray(icon);
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    updateTrayMenu();
  }
}

function lockedHandle(channel, fn) {
  ipcMain.handle(channel, (event, ...args) => runExclusive(() => fn(event, ...args)));
}

function registerIpc() {
  ipcMain.handle('app:get-state', () => getFullSnapshot());
  ipcMain.handle('app:refresh', () => refreshSnapshot());
  ipcMain.handle('app:live', async () => {
    if (engineState.phase !== 'ready') return { downloadBps: 0, uploadBps: 0 };
    const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);
    if (!isConnected) return { downloadBps: 0, uploadBps: 0 };
    try {
      const res = await runCtl(['live'], { cliTimeout: '3s', nodeTimeoutMs: 4000 });
      const raw = Array.isArray(res) ? res[res.length - 1] : res;
      if (!raw || typeof raw !== 'object') return { downloadBps: 0, uploadBps: 0 };
      const src = raw.traffic || raw.speed || raw;
      const down = Number(src.download_bps ?? src.rx_bps ?? src.down ?? src.download ?? src.rx ?? 0) || 0;
      const up = Number(src.upload_bps ?? src.tx_bps ?? src.up ?? src.upload ?? src.tx ?? 0) || 0;
      return { downloadBps: down, uploadBps: up };
    } catch (_) {
      return { downloadBps: 0, uploadBps: 0 };
    }
  });
  lockedHandle('app:connect', (_e, id) => handleConnect(id));
  lockedHandle('app:connect-best', (_e, payload) => handleConnectBest(payload));
  lockedHandle('app:disconnect', () => handleDisconnect());
  lockedHandle('app:set-mode', (_e, mode) => handleSetMode(mode));
  lockedHandle('app:import', (_e, { text, groupId, smartFilter }) => handleImport(text, groupId, smartFilter !== false));
  ipcMain.handle('app:read-clipboard', () => clipboard.readText());
  lockedHandle('app:add-builtin', (_e, arg) => {
    const sourceId = typeof arg === 'string' ? arg : (arg && arg.sourceId);
    const smartFilter = typeof arg === 'object' && arg !== null ? (arg.smartFilter !== false) : true;
    return handleAddBuiltin(sourceId, smartFilter);
  });
  lockedHandle('app:update-subs', async () => {
    await cancelActiveLatencyScan(true).catch(() => {});
    const saved = readUiState();
    const smartEntries = Object.entries(saved.smartSubs || {});
    const hasSubGroups = cachedGroups.some(g => Boolean(g.url));

    if (!hasSubGroups && smartEntries.length === 0) {
      throw new Error('No subscription URLs added yet');
    }

    if (hasSubGroups) {
      await runCtl(['sub', 'update', '--all'], { cliTimeout: '120s', nodeTimeoutMs: 125000 });
    }

    let updatedSmartCount = 0;
    for (const [gidStr, meta] of smartEntries) {
      const grp = cachedGroups.find(g => g.id === Number(gidStr));
      if (!grp || !meta || !meta.url) continue;
      try {
        await smartImportSubscription(meta.url, grp.name, grp);
        updatedSmartCount++;
      } catch (err) {
        addLog(`Smart sub update failed (${grp.name}): ${err.message}`);
      }
    }

    const snap = await refreshSnapshot();
    if (updatedSmartCount > 0) {
      return { ...snap, importSummary: `Updated ${updatedSmartCount} smart subscription(s)` };
    }
    return snap;
  });
  ipcMain.handle('app:test-latency', (_e, payload) => runLatencyTest(payload || {}));
  ipcMain.handle('app:test-speed-ip', (_e, payload) => runSpeedAndIpTest(payload || {}));
  ipcMain.handle('app:cancel-latency', async () => {
    await cancelActiveLatencyScan(false);
    return true;
  });
  ipcMain.handle('app:check-ai', (_e, payload) => checkAiAndIpInternal(payload || {}));
  lockedHandle('app:delete-profiles', async (_e, ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return getFullSnapshot();
    await cancelActiveLatencyScan(true).catch(() => {});
    await deleteProfilesChunked(ids);
    return refreshSnapshot();
  });
  lockedHandle('app:delete-group', async (_e, groupId) => {
    const gid = Number(groupId);
    if (!Number.isFinite(gid) || gid < 0) return getFullSnapshot();
    await cancelActiveLatencyScan(true).catch(() => {});

    const isConnected = ['running', 'connected', 'started'].includes(cachedStatus.state);
    const runId = Number(cachedStatus.runningId);
    const runningInGroup = isConnected && cachedProfiles.some(p => p.id === runId && p.groupId === gid);
    if (runningInGroup) {
      await handleDisconnect().catch(() => {});
    }

    if (gid > 0) {
      const saved = readUiState();
      if (saved.smartSubs && saved.smartSubs[String(gid)]) {
        const nextSmart = { ...saved.smartSubs };
        delete nextSmart[String(gid)];
        writeUiState({ smartSubs: nextSmart });
      }
      try {
        await runCtl(['group', 'rm', String(gid)], { cliTimeout: '60s', nodeTimeoutMs: 65000 });
        return refreshSnapshot();
      } catch (_) {}
    }

    const ids = cachedProfiles.filter(p => p.groupId === gid).map(p => p.id);
    if (ids.length > 0) {
      await deleteProfilesChunked(ids);
    }
    return refreshSnapshot();
  });
  ipcMain.handle('app:get-logs', async () => {
    let engineTail = [];
    if (engineState.phase === 'ready') {
      try {
        const res = await runCtl(['logs', '-n', '40'], { cliTimeout: '5s', nodeTimeoutMs: 6000 });
        if (Array.isArray(res)) {
          engineTail = res.map(x => typeof x === 'string' ? x : (x.line || x.message || x.msg || JSON.stringify(x)));
        } else if (res && Array.isArray(res.lines)) {
          engineTail = res.lines;
        } else if (typeof res === 'string') {
          engineTail = res.split(/\r?\n/);
        }
      } catch (_) {}
    }
    return [...engineLogs.slice(-40), ...engineTail.slice(-40)].join('\n');
  });
  lockedHandle('app:restart-engine', async () => {
    if (engineRestarting) return getFullSnapshot();
    engineRestarting = true;
    try {
      await stopEngineGracefully();
      await startEngine();
    } finally {
      engineRestarting = false;
    }
    return getFullSnapshot();
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerIpc();
    createWindow();
    startEngine().catch(err => addLog('Startup error: ' + err.message));
  });

  app.on('before-quit', async event => {
    if (cleaningUp) return;
    if (throneProcess || systemProxyActive) {
      event.preventDefault();
      isQuitting = true;
      cleaningUp = true;
      await stopEngineGracefully();
      app.exit(0);
    }
  });

  app.on('window-all-closed', () => {
    if (isQuitting) app.quit();
  });

  const handleTermSignal = () => {
    if (cleaningUp) return;
    cleaningUp = true;
    isQuitting = true;
    stopEngineGracefully()
      .catch(() => {})
      .finally(() => {
        restoreSystemProxySync();
        process.exit(0);
      });
  };
  process.on('SIGINT', handleTermSignal);
  process.on('SIGTERM', handleTermSignal);
}
