const XRAY_ON_SEC = 4;
const XRAY_OFF_SEC = 8;
const FLASH_RANGE = 446;
const FLASH_HALF_ANGLE = 0.70;
const BLIND_DURATION = 5;
const SEEKER_LIGHT_RANGE = 24;
const SEEKER_SPEED = 236;
const HIDER_SPEED = 206;
const JAIL_LOCK_SECONDS = 20;
const MAX_ITEMS_TOTAL = 4;

const MAX_PLAYERS = 20;
const MAP_SIZE = 35;
const CENTER_TILE = 17;
const TILE_SIZE = 64;
const WORLD_SCALE = 4 / TILE_SIZE;
const PLAYER_RADIUS = 15;
const PREP_DURATION = 15;
const FINAL_MINUTE_SEC = 60;
const XRAY_CYCLE_SEC = XRAY_ON_SEC + XRAY_OFF_SEC;
const ROOM_PREFIX = 'br35v6-';

const SKINS = [
  { id: 'white',     name: 'Trắng Gốc',      hex: 0xf1f3f8, css: '#f1f3f8' },
  { id: 'silver',    name: 'Bạc Khói',       hex: 0x94a3b8, css: '#94a3b8' },
  { id: 'charcoal',  name: 'Xám Tro',        hex: 0x4b5563, css: '#4b5563' },
  { id: 'black',     name: 'Đen Huyền',      hex: 0x262933, css: '#262933' },
  { id: 'navy',      name: 'Xanh Hoàng Gia', hex: 0x1e3a8a, css: '#1e3a8a' },
  { id: 'cobalt',    name: 'Xanh Coban',     hex: 0x2563eb, css: '#2563eb' },
  { id: 'blue',      name: 'Xanh Dương',     hex: 0x3b82f6, css: '#3b82f6' },
  { id: 'sky',       name: 'Xanh Da Trời',   hex: 0x38bdf8, css: '#38bdf8' },
  { id: 'cyan',      name: 'Xanh Neon',      hex: 0x22d3ee, css: '#22d3ee' },
  { id: 'teal',      name: 'Xanh Ngọc',      hex: 0x14b8a6, css: '#14b8a6' },
  { id: 'emerald',   name: 'Xanh Lục Bảo',   hex: 0x10b981, css: '#10b981' },
  { id: 'green',     name: 'Xanh Lá',        hex: 0x22c55e, css: '#22c55e' },
  { id: 'lime',      name: 'Xanh Chanh',     hex: 0xa3e635, css: '#a3e635' },
  { id: 'yellow',    name: 'Vàng Tươi',      hex: 0xfacc15, css: '#facc15' },
  { id: 'gold',      name: 'Vàng Đồng',      hex: 0xd97706, css: '#d97706' },
  { id: 'amber',     name: 'Hổ Phách',       hex: 0xf59e0b, css: '#f59e0b' },
  { id: 'orange',    name: 'Cam Rực',        hex: 0xfb923c, css: '#fb923c' },
  { id: 'peach',     name: 'Cam Đào',        hex: 0xfdba74, css: '#fdba74' },
  { id: 'coral',     name: 'Hồng San Hô',    hex: 0xfb7185, css: '#fb7185' },
  { id: 'pink',      name: 'Hồng Đào',       hex: 0xf472b6, css: '#f472b6' },
  { id: 'magenta',   name: 'Hồng Sen',       hex: 0xec4899, css: '#ec4899' },
  { id: 'purple',    name: 'Tím Mộng',       hex: 0xa855f7, css: '#a855f7' },
  { id: 'indigo',    name: 'Tím Chàm',       hex: 0x6366f1, css: '#6366f1' },
  { id: 'brown',     name: 'Nâu Đất',        hex: 0x78350f, css: '#78350f' }
];

const HATS = [
  { id: 'none',     name: 'Không đội' },
  { id: 'hutao',    name: 'Nón Hutao' },
  { id: 'furina',   name: 'Nón Furina' },
  { id: 'obito',    name: 'Mặt nạ Obito' },
  { id: 'mahoraga', name: 'Vòng Mahoraga' },
  { id: 'gojo',     name: 'Tóc Gojo' },
  { id: 'frog',     name: 'Mặt ếch' },
  { id: 'shiba',    name: 'Mặt nạ Shiba' },
  { id: 'helmet',   name: 'Mũ Bảo Hộ' },
  { id: 'crown',    name: 'Vương Miện' }
];

const PEER_CONFIG = {
  pingInterval: 5000,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
      { urls: 'stun:openrelay.metered.ca:80' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:80?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turns:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    iceCandidatePoolSize: 10,
    sdpSemantics: 'unified-plan'
  }
};
