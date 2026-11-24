const xraySilhouetteMat = new THREE.MeshBasicMaterial({
  color: 0xff263b, transparent: true, opacity: 0.56, depthTest: false, depthWrite: false
});

function createTalismanTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = '#ece6c5'; g.strokeStyle = '#c8bf94'; g.lineWidth = 4;
  g.beginPath();
  g.moveTo(64, 8); g.lineTo(118, 52); g.lineTo(106, 152); g.lineTo(22, 152); g.lineTo(10, 52);
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#1b1d22';
  g.beginPath();
  g.moveTo(68, 30); g.bezierCurveTo(50, 56, 86, 70, 74, 96);
  g.bezierCurveTo(64, 114, 62, 126, 66, 140); g.bezierCurveTo(50, 120, 42, 102, 52, 84);
  g.bezierCurveTo(62, 66, 42, 52, 68, 30); g.fill();
  g.strokeStyle = '#1b1d22'; g.lineWidth = 8; g.lineCap = 'round';
  g.beginPath(); g.moveTo(46, 82); g.quadraticCurveTo(32, 92, 52, 108); g.stroke();
  g.beginPath(); g.moveTo(78, 74); g.quadraticCurveTo(96, 86, 76, 106); g.stroke();
  return new THREE.CanvasTexture(c);
}
const talismanTex = createTalismanTexture();

function createObitoMaskTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const cx = 94, cy = 112;
  const bg = g.createRadialGradient(120, 100, 15, 128, 128, 140);
  bg.addColorStop(0, '#ff8547'); bg.addColorStop(0.55, '#eb6328'); bg.addColorStop(1, '#b83e12');
  g.fillStyle = bg; g.fillRect(0, 0, 256, 256);

  g.strokeStyle = '#1a0c06'; g.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const baseAng = (i / 9) * Math.PI * 2;
    g.lineWidth = 4.2;
    g.beginPath();
    for (let t = 0; t <= 1; t += 0.04) {
      const r = 18 + t * 145;
      const a = baseAng + t * 2.35;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 1.08;
      if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }

  g.fillStyle = '#0c0908'; g.beginPath(); g.arc(cx, cy, 18, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5c1f0a'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#dc2626'; g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#090909'; g.beginPath(); g.arc(cx, cy, 2, 0, Math.PI * 2); g.fill();
  return new THREE.CanvasTexture(c);
}
const obitoMaskTex = createObitoMaskTexture();

function createFrogSkinTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#368a24'); grad.addColorStop(0.55, '#2b7a1d'); grad.addColorStop(1, '#1e5c15');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = Math.random() > 0.45 ? 'rgba(95, 190, 55, 0.16)' : 'rgba(12, 48, 10, 0.2)';
    g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 1.2 + Math.random() * 2.2, 0, Math.PI * 2); g.fill();
  }
  return new THREE.CanvasTexture(c);
}
const frogSkinTex = createFrogSkinTexture();

function createShibaFurTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#cf9946'); grad.addColorStop(0.45, '#deb062'); grad.addColorStop(0.68, '#f0deb0'); grad.addColorStop(1, '#f7f0dc');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = Math.random() > 0.5 ? 'rgba(255, 245, 220, 0.16)' : 'rgba(135, 88, 30, 0.12)';
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 5);
  }
  return new THREE.CanvasTexture(c);
}
const shibaFurTex = createShibaFurTexture();

function createPixelShadesTexture() {
  const c = document.createElement('canvas'); c.width = 240; c.height = 60;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 240, 60);
  const p = 10;
  const rows = [
    "111111111111111111111111",
    "112121111111112121111111",
    "011212111000011212111110",
    "001121210000001121211100",
    "000111100000000111111000",
    "000000000000000000000000"
  ];
  for (let r = 0; r < rows.length; r++) {
    for (let col = 0; col < rows[r].length; col++) {
      const ch = rows[r][col];
      if (ch === '1') { g.fillStyle = '#0e0e11'; g.fillRect(col * p, r * p, p, p); }
      else if (ch === '2') { g.fillStyle = '#f8fafc'; g.fillRect(col * p, r * p, p, p); }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}
const pixelShadesTex = createPixelShadesTexture();

// =========================================================================
// HỆ THỐNG TEXTURE 1024x512 & ĐIÊU KHẮC MỘT KHỐI LIỀN MẠCH CHO SANS
// =========================================================================

// 1. Khối sọ Sans điêu khắc 1 mảnh liền mạch (hốc mắt lõm 3D, gò má nhẹ tự nhiên, trán tròn, cằm gọn)
function createSculptedSansSkullGeometry() {
  const segX = 64, segY = 48;
  const positions = [], uvs = [], indices = [];

  for (let j = 0; j <= segY; j++) {
    const v = j / segY;
    const phi = (v - 0.5) * Math.PI;
    const cphi = Math.cos(phi);
    const sphi = Math.sin(phi);

    for (let i = 0; i <= segX; i++) {
      const u = i / segX;
      // ang = 0 hướng thẳng về trước (-Z); ang < 0 là bên trái màn hình (+X); ang > 0 là bên phải (-X)
      const ang = (u - 0.5) * Math.PI * 2;
      const ux = -Math.sin(ang) * cphi;
      const uy = sphi;
      const uz = -Math.cos(ang) * cphi;

      let x = ux * 0.265;
      let y = uy * 0.295;
      let z = uz * 0.268;

      // Gò má phúng phính NHẸ tự nhiên đúng chuẩn chibi Undertale (không bị phồng thành 2 cục bóng)
      const cheekY = Math.exp(-Math.pow((uy + 0.34) / 0.28, 2));
      const cheekX = Math.exp(-Math.pow((Math.abs(ux) - 0.62) / 0.32, 2));
      const cheekZ = Math.exp(-Math.pow((uz + 0.55) / 0.55, 2));
      const cheek = cheekY * cheekX * cheekZ;
      x += Math.sign(ux) * 0.032 * cheek;
      z -= 0.018 * cheek;

      // Hơi thu nhẹ thái dương để sọ có đường nét rõ ràng
      const templeY = Math.exp(-Math.pow((uy - 0.05) / 0.25, 2));
      const templeX = Math.exp(-Math.pow((Math.abs(ux) - 0.85) / 0.25, 2));
      x -= Math.sign(ux) * 0.012 * templeY * templeX;

      // Hàm & cằm tròn gọn đẩy nhẹ ra trước cho nụ cười lớn
      const jawY = Math.exp(-Math.pow((uy + 0.56) / 0.28, 2));
      const jawF = Math.exp(-Math.pow(ang / 0.95, 2));
      z -= 0.024 * jawY * jawF;
      if (uy < -0.62) y += (-0.62 - uy) * 0.065;

      // Hốc mắt lõm 3D thật (bắt ánh sáng bóng đổ tự nhiên như tượng 3D mẫu)
      [-1, 1].forEach(side => {
        const da = (ang - side * 0.39) / 0.26;
        const dp = (phi + 0.05) / 0.24;
        const d2 = da * da + dp * dp;
        if (d2 < 2.2) z += 0.032 * Math.exp(-d2 * 1.4);

        // Gờ chân mày nhô nhẹ tạo biểu cảm sắc nét
        const db = (ang - side * 0.37) / 0.28;
        const dpb = (phi - 0.22) / 0.14;
        z -= 0.014 * Math.exp(-(db * db + dpb * dpb) * 1.2);
      });

      // Lõm mũi nhỏ giữa 2 mắt
      const dn = Math.pow(ang / 0.10, 2) + Math.pow((phi + 0.30) / 0.12, 2);
      if (dn < 2.0) z += 0.018 * Math.exp(-dn * 1.5);

      positions.push(x, y + 1.40, z);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < segY; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * (segX + 1) + i;
      const b = a + 1;
      const c = a + (segX + 1);
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const sculptedSansSkullGeo = createSculptedSansSkullGeometry();

// Texture 1024x512 vẽ trực tiếp lên khối sọ liền mạch (mắt to đúng tỉ lệ, miệng cười rộng răng rõ, màu ngà ấm giống mẫu)
function createSansSkullFullTexture(isSeeker) {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');

  // Nền xương màu trắng ngà ấm có đổ khối nhẹ đỉnh đầu -> cằm (không bị cháy trắng lóa)
  const baseGrad = g.createLinearGradient(0, 0, 0, H);
  baseGrad.addColorStop(0.0, '#f3efe8');
  baseGrad.addColorStop(0.42, '#ebe4da');
  baseGrad.addColorStop(0.76, '#ddd3c7');
  baseGrad.addColorStop(1.0, '#c2b6a8');
  g.fillStyle = baseGrad;
  g.fillRect(0, 0, W, H);

  // Hàm đổi góc (ang, phi) sang tọa độ pixel trên canvas 1024x512 (tỉ lệ 1:1 quanh mặt trước, không méo!)
  const toX = (ang) => (0.5 + ang / (Math.PI * 2)) * W;
  const toY = (phi) => (0.5 - phi / Math.PI) * H;

  // Bóng gò má & quầng hốc mắt ấm-nâu nhẹ giống tượng mẫu
  [-0.39, 0.39].forEach(ea => {
    const ex = toX(ea), ey = toY(-0.05);
    const sh = g.createRadialGradient(ex, ey + 6, 30, ex, ey + 6, 68);
    sh.addColorStop(0, 'rgba(72, 62, 56, 0.42)');
    sh.addColorStop(1, 'rgba(72, 62, 56, 0)');
    g.fillStyle = sh;
    g.beginPath(); g.arc(ex, ey + 6, 68, 0, Math.PI * 2); g.fill();
  });

  // 2 HỐC MẮT TO RÕ TỈ LỆ CHUẨN ẢNH MẪU
  const drawEye = (angCenter, tilt, isLeftEye) => {
    const cx = toX(angCenter);
    const cy = toY(-0.05);
    g.save();
    g.translate(cx, cy);
    g.rotate(tilt);

    // Hình hốc mắt lớn bầu hơi vát trên góc trong (tạo thần thái chuẩn Sans)
    g.beginPath();
    g.moveTo(-43, -6);
    g.bezierCurveTo(-44, -36, -10, -44, 24, -32);
    g.bezierCurveTo(45, -24, 46, 12, 34, 29);
    g.bezierCurveTo(18, 44, -22, 42, -36, 24);
    g.bezierCurveTo(-42, 16, -43, 6, -43, -6);
    g.closePath();

    // Nếu là mắt trái (bên phải màn hình) thì lật đối xứng ngang
    if (isLeftEye) {
      g.restore();
      g.save();
      g.translate(cx, cy);
      g.scale(-1, 1);
      g.rotate(-tilt);
      g.beginPath();
      g.moveTo(-43, -6);
      g.bezierCurveTo(-44, -36, -10, -44, 24, -32);
      g.bezierCurveTo(45, -24, 46, 12, 34, 29);
      g.bezierCurveTo(18, 44, -22, 42, -36, 24);
      g.bezierCurveTo(-42, 16, -43, 6, -43, -6);
      g.closePath();
    }

    g.fillStyle = '#07080c';
    g.fill();
    g.strokeStyle = '#181a22';
    g.lineWidth = 4;
    g.stroke();

    // Đồng tử trắng to sáng (hoặc mắt xanh vòng tròn phát sáng khi làm Người Bắt)
    if (isSeeker) {
      if (isLeftEye) {
        // Vòng sáng xanh băng đúng ảnh trái ngoài cùng của mẫu
        const glow = g.createRadialGradient(8, 3, 4, 8, 3, 30);
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
        glow.addColorStop(0.55, 'rgba(14, 165, 233, 0.75)');
        glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
        g.fillStyle = glow;
        g.beginPath(); g.arc(8, 3, 30, 0, Math.PI * 2); g.fill();

        g.strokeStyle = '#7dd3fc';
        g.lineWidth = 7.5;
        g.beginPath(); g.ellipse(8, 3, 15, 19, 0, 0, Math.PI * 2); g.stroke();
        g.fillStyle = '#0b1829';
        g.beginPath(); g.ellipse(8, 3, 8, 11, 0, 0, Math.PI * 2); g.fill();
      }
      // Mắt phải của Sans khi vào chế độ chiến đấu: đen trống rỗng đầy áp lực như ảnh mẫu!
    } else {
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.ellipse(8, 4, 15.5, 19.5, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  };

  drawEye(-0.39, 0.06, false);
  drawEye( 0.39, -0.06, true);

  // LỖ MŨI TAM GIÁC HÌNH TIM LỘN NGƯỢC SẮC NÉT
  const nx = toX(0), ny = toY(-0.31);
  g.fillStyle = '#08090d';
  g.beginPath();
  g.moveTo(nx, ny - 21);
  g.bezierCurveTo(nx - 10, ny - 4, nx - 19, ny + 8, nx - 13, ny + 16);
  g.quadraticCurveTo(nx - 5, ny + 21, nx, ny + 13);
  g.quadraticCurveTo(nx + 5, ny + 21, nx + 13, ny + 16);
  g.bezierCurveTo(nx + 19, ny + 8, nx + 10, ny - 4, nx, ny - 21);
  g.closePath();
  g.fill();

  // MIỆNG CƯỜI RỘNG & TO VỚI 8 RĂNG TRẮNG SẮC NÉT ĐÚNG TỈ LỆ ẢNH MẪU
  const mLeftX = toX(-0.92), mRightX = toX(0.92);
  const mCornerY = toY(-0.36);
  const mUpperMidY = toY(-0.50);
  const mLowerMidY = toY(-0.82);

  // Bóng môi nhẹ phía dưới hàm răng
  g.save();
  g.strokeStyle = 'rgba(72, 62, 56, 0.34)';
  g.lineWidth = 14;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(mLeftX + 18, mCornerY + 14);
  g.quadraticCurveTo(nx, mLowerMidY + 18, mRightX - 18, mCornerY + 14);
  g.stroke();

  // Hình dáng miệng cười rộng kéo sát 2 má
  g.beginPath();
  g.moveTo(mLeftX, mCornerY);
  g.quadraticCurveTo(nx, mUpperMidY, mRightX, mCornerY);
  g.bezierCurveTo(mRightX - 10, mCornerY + 42, nx + 82, mLowerMidY + 4, nx, mLowerMidY);
  g.bezierCurveTo(nx - 82, mLowerMidY + 4, mLeftX + 10, mCornerY + 42, mLeftX, mCornerY);
  g.closePath();

  const teethGrad = g.createLinearGradient(0, mCornerY, 0, mLowerMidY);
  teethGrad.addColorStop(0.0, '#ffffff');
  teethGrad.addColorStop(0.75, '#f4f2ee');
  teethGrad.addColorStop(1.0, '#d8d0c5');
  g.fillStyle = teethGrad;
  g.fill();

  g.save();
  g.clip();
  // 7 đường chia tạo 8 chiếc răng to rõ, hơi xòe nhẹ theo vòng hàm
  g.strokeStyle = '#11131a';
  g.lineWidth = 6.2;
  g.lineCap = 'round';
  const toothAngles = [-0.66, -0.44, -0.22, 0.0, 0.22, 0.44, 0.66];
  toothAngles.forEach(ta => {
    const tx = toX(ta);
    const lean = ta * 16;
    g.beginPath();
    g.moveTo(tx + lean * 0.35, mCornerY - 6);
    g.lineTo(tx - lean * 0.45, mLowerMidY + 14);
    g.stroke();
  });
  g.restore();

  // Đường viền đen sắc gọn bao trọn miệng cười
  g.strokeStyle = '#0e1017';
  g.lineWidth = 7.5;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.stroke();

  // Hai nét khóe má cười đặc trưng
  g.lineWidth = 5.5;
  g.beginPath(); g.arc(mLeftX + 4, mCornerY - 2, 16, Math.PI * 0.72, Math.PI * 1.45); g.stroke();
  g.beginPath(); g.arc(mRightX - 4, mCornerY - 2, 16, -Math.PI * 0.45, Math.PI * 0.28); g.stroke();
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function createSansHoodieTexture(baseHex, darkHex, lightHex) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, lightHex);
  grad.addColorStop(0.45, baseHex);
  grad.addColorStop(1, darkHex);
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Texture tay áo có sọc trắng chạy dọc mặt ngoài ống tay giống ảnh mẫu
function createSansSleeveTexture(baseHex, darkHex, lightHex) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, lightHex);
  grad.addColorStop(0.5, baseHex);
  grad.addColorStop(1, darkHex);
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);

  // Sọc trắng dọc mặt ngoài ống tay áo
  g.fillStyle = '#f3f6fb';
  g.fillRect(0, 108, 256, 40);
  g.fillStyle = 'rgba(0, 18, 56, 0.25)';
  g.fillRect(0, 105, 256, 3);
  g.fillRect(0, 148, 256, 3);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createSansRibbedTexture(baseHex, stripeHex) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = baseHex; g.fillRect(0, 0, 256, 64);
  g.fillStyle = stripeHex;
  for (let x = 0; x < 256; x += 10) g.fillRect(x, 0, 4, 64);
  g.fillStyle = 'rgba(0,0,0,0.22)';
  g.fillRect(0, 0, 256, 6); g.fillRect(0, 58, 256, 6);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  return tex;
}

function createSansShirtTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#cfd6e0');
  grad.addColorStop(0.18, '#f1f4f8');
  grad.addColorStop(0.82, '#e2e8f0');
  grad.addColorStop(1, '#c5cedb');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(95, 110, 135, 0.24)';
  g.lineWidth = 5;
  g.beginPath(); g.moveTo(28, 130); g.quadraticCurveTo(128, 152, 228, 130); g.stroke();
  g.beginPath(); g.moveTo(42, 188); g.quadraticCurveTo(128, 206, 214, 186); g.stroke();
  return new THREE.CanvasTexture(c);
}

function createGlowHaloTexture(hexColor) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.32, hexColor);
  grad.addColorStop(0.68, 'rgba(56, 189, 248, 0.30)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Tạo ống tay áo liền mạch theo đường cong 3D với bán kính biến đổi mượt (không còn khớp nối cục tròn!)
function createVariableTubeGeometry(points, radii, tubularSegs, radialSegs, outerDir) {
  const curve = new THREE.CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(tubularSegs, false);
  const positions = [], uvs = [], indices = [];

  for (let i = 0; i <= tubularSegs; i++) {
    const t = i / tubularSegs;
    const p = curve.getPointAt(t);
    // Nội suy bán kính theo t
    const fIdx = t * (radii.length - 1);
    const i0 = Math.floor(fIdx), i1 = Math.min(radii.length - 1, i0 + 1);
    const r = radii[i0] + (radii[i1] - radii[i0]) * (fIdx - i0);

    // Ổn định hướng pháp tuyến để sọc trắng luôn nằm đúng mặt ngoài ống tay áo
    const T = frames.tangents[i].clone().normalize();
    const N = outerDir.clone().addScaledVector(T, -outerDir.dot(T)).normalize();
    const B = new THREE.Vector3().crossVectors(T, N).normalize();

    for (let j = 0; j <= radialSegs; j++) {
      const v = j / radialSegs;
      const a = (v - 0.5) * Math.PI * 2; // v=0.5 ứng với hướng N (mặt ngoài tay áo -> đặt sọc trắng!)
      const ca = Math.cos(a), sa = Math.sin(a);
      const vx = p.x + r * (ca * N.x + sa * B.x);
      const vy = p.y + r * (ca * N.y + sa * B.y);
      const vz = p.z + r * (ca * N.z + sa * B.z);
      positions.push(vx, vy, vz);
      uvs.push(t, v);
    }
  }

  for (let i = 0; i < tubularSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j;
      const b = (i + 1) * (radialSegs + 1) + j;
      const c = (i + 1) * (radialSegs + 1) + (j + 1);
      const d = i * (radialSegs + 1) + (j + 1);
      indices.push(a, d, b, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Tạo vỏ áo khoác Hoodie mở phanh liền mạch 1 mảnh (ôm vai, phồng bụng tự nhiên, hở chữ U đẹp giữa ngực)
function createOpenHoodieShellGeometry() {
  const segU = 36, segV = 22;
  const positions = [], uvs = [], indices = [];
  const yBot = 0.57, yTop = 1.04;

  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    const y = yBot + v * (yTop - yBot);

    // Đường cong dáng áo chibi tròn bầu phồng giữa, gọn cổ và gọn eo
    const belly = Math.sin(v * Math.PI);
    const rx = 0.255 + belly * 0.068 - (v > 0.78 ? (v - 0.78) * 0.26 : 0);
    const rz = 0.215 + belly * 0.055 - (v > 0.78 ? (v - 0.78) * 0.18 : 0);

    // Độ mở khe áo phía trước (rộng vừa phải từ cổ đến gấu áo để lộ áo trắng)
    const gapHalfAng = 0.34 + (1 - v) * 0.06;
    const startAng = gapHalfAng;
    const endAng = Math.PI * 2 - gapHalfAng;

    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      const ang = startAng + u * (endAng - startAng);
      // ang=0 là chính giữa trước (-Z), ang=PI là chính giữa lưng (+Z)
      let x = -Math.sin(ang) * rx;
      let z = -Math.cos(ang) * rz;

      // Hơi cong phồng mềm ở mép vạt áo trước tạo độ dày vải khoác
      const edgeDist = Math.min(u, 1 - u);
      if (edgeDist < 0.08) {
        const fold = (0.08 - edgeDist) / 0.08;
        z += fold * 0.028;
      }

      // Lưng áo hơi đẩy nhẹ ra sau tự nhiên
      if (z > 0) z += 0.025 * belly;

      positions.push(x, y, z + 0.015);
      uvs.push(u * 2, v);
    }
  }

  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i;
      const b = a + 1;
      const c = a + (segU + 1);
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const sansSkullTexNormal = createSansSkullFullTexture(false);
const sansSkullTexSeeker = createSansSkullFullTexture(true);
const sansHoodieTexBlue = createSansHoodieTexture('#2459cc', '#153685', '#3d76f0');
const sansHoodieTexRed = createSansHoodieTexture('#c92828', '#7d1414', '#e84545');
const sansSleeveTexBlue = createSansSleeveTexture('#2459cc', '#16398a', '#3c75ed');
const sansSleeveTexRed = createSansSleeveTexture('#c92828', '#7d1414', '#e84545');
const sansRibbedTexBlue = createSansRibbedTexture('#1d48a8', '#112c6b');
const sansRibbedTexRed = createSansRibbedTexture('#991b1b', '#691010');
const sansHoodGreyTex = createSansHoodieTexture('#c8ced8', '#8d96a6', '#e2e6ee');
const sansShirtTex = createSansShirtTexture();
const sansCyanGlowTex = createGlowHaloTexture('#38bdf8');
const sansOpenHoodieGeo = createOpenHoodieShellGeometry();

// Tạo sẵn hình học 2 tay áo đút túi liền mạch (trái & phải)
const sansLeftSleeveGeo = createVariableTubeGeometry(
  [
    new THREE.Vector3(-0.22, 0.96, 0.02),
    new THREE.Vector3(-0.34, 0.90, 0.02),
    new THREE.Vector3(-0.385, 0.77, -0.01),
    new THREE.Vector3(-0.31, 0.67, -0.10),
    new THREE.Vector3(-0.18, 0.64, -0.15)
  ],
  [0.102, 0.112, 0.116, 0.104, 0.072],
  24, 16, new THREE.Vector3(-1, 0.15, 0)
);

const sansRightSleeveGeo = createVariableTubeGeometry(
  [
    new THREE.Vector3(0.22, 0.96, 0.02),
    new THREE.Vector3(0.34, 0.90, 0.02),
    new THREE.Vector3(0.385, 0.77, -0.01),
    new THREE.Vector3(0.31, 0.67, -0.10),
    new THREE.Vector3(0.18, 0.64, -0.15)
  ],
  [0.102, 0.112, 0.116, 0.104, 0.072],
  24, 16, new THREE.Vector3(1, 0.15, 0)
);

function createPlumBlossom(scale = 1) {
  const flower = new THREE.Group();
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xd93829, roughness: 0.45 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, emissive: 0x4a3b00 });
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.055 * scale, 10, 8), petalMat);
    petal.scale.set(1, 1, 0.38);
    petal.position.set(Math.cos(ang) * 0.065 * scale, Math.sin(ang) * 0.065 * scale, 0);
    flower.add(petal);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.032 * scale, 8, 8), centerMat);
  core.position.z = 0.015 * scale;
  flower.add(core);
  return flower;
}

function buildAccessoryMesh(hatId) {
  const g = new THREE.Group();

  if (hatId === 'hutao') {
    const h = new THREE.Group(); h.position.y = 0.17;
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x22262d, roughness: 0.55, metalness: 0.12 });
    const brimMat = new THREE.MeshStandardMaterial({ color: 0x2b313a, roughness: 0.5, metalness: 0.15 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.46, 0.10, 28), brimMat);
    brim.position.y = 0.02; h.add(brim);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.33, 0.21, 28), darkMat);
    crown.position.y = 0.16; h.add(crown);
    const topDome = new THREE.Mesh(new THREE.SphereGeometry(0.31, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.35), darkMat);
    topDome.scale.set(1, 0.32, 1); topDome.position.y = 0.24; h.add(topDome);

    const talisman = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.30),
      new THREE.MeshStandardMaterial({ map: talismanTex, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, roughness: 0.5 })
    );
    talisman.position.set(0, 0.19, -0.345); talisman.rotation.x = -0.14; talisman.rotation.y = Math.PI;
    h.add(talisman);

    const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.28, 8), new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.7 }));
    twig.position.set(-0.33, 0.20, -0.05); twig.rotation.z = 0.35; h.add(twig);

    [
      { pos: [-0.35, 0.24, -0.04], rotY: -Math.PI / 2, sc: 1.05 },
      { pos: [-0.30, 0.14, -0.18], rotY: -Math.PI * 0.65, sc: 0.92 },
      { pos: [-0.36, 0.10, -0.02], rotY: -Math.PI / 2, sc: 0.78 },
      { pos: [-0.23, 0.11, -0.27], rotY: -Math.PI * 0.78, sc: 0.48 }
    ].forEach(f => {
      const fl = createPlumBlossom(f.sc);
      fl.position.set(...f.pos); fl.rotation.y = f.rotY; h.add(fl);
    });
    g.add(h);

  } else if (hatId === 'furina') {
    const h = new THREE.Group(); h.position.set(0.04, 0.19, 0.0); h.rotation.z = -0.18; h.rotation.x = 0.07;
    const blueMain = new THREE.MeshStandardMaterial({ color: 0x2236a8, roughness: 0.45, metalness: 0.12 });
    const blueDark = new THREE.MeshStandardMaterial({ color: 0x16226b, roughness: 0.55 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5fc, roughness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xdcc296, roughness: 0.28, metalness: 0.68 });
    const gemMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.5, roughness: 0.15 });

    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.41, 0.045, 28), blueDark); brim.position.y = 0.01; h.add(brim);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.235, 0.33, 28), blueMain); crown.position.y = 0.18; h.add(crown);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.252, 0.242, 0.042, 28), whiteMat); band.position.y = 0.085; h.add(band);
    const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.282, 0.016, 10, 28), goldMat);
    rimRing.rotation.x = Math.PI / 2; rimRing.position.y = 0.33; h.add(rimRing);

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2, r = 0.285;
      const sp = new THREE.Group(); sp.position.set(Math.cos(a) * r, 0.33, Math.sin(a) * r); sp.rotation.y = -a + Math.PI / 2;
      const diamond = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.15, 4), goldMat); diamond.position.y = 0.05; sp.add(diamond);
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.011, 8, 14), goldMat); loop.position.y = 0.135; sp.add(loop);
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), goldMat); pearl.position.y = 0.18; sp.add(pearl);
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), gemMat);
      gem.scale.set(0.85, 1.35, 0.65); gem.position.set(0.085, -0.06, 0.015); sp.add(gem);
      h.add(sp);
    }

    const bowGroup = new THREE.Group(); bowGroup.position.set(-0.30, 0.07, -0.05); bowGroup.rotation.y = -Math.PI / 2;
    const bowL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.04), blueMain); bowL.position.set(-0.06, 0.01, 0); bowL.rotation.z = 0.25;
    const bowR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.04), blueMain); bowR.position.set(0.06, 0.01, 0); bowR.rotation.z = -0.25;
    const bowGem = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), gemMat); bowGem.scale.set(0.9, 1.3, 0.8); bowGem.position.z = 0.025;
    bowGroup.add(bowL, bowR, bowGem);
    for (let k = 0; k < 5; k++) {
      const feather = new THREE.Mesh(new THREE.SphereGeometry(0.055 - k * 0.008, 10, 8), whiteMat);
      feather.scale.set(0.95, 1.35, 0.35); feather.position.set(0.02 * k, -0.07 - k * 0.075, -0.01); feather.rotation.z = 0.18 + k * 0.05;
      bowGroup.add(feather);
    }
    h.add(bowGroup); g.add(h);

  } else if (hatId === 'obito') {
    const maskGeo = new THREE.SphereGeometry(0.228, 28, 22, 0, Math.PI, 0, Math.PI);
    const maskMat = new THREE.MeshStandardMaterial({ map: obitoMaskTex, roughness: 0.28, metalness: 0.08, side: THREE.DoubleSide });
    const mask = new THREE.Mesh(maskGeo, maskMat);
    mask.rotation.y = Math.PI; mask.scale.set(0.98, 1.13, 0.68); mask.position.set(0, 0.0, -0.075);
    g.add(mask);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.012, 8, 24), new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.8 }));
    strap.rotation.x = Math.PI / 2; g.add(strap);

  } else if (hatId === 'mahoraga') {
    const wheelHolder = new THREE.Group(); wheelHolder.position.set(0, 0.44, 0.05); wheelHolder.rotation.x = Math.PI / 2 - 0.18;
    const wheel = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4c372, roughness: 0.28, metalness: 0.72, emissive: 0x332b08, emissiveIntensity: 0.35 });
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 12, 32), goldMat));
    wheel.add(new THREE.Mesh(new THREE.SphereGeometry(0.072, 14, 12), goldMat));
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.46, 8), goldMat);
      spoke.position.set(Math.cos(ang) * 0.23, Math.sin(ang) * 0.23, 0); spoke.rotation.z = ang - Math.PI / 2; wheel.add(spoke);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.066, 12, 10), goldMat);
      orb.position.set(Math.cos(ang) * 0.48, Math.sin(ang) * 0.48, 0); wheel.add(orb);
    }
    wheelHolder.add(wheel); g.add(wheelHolder); g.userData.spinWheel = wheel;

  } else if (hatId === 'gojo') {
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x16181f, roughness: 0.85, metalness: 0.05 });
    const blindfold = new THREE.Mesh(new THREE.CylinderGeometry(0.228, 0.220, 0.148, 24), clothMat);
    blindfold.scale.set(0.97, 1.0, 0.99); blindfold.position.set(0, 0.035, 0); g.add(blindfold);

    const hairMat = new THREE.MeshStandardMaterial({ color: 0xe6f6ff, emissive: 0x183d54, emissiveIntensity: 0.28, roughness: 0.48 });
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.46), hairMat);
    hairCap.position.set(0, 0.04, 0); g.add(hairCap);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, hLen = 0.22 + (i % 3) * 0.045;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.072, hLen, 7), hairMat);
      spike.position.set(Math.cos(a) * 0.17, 0.22, Math.sin(a) * 0.17);
      spike.rotation.z = -Math.cos(a) * 0.52; spike.rotation.x = Math.sin(a) * 0.52; g.add(spike);
    }
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.3, hLen = 0.27 + (i % 2) * 0.05;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.076, hLen, 7), hairMat);
      spike.position.set(Math.cos(a) * 0.085, 0.29, Math.sin(a) * 0.085);
      spike.rotation.z = -Math.cos(a) * 0.24; spike.rotation.x = Math.sin(a) * 0.24; g.add(spike);
    }
    const centerSpike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.31, 7), hairMat);
    centerSpike.position.set(0, 0.33, -0.01); centerSpike.rotation.x = -0.12; g.add(centerSpike);

  } else if (hatId === 'frog') {
    const greenMat = new THREE.MeshStandardMaterial({ map: frogSkinTex, roughness: 0.62, metalness: 0.05 });
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xebd71c, roughness: 0.42, metalness: 0.04 });
    const eyeYMat = new THREE.MeshStandardMaterial({ color: 0xe6cb25, roughness: 0.28 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.12, metalness: 0.2 });
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x0b0e08 });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const headCover = new THREE.Mesh(new THREE.SphereGeometry(0.248, 24, 20), greenMat);
    headCover.scale.set(0.96, 1.15, 1.06); headCover.position.set(0, 0.01, -0.01); g.add(headCover);
    const neckCover = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.16, 0.16, 18), greenMat);
    neckCover.position.set(0, -0.22, 0.01); g.add(neckCover);
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 14), greenMat);
    snout.scale.set(0.86, 1.02, 1.02); snout.position.set(0, -0.05, -0.15); g.add(snout);

    [-1, 1].forEach(side => {
      const ridge = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), greenMat);
      ridge.scale.set(0.32, 1.35, 0.68); ridge.position.set(side * 0.22, 0.06, 0.05); ridge.rotation.y = side * 0.25; g.add(ridge);

      const eyeGroup = new THREE.Group(); eyeGroup.position.set(side * 0.155, 0.085, -0.145); eyeGroup.rotation.y = side * 0.62;
      eyeGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.015, 8, 18), greenMat));
      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.064, 16, 12), eyeYMat); eyeball.scale.set(1, 1, 0.72); eyeGroup.add(eyeball);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.041, 14, 10), pupilMat); pupil.scale.set(1, 1, 0.6); pupil.position.z = -0.032; eyeGroup.add(pupil);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), glintMat); glint.position.set(side * -0.014, 0.016, -0.055); eyeGroup.add(glint);
      g.add(eyeGroup);

      const bump = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 10), greenMat);
      bump.scale.set(1.05, 0.9, 0.85); bump.position.set(side * 0.052, 0.045, -0.235); g.add(bump);
      const hole = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), holeMat);
      hole.scale.set(1.25, 0.62, 0.7); hole.position.set(side * 0.052, 0.040, -0.266); g.add(hole);
    });

    const upperLip = new THREE.Mesh(new THREE.SphereGeometry(0.088, 16, 12), lipMat);
    upperLip.scale.set(1.18, 0.56, 0.72); upperLip.position.set(0, -0.105, -0.275); g.add(upperLip);
    const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.086, 16, 12), lipMat);
    lowerLip.scale.set(1.12, 0.58, 0.70); lowerLip.position.set(0, -0.165, -0.268); g.add(lowerLip);
    const mouthHole = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 8), holeMat);
    mouthHole.scale.set(1.35, 0.36, 0.6); mouthHole.position.set(0, -0.135, -0.320); g.add(mouthHole);

  } else if (hatId === 'shiba') {
    const furMat = new THREE.MeshStandardMaterial({ map: shibaFurTex, roughness: 0.72, metalness: 0.02 });
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xf4ead0, roughness: 0.75 });
    const earOuterMat = new THREE.MeshStandardMaterial({ color: 0xc99342, roughness: 0.72 });
    const earInnerMat = new THREE.MeshStandardMaterial({ color: 0x9c6e35, roughness: 0.8 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x1a1715, roughness: 0.28, metalness: 0.15 });
    const shadeDarkMat = new THREE.MeshStandardMaterial({ color: 0x101014, roughness: 0.3 });

    const headBall = new THREE.Mesh(new THREE.SphereGeometry(0.255, 24, 20), furMat);
    headBall.scale.set(1.06, 1.0, 1.04); headBall.position.set(0, 0.01, 0); g.add(headBall);

    const muzzle = new THREE.Mesh(new THREE.ConeGeometry(0.145, 0.26, 16), creamMat);
    muzzle.rotation.x = -Math.PI / 2; muzzle.scale.set(1.08, 1.0, 0.82); muzzle.position.set(0, -0.045, -0.24); g.add(muzzle);
    const muzzleBridge = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 10), furMat);
    muzzleBridge.scale.set(0.95, 0.72, 1.25); muzzleBridge.position.set(0, 0.0, -0.21); g.add(muzzleBridge);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 10), noseMat);
    nose.scale.set(1.18, 0.88, 0.9); nose.position.set(0, -0.025, -0.355); g.add(nose);

    [-1, 1].forEach(side => {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 12), creamMat);
      cheek.scale.set(1.0, 0.85, 0.92); cheek.position.set(side * 0.155, -0.06, -0.09); g.add(cheek);

      const smirk = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.014, 0.13), noseMat);
      smirk.position.set(side * 0.095, -0.105, -0.255); smirk.rotation.y = side * 0.36; smirk.rotation.x = -0.14; g.add(smirk);

      const earGrp = new THREE.Group();
      earGrp.position.set(side * 0.165, 0.225, 0.02);
      earGrp.rotation.z = side * -0.32; earGrp.rotation.x = -0.12; earGrp.rotation.y = side * -0.22;
      const outerEar = new THREE.Mesh(new THREE.ConeGeometry(0.088, 0.20, 4), earOuterMat); outerEar.scale.set(1.0, 1.0, 0.55); earGrp.add(outerEar);
      const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.054, 0.13, 4), earInnerMat); innerEar.scale.set(1.0, 1.0, 0.45); innerEar.position.set(0, -0.015, -0.022); earGrp.add(innerEar);
      g.add(earGrp);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.032, 0.27), shadeDarkMat);
      arm.position.set(side * 0.265, 0.115, -0.13); g.add(arm);
    });

    const shadesFront = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.14),
      new THREE.MeshBasicMaterial({ map: pixelShadesTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })
    );
    shadesFront.position.set(0, 0.068, -0.268); shadesFront.rotation.y = Math.PI; g.add(shadesFront);
    const shadesTopBar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.026, 0.022), shadeDarkMat);
    shadesTopBar.position.set(0, 0.122, -0.256); g.add(shadesTopBar);

  } else if (hatId === 'helmet') {
    const h = new THREE.Group(); h.position.y = 0.17;
    const yMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.1 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.29, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), yMat); dome.position.y = 0.02; h.add(dome);
    const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.33, 0.04, 20), yMat); visor.position.set(0, 0.03, -0.05); h.add(visor);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    lamp.rotation.x = Math.PI / 2; lamp.position.set(0, 0.13, -0.28); h.add(lamp); g.add(h);

  } else if (hatId === 'crown') {
    const h = new THREE.Group(); h.position.y = 0.17;
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.75 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 0.14, 16), goldMat); base.position.y = 0.08; h.add(base);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 6), goldMat);
      spike.position.set(Math.cos(a) * 0.18, 0.20, Math.sin(a) * 0.18); h.add(spike);
    }
    g.add(h);
  }

  return g;
}

function createFlashlightMesh(scale = 1) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.35, metalness: 0.65 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.4 });
  const lensMat = new THREE.MeshBasicMaterial({ color: 0xfffef0 });

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.065 * scale, 0.06 * scale, 0.46 * scale, 14), bodyMat);
  handle.rotation.x = Math.PI / 2; g.add(handle);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.075 * scale, 0.16 * scale, 16), headMat);
  head.rotation.x = Math.PI / 2; head.position.z = -0.28 * scale; g.add(head);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.095 * scale, 16), lensMat);
  lens.position.z = -0.365 * scale; lens.rotation.y = Math.PI; g.add(lens);
  return g;
}

function createRoundedLimb(rTop, rBot, len, mat, renderOrder = 0) {
  const g = new THREE.Group();
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, 20), mat);
  const cap1 = new THREE.Mesh(new THREE.SphereGeometry(rTop, 20, 14), mat); cap1.position.y = len / 2;
  const cap2 = new THREE.Mesh(new THREE.SphereGeometry(rBot, 20, 14), mat); cap2.position.y = -len / 2;
  if (renderOrder) { cyl.renderOrder = cap1.renderOrder = cap2.renderOrder = renderOrder; }
  g.add(cyl, cap1, cap2);
  return g;
}

function buildBodyParts(mat, renderOrder = 0) {
  const grp = new THREE.Group();
  const torso = createRoundedLimb(0.22, 0.20, 0.48, mat, renderOrder);
  torso.scale.set(1.0, 1.0, 0.72); torso.position.y = 0.96; grp.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.14, 16), mat);
  neck.position.y = 1.32; if (renderOrder) neck.renderOrder = renderOrder; grp.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.215, 24, 20), mat);
  head.scale.set(0.95, 1.08, 0.95); head.position.y = 1.54; if (renderOrder) head.renderOrder = renderOrder; grp.add(head);

  const leftArm = createRoundedLimb(0.085, 0.095, 0.56, mat, renderOrder);
  leftArm.position.set(-0.42, 1.24, 0); leftArm.rotation.z = 1.12; grp.add(leftArm);
  const rightArm = createRoundedLimb(0.085, 0.095, 0.56, mat, renderOrder);
  rightArm.position.set(0.42, 1.24, 0); rightArm.rotation.z = -1.12; grp.add(rightArm);

  const leftLeg = createRoundedLimb(0.115, 0.09, 0.62, mat, renderOrder);
  leftLeg.position.set(-0.22, 0.40, 0); leftLeg.rotation.z = -0.44; grp.add(leftLeg);
  const rightLeg = createRoundedLimb(0.115, 0.09, 0.62, mat, renderOrder);
  rightLeg.position.set(0.22, 0.40, 0); rightLeg.rotation.z = 0.44; grp.add(rightLeg);
  return { grp, leftLeg, rightLeg };
}

// =========================================================================
// MÔ HÌNH 3D SANS CHẤT LƯỢNG CAO (ĐIÊU KHẮC LIỀN MẠCH CHUẨN ẢNH MẪU)
// =========================================================================
function buildSansCharacterMesh(isSeeker = false, includeXray = false) {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  bodyGroup.scale.set(1.04, 1.04, 1.04);
  root.add(bodyGroup);

  const skullMat = new THREE.MeshStandardMaterial({
    map: isSeeker ? sansSkullTexSeeker : sansSkullTexNormal,
    roughness: 0.56,
    metalness: 0.02
  });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xe6dfd4, roughness: 0.58, metalness: 0.02 });
  const hoodieMat = new THREE.MeshStandardMaterial({
    map: sansHoodieTexBlue,
    roughness: 0.62, metalness: 0.04,
    side: THREE.DoubleSide,
    emissive: isSeeker ? 0x0d5bd6 : 0x000000,
    emissiveIntensity: isSeeker ? 0.65 : 0
  });
  const sleeveMat = new THREE.MeshStandardMaterial({
    map: sansSleeveTexBlue,
    roughness: 0.62, metalness: 0.04,
    emissive: isSeeker ? 0x0d5bd6 : 0x000000,
    emissiveIntensity: isSeeker ? 0.65 : 0
  });
  const ribbedMat = new THREE.MeshStandardMaterial({
    map: sansRibbedTexBlue,
    roughness: 0.70,
    emissive: isSeeker ? 0x093c91 : 0x000000,
    emissiveIntensity: isSeeker ? 0.55 : 0
  });
  const hoodGreyMat = new THREE.MeshStandardMaterial({ map: sansHoodGreyTex, roughness: 0.76 });
  const hoodInnerDarkMat = new THREE.MeshStandardMaterial({ color: 0x454c59, roughness: 0.9 });
  const shirtMat = new THREE.MeshStandardMaterial({ map: sansShirtTex, roughness: 0.72 });
  const trimGreyMat = new THREE.MeshStandardMaterial({ color: 0xc2c9d4, roughness: 0.55 });
  const blackDrawstringMat = new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.65 });
  const shortsMat = new THREE.MeshStandardMaterial({ color: 0x15171e, roughness: 0.80 });
  const stripeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.52 });
  const slipperPinkMat = new THREE.MeshStandardMaterial({ color: 0xf28db2, roughness: 0.58 });
  const slipperSoleMat = new THREE.MeshStandardMaterial({ color: 0xd1658e, roughness: 0.78 });

  // 1. ĐẦU SỌ 1 KHỐI ĐIÊU KHẮC LIỀN MẠCH (MẮT TO, MIỆNG CƯỜI RỘNG, GÒ MÁ TỰ NHIÊN)
  const skullMesh = new THREE.Mesh(sculptedSansSkullGeo, skullMat);
  bodyGroup.add(skullMesh);

  // Cổ xương ngắn gọn nối sọ với áo
  const neckBone = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.115, 0.14, 16), boneMat);
  neckBone.position.set(0, 1.09, 0.0);
  bodyGroup.add(neckBone);

  // Hiệu ứng hào quang xanh nhẹ trên mắt trái khi Sans làm Người Bắt
  let sansEyeGlow = null;
  if (isSeeker) {
    sansEyeGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sansCyanGlowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sansEyeGlow.position.set(-0.104, 1.385, -0.242);
    sansEyeGlow.scale.set(0.32, 0.32, 1);
    bodyGroup.add(sansEyeGlow);
  }

  // 2. ÁO LÓT TRẮNG + VỎ ÁO HOODIE MỞ PHANH LIỀN MẠCH + VIỀN KHÓA XÁM + DÂY RÚT ĐEN
  const undershirt = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.215, 0.48, 24), shirtMat);
  undershirt.scale.set(1.0, 1.0, 0.88);
  undershirt.position.set(0, 0.80, 0.0);
  bodyGroup.add(undershirt);

  const jacketShell = new THREE.Mesh(sansOpenHoodieGeo, hoodieMat);
  bodyGroup.add(jacketShell);

  // Bo gấu áo xanh đậm gọn ở eo
  const waistHem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.268, 0.258, 0.072, 28, 1, false, -Math.PI + 0.38, Math.PI * 2 - 0.76),
    ribbedMat
  );
  waistHem.scale.set(1.02, 1.0, 0.86);
  waistHem.position.set(0, 0.555, 0.015);
  bodyGroup.add(waistHem);

  // Viền khóa kéo xám sáng & dây rút ĐEN rủ tự nhiên hai bên ngực (đúng mẫu)
  [-1, 1].forEach(side => {
    const trimCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.088, 1.02, -0.178),
      new THREE.Vector3(side * 0.102, 0.82, -0.242),
      new THREE.Vector3(side * 0.098, 0.56, -0.205)
    ]);
    const trimMesh = new THREE.Mesh(new THREE.TubeGeometry(trimCurve, 14, 0.015, 8, false), trimGreyMat);
    bodyGroup.add(trimMesh);

    // Dây rút mũ màu ĐEN rủ cong nhẹ theo dáng ngực
    const strCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.112, 1.01, -0.175),
      new THREE.Vector3(side * 0.132, 0.90, -0.240),
      new THREE.Vector3(side * 0.125, 0.79, -0.248)
    ]);
    const strMesh = new THREE.Mesh(new THREE.TubeGeometry(strCurve, 12, 0.012, 8, false), blackDrawstringMat);
    bodyGroup.add(strMesh);

    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), blackDrawstringMat);
    knot.position.set(side * 0.125, 0.785, -0.248);
    bodyGroup.add(knot);
  });

  // 3. MŨ HOODIE XÁM SÁNG DÀY GẤP NẾP ÔM CỔ & RỦ ĐẸP PHÍA SAU LƯNG
  const hoodCollarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.115, 1.02, -0.175),
    new THREE.Vector3(-0.245, 1.08, -0.02),
    new THREE.Vector3(-0.235, 1.12, 0.16),
    new THREE.Vector3(0.0,    1.13, 0.24),
    new THREE.Vector3(0.235,  1.12, 0.16),
    new THREE.Vector3(0.245,  1.08, -0.02),
    new THREE.Vector3(0.115,  1.02, -0.175)
  ]);
  const hoodCollar = new THREE.Mesh(new THREE.TubeGeometry(hoodCollarCurve, 28, 0.062, 14, false), hoodGreyMat);
  bodyGroup.add(hoodCollar);

  // Lớp nếp gấp thứ 2 của mũ xám rủ xuống lưng (nhìn mặt sau & mặt nghiêng chuẩn ảnh mẫu)
  const hoodBackMain = new THREE.Mesh(new THREE.SphereGeometry(0.235, 22, 18), hoodGreyMat);
  hoodBackMain.scale.set(1.12, 0.72, 0.88);
  hoodBackMain.position.set(0, 0.99, 0.195);
  hoodBackMain.rotation.x = -0.32;
  bodyGroup.add(hoodBackMain);

  const hoodBackTip = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.24, 18), hoodGreyMat);
  hoodBackTip.scale.set(1.15, 1.0, 0.65);
  hoodBackTip.position.set(0, 0.97, 0.305);
  hoodBackTip.rotation.x = Math.PI * 0.58;
  bodyGroup.add(hoodBackTip);

  const hoodInnerShade = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.175, 0.10, 18), hoodInnerDarkMat);
  hoodInnerShade.position.set(0, 1.06, 0.01);
  bodyGroup.add(hoodInnerShade);

  // 4. HAI TAY ÁO ĐÚT TÚI LIỀN MẠCH CÓ SỌC TRẮNG DỌC MẶT NGOÀI
  bodyGroup.add(new THREE.Mesh(sansLeftSleeveGeo, sleeveMat));
  bodyGroup.add(new THREE.Mesh(sansRightSleeveGeo, sleeveMat));

  // 5. QUẦN ĐÙI ĐEN CÓ SỌC TRẮNG ĐÔI HAI BÊN HÔNG
  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.228, 0.238, 0.14, 22), shortsMat);
  pelvis.scale.set(1.04, 1.0, 0.86);
  pelvis.position.set(0, 0.495, 0.01);
  bodyGroup.add(pelvis);

  const createLegWithSlipper = (side) => {
    const legGrp = new THREE.Group();
    legGrp.position.set(side * 0.132, 0.45, 0.01);

    // Ống quần đùi đen gọn đẹp
    const shortLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.110, 0.118, 0.22, 20), shortsMat);
    shortLeg.position.set(0, -0.05, 0);
    legGrp.add(shortLeg);

    // Sọc trắng đôi chạy dọc hông ngoài quần đùi (đúng ảnh mẫu)
    [-0.022, 0.022].forEach(zOff => {
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.205, 0.024), stripeWhiteMat);
      st.position.set(side * 0.112, -0.05, zOff);
      legGrp.add(st);
    });

    // Ống chân xương NGẮN tỉ lệ chibi (không dài ngoằng như bản cũ)
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.034, 0.19, 14), boneMat);
    shin.position.set(0, -0.24, 0.0);
    legGrp.add(shin);

    // Khớp cổ chân & bàn chân xương nhỏ bước vào dép
    const ankleJoint = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 10), boneMat);
    ankleJoint.scale.set(1.1, 0.8, 1.15);
    ankleJoint.position.set(0, -0.34, -0.01);
    legGrp.add(ankleJoint);

    // Đế dép hồng phẳng kéo dài ra sau gót (dáng dép lê mở gót chuẩn ảnh mẫu)
    const sole = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.10, 0.038, 20), slipperSoleMat);
    sole.scale.set(1.04, 1.0, 1.52);
    sole.position.set(0, -0.43, -0.045);
    legGrp.add(sole);

    // Mũ dép bông hồng tròn mượt ôm phần mũi bàn chân
    const toeDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.098, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.56),
      slipperPinkMat
    );
    toeDome.scale.set(1.04, 1.02, 1.18);
    toeDome.position.set(0, -0.415, -0.088);
    legGrp.add(toeDome);

    return legGrp;
  };

  const leftLeg = createLegWithSlipper(-1);
  const rightLeg = createLegWithSlipper(1);
  bodyGroup.add(leftLeg, rightLeg);

  let seekerAuraRing = null;
  if (isSeeker) {
    seekerAuraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.98, 28),
      new THREE.MeshBasicMaterial({ color: 0x22b8ff, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    seekerAuraRing.rotation.x = -Math.PI / 2; seekerAuraRing.position.y = 0.05;
    root.add(seekerAuraRing);
  }

  let handItem = null;
  if (!isSeeker) {
    handItem = createFlashlightMesh(0.85);
    handItem.position.set(0.42, 0.85, -0.18);
    handItem.visible = false;
    bodyGroup.add(handItem);
  }

  let xrayGroup = null;
  if (includeXray) {
    const xr = buildBodyParts(xraySilhouetteMat, 998);
    xrayGroup = xr.grp;
    xrayGroup.scale.set(1.02, 0.96, 1.02);
    xrayGroup.visible = false;
    bodyGroup.add(xrayGroup);
  }

  let stunEffectGroup = null;
  if (!isSeeker) {
    stunEffectGroup = createStunEffectGroup();
    root.add(stunEffectGroup);
  }

  root.userData = {
    bodyGroup,
    leftLeg,
    rightLeg,
    xrayGroup,
    handItem,
    spinWheel: null,
    seekerAuraRing,
    sansEyeGlow,
    stunEffectGroup
  };
  return root;
}

function buildCharacterMesh(skinHex, hatId, isSeeker, includeXray = false, isSans = false) {
  if (isSans) {
    return buildSansCharacterMesh(isSeeker, includeXray);
  }

  const root = new THREE.Group();
  const bodyColor = isSeeker ? 0xdc2626 : skinHex;
  const mat = new THREE.MeshStandardMaterial({
    color: bodyColor, roughness: 0.38, metalness: 0.06,
    emissive: isSeeker ? 0x6b0808 : 0x000000
  });

  const body = buildBodyParts(mat, 0);
  root.add(body.grp);

  let seekerAuraRing = null;
  if (isSeeker) {
    seekerAuraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.95, 24),
      new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
    );
    seekerAuraRing.rotation.x = -Math.PI / 2; seekerAuraRing.position.y = 0.05;
    root.add(seekerAuraRing);
  }

  let spinWheel = null;
  if (hatId && hatId !== 'none') {
    const acc = buildAccessoryMesh(hatId);
    acc.position.set(0, 1.54, 0);
    body.grp.add(acc);
    if (acc.userData.spinWheel) spinWheel = acc.userData.spinWheel;
  }

  let handItem = null;
  if (!isSeeker) {
    handItem = createFlashlightMesh(0.85);
    handItem.position.set(0.56, 1.32, -0.15);
    handItem.visible = false;
    body.grp.add(handItem);
  }

  let xrayGroup = null;
  if (includeXray) {
    const xr = buildBodyParts(xraySilhouetteMat, 998);
    xrayGroup = xr.grp;
    xrayGroup.scale.set(1.06, 1.03, 1.06);
    xrayGroup.visible = false;
    body.grp.add(xrayGroup);
  }

  let stunEffectGroup = null;
  if (!isSeeker) {
    stunEffectGroup = createStunEffectGroup();
    root.add(stunEffectGroup);
  }

  root.userData = {
    bodyGroup: body.grp, leftLeg: body.leftLeg, rightLeg: body.rightLeg,
    xrayGroup, handItem, spinWheel, seekerAuraRing, stunEffectGroup
  };
  return root;
}

function createNameTagSprite(text, colorHex = '#ffffff', scaleW = 1.48, scaleH = 0.34) {
  const c = document.createElement('canvas'); c.width = 290; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(0, 0, 0, 0.74)'; g.fillRect(6, 10, 278, 44);
  g.strokeStyle = colorHex; g.lineWidth = 3; g.strokeRect(6, 10, 278, 44);
  g.fillStyle = colorHex; g.font = 'bold 21px Segoe UI';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 145, 33);

  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthWrite: false, fog: true
  }));
  sp.scale.set(scaleW, scaleH, 1); sp.position.y = 2.48;
  return sp;
}

function disposeNameTag(sp) {
  if (!sp) return;
  if (sp.material) {
    if (sp.material.map) sp.material.map.dispose();
    sp.material.dispose();
  }
}


// =========================================================================
// MÔ HÌNH 3D GASTER BLASTER (ĐẦU XƯƠNG RỒNG PHÓNG TIA TRẮNG XANH CỦA SANS)
// =========================================================================
function createGasterBlasterBoneTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#f8fafc');
  grad.addColorStop(0.5, '#e2e8f0');
  grad.addColorStop(1.0, '#b8c4d9');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);

  // Vân xương tinh tế & bóng đổ lạnh xanh nhạt
  for (let i = 0; i < 1200; i++) {
    g.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(56, 84, 128, 0.08)';
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 4);
  }
  return new THREE.CanvasTexture(c);
}
const gasterBoneTex = createGasterBlasterBoneTexture();

// Khối sọ trên Gaster Blaster điêu khắc sắc sảo (đỉnh nhọn vương miện, má loe góc cạnh, mõm rồng)
function createGasterCraniumGeometry() {
  const segX = 36, segY = 24;
  const positions = [], uvs = [], indices = [];

  for (let j = 0; j <= segY; j++) {
    const v = j / segY;
    const phi = (v - 0.5) * Math.PI;
    const cphi = Math.cos(phi), sphi = Math.sin(phi);

    for (let i = 0; i <= segX; i++) {
      const u = i / segX;
      const ang = (u - 0.5) * Math.PI * 2;
      const ux = -Math.sin(ang) * cphi;
      const uy = sphi;
      const uz = -Math.cos(ang) * cphi;

      // Dáng sọ rồng dài về trước (-Z), rộng gò má, thon đỉnh
      let x = ux * 0.44;
      let y = uy * 0.34;
      let z = uz * 0.56;

      // Đỉnh đầu nhọn hình mũi giáo đặc trưng (như ảnh mẫu)
      if (uy > 0.15) {
        const crest = Math.exp(-Math.pow(ux / 0.38, 2)) * (uy - 0.15);
        y += crest * 0.24;
        z += crest * 0.14;
      }

      // Kéo dài mõm về phía trước (-Z) và hơi thu gọn đầu mõm
      if (uz < 0) {
        const snoutF = Math.min(1, -uz);
        z -= snoutF * 0.22;
        x *= (1 - snoutF * 0.18);
      }

      // Phồng gờ gò má góc cạnh ở 2 bên mặt
      const cheek = Math.exp(-Math.pow((Math.abs(ux) - 0.72) / 0.28, 2)) * Math.exp(-Math.pow((uy + 0.18) / 0.32, 2));
      x += Math.sign(ux) * 0.11 * cheek;

      // Nén đáy sọ thành vòm miệng phẳng để khớp với răng hàm trên
      if (uy < -0.35) {
        y = -0.35 * 0.34 + (uy + 0.35) * 0.08;
      }

      // Lõm 2 hốc mắt sắc cạnh
      [-1, 1].forEach(side => {
        const da = (ang - side * 0.52) / 0.28;
        const dp = (phi - 0.02) / 0.28;
        const d2 = da * da + dp * dp;
        if (d2 < 2.2) {
          const ind = Math.exp(-d2 * 1.6);
          z += 0.08 * ind;
          x -= side * 0.03 * ind;
        }
      });

      positions.push(x, y + 0.14, z);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < segY; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * (segX + 1) + i;
      const b = a + 1;
      const c = a + (segX + 1);
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const gasterCraniumGeo = createGasterCraniumGeometry();

// Cặp sừng xương cong vút ra sau hai bên đỉnh đầu Gaster Blaster
const gasterLeftHornGeo = createVariableTubeGeometry(
  [
    new THREE.Vector3(-0.34, 0.28, 0.04),
    new THREE.Vector3(-0.48, 0.42, 0.20),
    new THREE.Vector3(-0.46, 0.56, 0.46),
    new THREE.Vector3(-0.34, 0.64, 0.72)
  ],
  [0.105, 0.088, 0.056, 0.012],
  18, 12, new THREE.Vector3(-1, 0.4, 0)
);
const gasterRightHornGeo = createVariableTubeGeometry(
  [
    new THREE.Vector3(0.34, 0.28, 0.04),
    new THREE.Vector3(0.48, 0.42, 0.20),
    new THREE.Vector3(0.46, 0.56, 0.46),
    new THREE.Vector3(0.34, 0.64, 0.72)
  ],
  [0.105, 0.088, 0.056, 0.012],
  18, 12, new THREE.Vector3(1, 0.4, 0)
);

// Cặp xương quai hàm dưới góc cạnh có gai khuỷu đặc trưng (như ảnh mẫu)
const gasterLeftJawArmGeo = createVariableTubeGeometry(
  [
    new THREE.Vector3(-0.36, 0.02, 0.04),
    new THREE.Vector3(-0.38, -0.14, -0.06),
    new THREE.Vector3(-0.28, -0.18, -0.34),
    new THREE.Vector3(-0.14, -0.14, -0.60),
    new THREE.Vector3(0.0, -0.12, -0.72)
  ],
  [0.068, 0.064, 0.058, 0.052, 0.045],
  18, 10, new THREE.Vector3(-1, 0, 0)
);
const gasterRightJawArmGeo = createVariableTubeGeometry(
  [
    new THREE.Vector3(0.36, 0.02, 0.04),
    new THREE.Vector3(0.38, -0.14, -0.06),
    new THREE.Vector3(0.28, -0.18, -0.34),
    new THREE.Vector3(0.14, -0.14, -0.60),
    new THREE.Vector3(0.0, -0.12, -0.72)
  ],
  [0.068, 0.064, 0.058, 0.052, 0.045],
  18, 10, new THREE.Vector3(1, 0, 0)
);

function createGasterBlasterMesh(beamWorldLength) {
  const root = new THREE.Group();
  const skullGroup = new THREE.Group();
  root.add(skullGroup);

  const boneMat = new THREE.MeshStandardMaterial({
    map: gasterBoneTex, color: 0xf4f7fc, roughness: 0.36, metalness: 0.14,
    emissive: 0x0b1f33, emissiveIntensity: 0.25
  });
  const darkVoidMat = new THREE.MeshBasicMaterial({ color: 0x04060b });
  const cyanEyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const whiteCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.08 });

  // 1. SỌ TRÊN + SỪNG XƯƠNG VUỐT NGƯỢC + RÃNH NỨT ĐEN GIỮA TRÁN
  skullGroup.add(new THREE.Mesh(gasterCraniumGeo, boneMat));
  skullGroup.add(new THREE.Mesh(gasterLeftHornGeo, boneMat));
  skullGroup.add(new THREE.Mesh(gasterRightHornGeo, boneMat));

  // Vết nứt đen dọc chính giữa trán ôm sát bề mặt sọ chạy thẳng xuống hốc mũi
  const crestCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.655, -0.155),
    new THREE.Vector3(0, 0.556, -0.422),
    new THREE.Vector3(0, 0.402, -0.638),
    new THREE.Vector3(0, 0.212, -0.778),
    new THREE.Vector3(0, 0.125, -0.788)
  ]);
  const fissureMesh = new THREE.Mesh(new THREE.TubeGeometry(crestCurve, 20, 0.024, 8, false), darkVoidMat);
  skullGroup.add(fissureMesh);

  // Hốc mũi giọt nước đen sâu ở chính giữa đầu mõm
  const noseHole = new THREE.Mesh(new THREE.SphereGeometry(0.082, 14, 12), darkVoidMat);
  noseHole.scale.set(0.84, 1.28, 0.58);
  noseHole.position.set(0, 0.12, -0.772);
  skullGroup.add(noseHole);

  // Vòm miệng trong tối sâu
  const palate = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), darkVoidMat);
  palate.scale.set(1.05, 0.40, 1.35);
  palate.position.set(0, 0.02, -0.22);
  skullGroup.add(palate);

  // 2 HỐC MẮT SẮC LẠNH + ĐỒNG TỬ XANH PHÁT SÁNG NẰM ĐÚNG HỐC LÕM SỌ
  [-1, 1].forEach(side => {
    const eyeGrp = new THREE.Group();
    eyeGrp.position.set(side * 0.246, 0.162, -0.592);
    eyeGrp.rotation.y = side * -0.50;
    eyeGrp.rotation.z = side * -0.22;

    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.128, 16, 14), darkVoidMat);
    socket.scale.set(1.22, 0.85, 0.42);
    eyeGrp.add(socket);

    const iris = new THREE.Mesh(new THREE.RingGeometry(0.042, 0.080, 18), cyanEyeMat);
    iris.position.set(side * -0.01, 0, -0.059);
    iris.rotation.y = Math.PI;
    eyeGrp.add(iris);

    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.044, 14), whiteCoreMat);
    pupil.position.set(side * -0.01, 0, -0.063);
    pupil.rotation.y = Math.PI;
    eyeGrp.add(pupil);

    const eyeHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sansCyanGlowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    eyeHalo.position.set(side * -0.01, 0, -0.082);
    eyeHalo.scale.set(0.36, 0.36, 1);
    eyeGrp.add(eyeHalo);

    skullGroup.add(eyeGrp);

    // Gờ xương má sắc nhọn 2 bên
    const cheekSpike = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.36, 6), boneMat);
    cheekSpike.position.set(side * 0.46, 0.06, -0.02);
    cheekSpike.rotation.z = side * -0.82;
    cheekSpike.rotation.x = 0.42;
    skullGroup.add(cheekSpike);
  });

  // HÀNG RĂNG NANH HÀM TRÊN SẮC NHỌN BÁM KHÍT VIỀN HÀM
  const upperFangsSpec = [
    [-0.34, 0.02, -0.40, 0.16], [ 0.34, 0.02, -0.40, 0.16],
    [-0.24, 0.02, -0.58, 0.23], [ 0.24, 0.02, -0.58, 0.23],
    [-0.11, 0.02, -0.69, 0.17], [ 0.11, 0.02, -0.69, 0.17],
    [ 0.00, 0.02, -0.73, 0.12]
  ];
  upperFangsSpec.forEach(([fx, fy, fz, flen]) => {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.038, flen, 7), toothMat);
    fang.rotation.x = Math.PI;
    fang.position.set(fx, fy - flen * 0.35, fz);
    skullGroup.add(fang);
  });

  // 2. HÀM DƯỚI CÓ KHỚP BẢN LỀ (MỞ RỘNG KHI TỤ LỰC & BẮN TIA)
  const jawGroup = new THREE.Group();
  jawGroup.position.set(0, -0.06, 0.06);
  skullGroup.add(jawGroup);

  jawGroup.add(new THREE.Mesh(gasterLeftJawArmGeo, boneMat));
  jawGroup.add(new THREE.Mesh(gasterRightJawArmGeo, boneMat));

  // Cằm nhọn & gai khuỷu xương quai hàm
  const chinTip = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.22, 6), boneMat);
  chinTip.rotation.x = -Math.PI * 0.44;
  chinTip.position.set(0, -0.14, -0.72);
  jawGroup.add(chinTip);

  [-1, 1].forEach(side => {
    const jawBarb = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.22, 6), boneMat);
    jawBarb.position.set(side * 0.42, -0.14, -0.06);
    jawBarb.rotation.z = side * -1.1;
    jawBarb.rotation.x = 0.5;
    jawGroup.add(jawBarb);
  });

  // Răng nanh hàm dưới chỉa lên
  [
    [-0.22, -0.12, -0.44, 0.14], [ 0.22, -0.12, -0.44, 0.14],
    [-0.12, -0.10, -0.60, 0.16], [ 0.12, -0.10, -0.60, 0.16],
    [ 0.00, -0.09, -0.67, 0.12]
  ].forEach(([fx, fy, fz, flen]) => {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.032, flen, 7), toothMat);
    fang.position.set(fx, fy + flen * 0.42, fz);
    jawGroup.add(fang);
  });

  // 3. QUẢ CẦU NĂNG LƯỢNG TRẮNG-XANH TỤ TRONG MIỆNG
  const chargeGroup = new THREE.Group();
  chargeGroup.position.set(0, -0.14, -0.42);
  skullGroup.add(chargeGroup);

  const orbCore = new THREE.Mesh(new THREE.SphereGeometry(0.20, 18, 14), whiteCoreMat);
  const orbOuter = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  const orbRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.022, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  const orbRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.018, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  orbRing2.rotation.y = Math.PI / 2;
  const orbHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: sansCyanGlowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  orbHalo.scale.set(1.45, 1.45, 1);
  chargeGroup.add(orbCore, orbOuter, orbRing1, orbRing2, orbHalo);

  // 4. TIA LASER TRẮNG XANH KHỔNG LỒ BẮN THẲNG VỀ PHÍA TRƯỚC (-Z)
  const L = Math.max(1.5, beamWorldLength);
  const beamGroup = new THREE.Group();
  beamGroup.position.set(0, -0.14, -0.48);
  beamGroup.visible = false;
  root.add(beamGroup);

  const makeBeamCyl = (r, color, opacity, pierce = false) => {
    const geo = new THREE.CylinderGeometry(r, r * 1.04, L, 20, 1, true);
    geo.translate(0, L / 2, 0);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, fog: false,
      side: THREE.DoubleSide, depthTest: !pierce, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const m = new THREE.Mesh(geo, mat);
    if (pierce) m.renderOrder = 992;
    return m;
  };

  const beamCore = makeBeamCyl(0.32, 0xffffff, 0.98, false);
  const beamMid = makeBeamCyl(0.58, 0x38bdf8, 0.74, false);
  const beamAura = makeBeamCyl(0.92, 0x0284c7, 0.36, false);
  // Tia hào quang xuyên tường giúp thấy rõ đường đạn cắt qua mê cung
  const beamPierceGlow = makeBeamCyl(0.46, 0x38bdf8, 0.24, true);
  beamGroup.add(beamCore, beamMid, beamAura, beamPierceGlow);

  // Cầu lóe sáng ở miệng súng
  const muzzleBurst = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.88, fog: false, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  beamGroup.add(muzzleBurst);

  // Các vòng sóng xung kích chạy dọc toàn bộ tia laser tầm xa
  const beamRings = [];
  const ringCount = Math.max(4, Math.min(14, Math.floor(L / 4.8)));
  for (let i = 0; i < ringCount; i++) {
    const rMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.76, 0.044, 8, 22),
      new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.84, fog: false, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    rMesh.position.z = -(i / ringCount) * L;
    beamGroup.add(rMesh);
    beamRings.push(rMesh);
  }

  // Nguồn sáng xanh dương-trắng soi sáng cả hành lang Backrooms khi phóng tia
  const light = new THREE.PointLight(0x38bdf8, 2.8, 32);
  light.position.set(0, 0, -1.2);
  root.add(light);

  root.userData = {
    skullGroup, jawGroup, chargeGroup, orbRing1, orbRing2,
    beamGroup, beamCore, beamMid, beamAura, beamPierceGlow, muzzleBurst, beamRings,
    beamLength: L, light
  };
  return root;
}

// Tạo vòng điện xanh quanh nhân vật Người Chạy khi bị choáng 5s
function createStunEffectGroup() {
  const grp = new THREE.Group();
  const rMat1 = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, transparent: true, opacity: 0.88, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const rMat2 = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe, transparent: true, opacity: 0.82, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.026, 8, 28), rMat1);
  ring1.rotation.x = Math.PI / 2 + 0.25;
  ring1.position.y = 0.95;
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.022, 8, 28), rMat2);
  ring2.rotation.x = Math.PI / 2 - 0.28;
  ring2.position.y = 1.25;
  const ring3 = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 24), rMat1);
  ring3.rotation.x = -Math.PI / 2;
  ring3.position.y = 0.06;
  grp.add(ring1, ring2, ring3);
  grp.visible = false;
  grp.userData = { ring1, ring2 };
  return grp;
}

function disposeObject3D(obj) {
  if (!obj) return;
  obj.traverse(child => {
    if (child.geometry && child.geometry !== gasterCraniumGeo && child.geometry !== gasterLeftHornGeo && child.geometry !== gasterRightHornGeo && child.geometry !== gasterLeftJawArmGeo && child.geometry !== gasterRightJawArmGeo) {
      child.geometry.dispose();
    }
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(m => {
        if (m.map && m.map !== gasterBoneTex && m.map !== sansCyanGlowTex) m.map.dispose();
        m.dispose();
      });
    }
  });
}
