/**
 * Procedural Canvas Textures & Vector Logos
 * Ultra crisp 2D canvas textures for HND Computer branding, shields, capes, and package labels
 */

import * as THREE from 'three';

// Create procedural label texture for computer packages
export function createPackageLabelTexture(isGold: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isGold ? '#fbbf24' : '#f8fafc';
  ctx.fillRect(0, 0, 256, 256);

  // Top header with HND COMPUTER branding
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(10, 10, 236, 52);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px sans-serif';
  ctx.fillText('HND COMPUTER', 22, 42);
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('EXPRESS TECH DELIVERY', 22, 56);

  // Fragile / Priority badge
  ctx.fillStyle = isGold ? '#b45309' : '#dc2626';
  ctx.fillRect(10, 68, 236, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(isGold ? '★ VIP GAMING PC HARDWARE ★' : '⚠ FRAGILE - KOMPONEN PC ⚠', 20, 90);

  // Tech item specification lines
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('ITEM: LAPTOP / MOTHERBOARD / GPU', 16, 124);
  ctx.fillText('DEST: HND COMPUTER INCE NURDIN', 16, 142);

  // Barcode
  ctx.fillStyle = '#0f172a';
  for (let x = 16; x < 240; x += 8) {
    const w = (x % 3 === 0) ? 5 : 2;
    ctx.fillRect(x, 160, w, 65);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Exact Vector Renderer for the official HND COMPUTER logo (Image 2)
 * Pixel-accurate geometric reproduction of "HND" and "COMPUTER"
 */
export function drawExactHNDLogoImage2(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  targetWidth: number,
  targetHeight: number,
  color: string = '#000000'
) {
  ctx.save();
  ctx.translate(x, y);

  // Native coordinate space: 480 x 300
  const scale = Math.min(targetWidth / 480, targetHeight / 300);
  // Center in target box
  const offsetX = (targetWidth - 480 * scale) / 2;
  const offsetY = (targetHeight - 300 * scale) / 2;
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = color;

  // ==========================================
  // TOP ROW: "H N D" (Y: 20 to 180, Height: 160)
  // ==========================================
  const hndTop = 20;
  const hndH = 160;
  const barThick = 42;

  // --- 'H' (X: 10 to 150) ---
  ctx.fillRect(10, hndTop, barThick, hndH); // Left post
  ctx.fillRect(10 + barThick, hndTop + 60, 56, barThick); // Center crossbar
  ctx.fillRect(10 + barThick + 56, hndTop, barThick, hndH); // Right post

  // --- 'N' (X: 170 to 310) ---
  ctx.fillRect(170, hndTop, barThick, hndH); // Left post
  // Diagonal
  ctx.beginPath();
  ctx.moveTo(170, hndTop);
  ctx.lineTo(212, hndTop);
  ctx.lineTo(310, hndTop + hndH);
  ctx.lineTo(268, hndTop + hndH);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(310 - barThick, hndTop, barThick, hndH); // Right post

  // --- 'D' (X: 335 to 470) ---
  ctx.fillRect(335, hndTop, barThick, hndH); // Left post
  ctx.fillRect(335 + barThick, hndTop, 45, barThick); // Top bar
  ctx.fillRect(335 + barThick, hndTop + hndH - barThick, 45, barThick); // Bottom bar

  // Right curved bowl of D
  ctx.beginPath();
  ctx.moveTo(380, hndTop);
  ctx.lineTo(415, hndTop);
  ctx.arcTo(475, hndTop, 475, hndTop + 60, 55);
  ctx.arcTo(475, hndTop + hndH, 415, hndTop + hndH, 55);
  ctx.lineTo(380, hndTop + hndH);
  ctx.lineTo(380, hndTop + hndH - barThick);
  ctx.lineTo(412, hndTop + hndH - barThick);
  ctx.arcTo(432, hndTop + hndH - barThick, 432, hndTop + hndH - barThick - 30, 22);
  ctx.arcTo(432, hndTop + barThick, 412, hndTop + barThick, 22);
  ctx.lineTo(380, hndTop + barThick);
  ctx.closePath();
  ctx.fill();

  // ==========================================
  // BOTTOM ROW: "C O M P U T E R" (Y: 215 to 275)
  // Exact geometric techno font matching Image 2
  // ==========================================
  const cY = 215;
  const cH = 54;
  const cT = 12; // letter stroke thickness

  // 1. 'C' (X: 10 to 58)
  ctx.beginPath();
  ctx.moveTo(58, cY);
  ctx.lineTo(26, cY);
  ctx.arcTo(10, cY, 10, cY + 16, 16);
  ctx.lineTo(10, cY + cH - 16);
  ctx.arcTo(10, cY + cH, 26, cY + cH, 16);
  ctx.lineTo(58, cY + cH);
  ctx.lineTo(58, cY + cH - cT);
  ctx.lineTo(26, cY + cH - cT);
  ctx.arcTo(10 + cT, cY + cH - cT, 10 + cT, cY + cH - cT - 8, 8);
  ctx.lineTo(10 + cT, cY + cT + 8);
  ctx.arcTo(10 + cT, cY + cT, 26, cY + cT, 8);
  ctx.lineTo(58, cY + cT);
  ctx.closePath();
  ctx.fill();

  // 2. 'O' (X: 68 to 116)
  ctx.beginPath();
  ctx.moveTo(84, cY);
  ctx.lineTo(100, cY);
  ctx.arcTo(116, cY, 116, cY + 16, 16);
  ctx.lineTo(116, cY + cH - 16);
  ctx.arcTo(116, cY + cH, 100, cY + cH, 16);
  ctx.lineTo(84, cY + cH);
  ctx.arcTo(68, cY + cH, 68, cY + cH - 16, 16);
  ctx.lineTo(68, cY + 16);
  ctx.arcTo(68, cY, 84, cY, 16);
  ctx.closePath();
  // Cutout hole
  ctx.moveTo(84, cY + cT);
  ctx.lineTo(100, cY + cT);
  ctx.arcTo(116 - cT, cY + cT, 116 - cT, cY + cT + 8, 8);
  ctx.lineTo(116 - cT, cY + cH - cT - 8);
  ctx.arcTo(116 - cT, cY + cH - cT, 100, cY + cH - cT, 8);
  ctx.lineTo(84, cY + cH - cT);
  ctx.arcTo(68 + cT, cY + cH - cT, 68 + cT, cY + cH - cT - 8, 8);
  ctx.lineTo(68 + cT, cY + cT + 8);
  ctx.arcTo(68 + cT, cY + cT, 84, cY + cT, 8);
  ctx.closePath();
  ctx.fill('evenodd');

  // 3. 'M' (X: 126 to 180)
  ctx.beginPath();
  ctx.fillRect(126, cY, cT, cH);
  ctx.fillRect(180 - cT, cY, cT, cH);
  ctx.beginPath();
  ctx.moveTo(126, cY);
  ctx.lineTo(153, cY + cH - 10);
  ctx.lineTo(180, cY);
  ctx.lineTo(180 - cT, cY);
  ctx.lineTo(153, cY + cH - 24);
  ctx.lineTo(126 + cT, cY);
  ctx.closePath();
  ctx.fill();

  // 4. 'P' (X: 190 to 234)
  ctx.beginPath();
  ctx.fillRect(190, cY, cT, cH);
  ctx.moveTo(190, cY);
  ctx.lineTo(218, cY);
  ctx.arcTo(234, cY, 234, cY + 14, 14);
  ctx.arcTo(234, cY + 34, 218, cY + 34, 14);
  ctx.lineTo(190, cY + 34);
  ctx.lineTo(190, cY + 34 - cT);
  ctx.lineTo(218, cY + 34 - cT);
  ctx.arcTo(234 - cT, cY + 34 - cT, 234 - cT, cY + 20, 6);
  ctx.arcTo(234 - cT, cY + cT, 218, cY + cT, 6);
  ctx.lineTo(190, cY + cT);
  ctx.closePath();
  ctx.fill();

  // 5. 'U' (X: 244 to 292)
  ctx.beginPath();
  ctx.moveTo(244, cY);
  ctx.lineTo(244 + cT, cY);
  ctx.lineTo(244 + cT, cY + cH - 16);
  ctx.arcTo(244 + cT, cY + cH - cT, 260, cY + cH - cT, 8);
  ctx.lineTo(276, cY + cH - cT);
  ctx.arcTo(292 - cT, cY + cH - cT, 292 - cT, cY + cH - 16, 8);
  ctx.lineTo(292 - cT, cY);
  ctx.lineTo(292, cY);
  ctx.lineTo(292, cY + cH - 16);
  ctx.arcTo(292, cY + cH, 276, cY + cH, 16);
  ctx.lineTo(260, cY + cH);
  ctx.arcTo(244, cY + cH, 244, cY + cH - 16, 16);
  ctx.closePath();
  ctx.fill();

  // 6. 'T' (X: 302 to 348)
  ctx.fillRect(302, cY, 46, cT); // Top bar
  ctx.fillRect(325 - cT / 2, cY + cT, cT, cH - cT); // Center stem

  // 7. 'E' (X: 358 to 402)
  ctx.beginPath();
  ctx.moveTo(402, cY);
  ctx.lineTo(374, cY);
  ctx.arcTo(358, cY, 358, cY + 14, 14);
  ctx.lineTo(358, cY + cH - 14);
  ctx.arcTo(358, cY + cH, 374, cY + cH, 14);
  ctx.lineTo(402, cY + cH);
  ctx.lineTo(402, cY + cH - cT);
  ctx.lineTo(370, cY + cH - cT);
  ctx.lineTo(370, cY + cT);
  ctx.lineTo(402, cY + cT);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(358, cY + 22, 36, cT); // Middle bar

  // 8. 'R' (X: 412 to 468)
  ctx.fillRect(412, cY, cT, cH); // Left post
  // Top bowl
  ctx.beginPath();
  ctx.moveTo(412, cY);
  ctx.lineTo(444, cY);
  ctx.arcTo(464, cY, 464, cY + 14, 14);
  ctx.arcTo(464, cY + 30, 444, cY + 30, 14);
  ctx.lineTo(412, cY + 30);
  ctx.lineTo(412, cY + 30 - cT);
  ctx.lineTo(444, cY + 30 - cT);
  ctx.arcTo(464 - cT, cY + 30 - cT, 464 - cT, cY + 18, 6);
  ctx.arcTo(464 - cT, cY + cT, 444, cY + cT, 6);
  ctx.lineTo(412, cY + cT);
  ctx.closePath();
  ctx.fill();
  // Angled right leg with diagonal terminal cut (as in Image 2)
  ctx.beginPath();
  ctx.moveTo(436, cY + 24);
  ctx.lineTo(466, cY + cH);
  ctx.lineTo(452, cY + cH);
  ctx.lineTo(426, cY + 24);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Creates the exact white placard with black HND COMPUTER logo from Image 2
 */
export function createExactImage2LogoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Pure white background exactly like Image 2
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // Black logo
  drawExactHNDLogoImage2(ctx, 16, 90, 480, 310, '#0a0a0a');

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const exactImage2LogoTex = createExactImage2LogoTexture();

/**
 * Exact replica of the HND COMPUTER Storefront Billboard from the user's photo
 */
export function createHNDBuildingFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark corrugated slatted background (#181f2b to #0f172a)
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 1024, 1600);

  // Vertical dark slats / louvers with subtle depth lighting
  for (let x = 0; x < 1024; x += 14) {
    ctx.fillStyle = (x % 28 === 0) ? '#1f293d' : '#141c2b';
    ctx.fillRect(x, 0, 12, 1600);
    // Highlight edge
    ctx.fillStyle = '#283548';
    ctx.fillRect(x, 0, 2, 1600);
    // Shadow edge
    ctx.fillStyle = '#080d16';
    ctx.fillRect(x + 10, 0, 2, 1600);
  }

  // Outer framing trim
  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 1008, 1584);

  // 2. Large Official "HND COMPUTER" Logo from Image 2
  ctx.save();
  // Shadow
  drawExactHNDLogoImage2(ctx, 114, 134, 800, 320, '#04070e');
  // Bright silver-white metallic logo matching Image 2
  drawExactHNDLogoImage2(ctx, 110, 130, 800, 320, '#ffffff');

  // 📍 Location Pin & "INCE NURDIN"
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📍 INCE NURDIN', 512, 490);
  ctx.restore();

  // 3. Grid of Authorized Partner Brand Badges (Exact from the photo!)
  const startY = 700;
  const gridW = 920;
  const gridX = 52;

  // Draw background white/clean base for the brand matrix
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(gridX, startY, gridW, 600);

  // Row 1 (4 brands: Lenovo, HP, ASUS, MSI)
  const r1H = 190;
  const colW1 = gridW / 4;

  // Lenovo (Red)
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(gridX, startY, colW1, r1H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Lenovo', gridX + colW1 / 2, startY + 110);

  // HP (Light cyan box with HP circle)
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(gridX + colW1, startY, colW1, r1H);
  ctx.beginPath();
  ctx.arc(gridX + colW1 * 1.5, startY + 95, 55, 0, Math.PI * 2);
  ctx.fillStyle = '#0284c7';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic bold 48px sans-serif';
  ctx.fillText('hp', gridX + colW1 * 1.5, startY + 110);

  // ASUS (Dark Blue)
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(gridX + colW1 * 2, startY, colW1, r1H);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 42px "Arial Black", sans-serif';
  ctx.fillText('ASUS', gridX + colW1 * 2.5, startY + 110);

  // MSI (Dark with red dragon accent)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(gridX + colW1 * 3, startY, colW1, r1H);
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('🐉 GAMING', gridX + colW1 * 3.5, startY + 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px sans-serif';
  ctx.fillText('msi', gridX + colW1 * 3.5, startY + 130);

  // Row 2 (5 brands: EPSON, brother, Canon, RICOH, Apple)
  const r2Y = startY + r1H;
  const r2H = 190;
  const colW2 = gridW / 5;

  // EPSON
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(gridX, r2Y, colW2, r2H);
  ctx.fillStyle = '#1e40af';
  ctx.font = '900 36px sans-serif';
  ctx.fillText('EPSON', gridX + colW2 * 0.5, r2Y + 110);

  // Brother
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(gridX + colW2, r2Y, colW2, r2H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('brother', gridX + colW2 * 1.5, r2Y + 110);

  // Canon
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(gridX + colW2 * 2, r2Y, colW2, r2H);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px "Arial Black", sans-serif';
  ctx.fillText('Canon', gridX + colW2 * 2.5, r2Y + 110);

  // RICOH
  ctx.fillStyle = '#be123c';
  ctx.fillRect(gridX + colW2 * 3, r2Y, colW2, r2H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('RICOH', gridX + colW2 * 3.5, r2Y + 95);
  ctx.font = '14px sans-serif';
  ctx.fillText('imagine. change.', gridX + colW2 * 3.5, r2Y + 130);

  // Apple
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(gridX + colW2 * 4, r2Y, colW2, r2H);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('', gridX + colW2 * 4.5, r2Y + 120);

  // Row 3 (5 brands: logitech, tp-link, SAMSUNG, APC, SanDisk)
  const r3Y = r2Y + r2H;
  const r3H = 220;
  const colW3 = gridW / 5;

  // Logitech
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(gridX, r3Y, colW3, r3H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('logitech', gridX + colW3 * 0.5, r3Y + 120);

  // TP-Link
  ctx.fillStyle = '#0d9488';
  ctx.fillRect(gridX + colW3, r3Y, colW3, r3H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText('tp-link', gridX + colW3 * 1.5, r3Y + 120);

  // Samsung
  ctx.fillStyle = '#020617';
  ctx.fillRect(gridX + colW3 * 2, r3Y, colW3, r3H);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 30px sans-serif';
  ctx.fillText('SAMSUNG', gridX + colW3 * 2.5, r3Y + 120);

  // APC
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(gridX + colW3 * 3, r3Y, colW3, r3H);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px "Arial Black", sans-serif';
  ctx.fillText('APC', gridX + colW3 * 3.5, r3Y + 120);

  // SanDisk
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(gridX + colW3 * 4, r3Y, colW3, r3H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('SanDisk', gridX + colW3 * 4.5, r3Y + 120);

  // Thin grid lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.strokeRect(gridX, startY, gridW, 600);

  // Bottom banner: "PUSAT PENJUALAN & SERVIS RESMI"
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(gridX, startY + 600, gridW, 110);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('PUSAT LAPTOP, PC, SERVIS & SPAREPART RESMI', 512, startY + 670);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Papan Jalan (Overhead Road Gantry) with exact official Image 2 logo
 */
export function createHNDPapanJalanTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark corrugated slat background
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, 1200, 360);

  for (let x = 0; x < 1200; x += 16) {
    ctx.fillStyle = (x % 32 === 0) ? '#162032' : '#0f172a';
    ctx.fillRect(x, 0, 14, 360);
  }

  // Glowing cyan neon frame
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 1180, 340);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 1164, 324);

  // 2. EXACT LOGO DARI GAMBAR KEDUA (White Card with Pure Black HND COMPUTER Logo)
  // Mounted prominently on the left
  const cardX = 40;
  const cardY = 35;
  const cardW = 420;
  const cardH = 290;

  // Outer glowing border for Image 2 placard
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(cardX - 4, cardY - 4, cardW + 8, cardH + 8);

  // Pure white card background (Image 2)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Draw exact Image 2 logo inside the card
  drawExactHNDLogoImage2(ctx, cardX + 15, cardY + 15, cardW - 30, cardH - 30, '#000000');

  // 3. Center & Right Content: Toko & Drop Zone
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📍 INCE NURDIN - MAKASSAR', 490, 72);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px "Arial Black", sans-serif';
  ctx.fillText('HND KOMPUTER', 490, 138);

  // Big Glowing Drop Zone Banner
  ctx.fillStyle = '#059669';
  ctx.fillRect(490, 168, 670, 78);
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 4;
  ctx.strokeRect(490, 168, 670, 78);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📦 DROP ZONE PAKET - LARI LEWATI SINI! 📦', 490 + 335, 218);

  // Authorized brand tag badges along bottom right
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('PARTNER RESMI: ASUS • LENOVO • MSI • HP • EPSON • APPLE • LOGITECH', 490, 285);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Road Asphalt Drop Carpet with exact HND Logo
 */
export function createHNDGroundDropTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 512, 512);

  // Neon stripes border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 16;
  ctx.strokeRect(12, 12, 488, 488);

  // White background card in center for Image 2 logo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(76, 76, 360, 240);

  // Draw black HND logo from Image 2
  drawExactHNDLogoImage2(ctx, 86, 86, 340, 220, '#000000');

  // Drop target text
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DROP ZONE HND', 256, 375);

  // Chevrons pointing forward
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('▲ ▲ ▲', 256, 440);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const standardLabelTex = createPackageLabelTexture(false);
export const goldLabelTex = createPackageLabelTexture(true);
export const hndBuildingFacadeTex = createHNDBuildingFacadeTexture();
export const hndPapanJalanTex = createHNDPapanJalanTexture();
export const hndGroundDropTex = createHNDGroundDropTexture();

/**
 * Official HND GUARD Shield Badge Texture
 * High-security shield emblem with cyber cyan & gold neon bevels,
 * carbon fiber inner weave, crisp vector HND logo, and bold "HND GUARD" cyber typography.
 */
export function createHNDGuardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  const drawShieldPath = (inset: number) => {
    ctx.beginPath();
    ctx.moveTo(70 + inset, 50 + inset);
    ctx.lineTo(442 - inset, 50 + inset);
    ctx.arcTo(470 - inset, 50 + inset, 470 - inset, 80 + inset, 28);
    ctx.lineTo(470 - inset, 260);
    ctx.bezierCurveTo(470 - inset, 380, 340 - inset, 452 - inset, 256, 492 - inset);
    ctx.bezierCurveTo(172 + inset, 452 - inset, 42 + inset, 380, 42 + inset, 260);
    ctx.lineTo(42 + inset, 80 + inset);
    ctx.arcTo(42 + inset, 50 + inset, 70 + inset, 50 + inset, 28);
    ctx.closePath();
  };

  // Outer glowing border
  ctx.save();
  drawShieldPath(0);
  ctx.fillStyle = '#0ea5e9';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.restore();

  // Gold accent trim
  ctx.save();
  drawShieldPath(6);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  // Dark slate / carbon inner plate
  ctx.save();
  drawShieldPath(12);
  const grad = ctx.createLinearGradient(0, 50, 0, 480);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#020617');
  grad.addColorStop(1, '#0c1a30');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.clip();

  // Cyber grid lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 2;
  for (let y = 60; y < 480; y += 18) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(470, y + 15);
    ctx.stroke();
  }

  // Pure white card for official HND logo to pop
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(106, 96, 300, 160, 22);
  ctx.fill();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Draw black HND logo inside
  drawExactHNDLogoImage2(ctx, 116, 106, 280, 140, '#0a0a0a');

  // Glowing Cyber Security Ribbon with "HND GUARD"
  const ribGrad = ctx.createLinearGradient(80, 276, 432, 344);
  ribGrad.addColorStop(0, '#0369a1');
  ribGrad.addColorStop(0.5, '#38bdf8');
  ribGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = ribGrad;
  ctx.beginPath();
  ctx.roundRect(80, 276, 352, 74, 18);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#0f172a';
  ctx.shadowBlur = 10;
  ctx.fillText('HND GUARD', 256, 330);

  // 5 Gold Stars & Security Subtitle
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('★ ★ ★ ★ ★', 256, 385);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 16px monospace';
  ctx.fillText('MAXIMUM ACTIVE DEFENSE', 256, 416);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('PERISAI RESMI HND KOMPUTER', 256, 440);

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 3D Holographic Banner Texture for the Spin Activation ("HND GUARD")
 */
export function createHNDGuardBannerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 180;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 180);

  // Outer glowing pill shape
  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 24;

  ctx.beginPath();
  ctx.roundRect(14, 16, 484, 148, 74);
  ctx.fill();
  ctx.stroke();

  // Inner gold trim
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Glowing Text: HND GUARD
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 50px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🛡️ HND GUARD 🛡️', 256, 85);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('⚡ PERISAI PELINDUNG AKTIF! ⚡', 256, 130);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 3D Holographic Banner Texture for Speed Flight Activation ("HND EXPRES")
 */
export function createHNDExpressBannerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 180;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 180);

  // Outer glowing pill shape with intense lightning gold/amber cyber gradient
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 24;

  ctx.beginPath();
  ctx.roundRect(14, 16, 484, 148, 74);
  ctx.fill();
  ctx.stroke();

  // Inner electric cyan neon trim
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Glowing Text: ⚡ HND EXPRES ⚡
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ HND EXPRES ⚡', 256, 85);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('🚀 TERBANG KILAT KEBAL RINTANGAN! 🚀', 256, 130);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Procedural Luxury Superhero Cape Texture
 * Crimson silk weave with embroidered golden borders, tech runes, and HND crest
 */
export function createSuperheroCapeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;

  // Deep rich royal crimson red
  const grad = ctx.createLinearGradient(0, 0, 512, 768);
  grad.addColorStop(0, '#be123c');
  grad.addColorStop(0.5, '#dc2626');
  grad.addColorStop(1, '#881337');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  // Subtle fabric weave pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  for (let y = 0; y < 768; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Heavy gold embroidery border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 480, 736);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.strokeRect(26, 26, 460, 716);

  // Cyber lightning stripes down the sides
  ctx.fillStyle = '#fbbf24';
  for (let y = 80; y < 650; y += 70) {
    // Left chevron
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(55, y + 20);
    ctx.lineTo(35, y + 40);
    ctx.closePath();
    ctx.fill();

    // Right chevron
    ctx.beginPath();
    ctx.moveTo(477, y);
    ctx.lineTo(457, y + 20);
    ctx.lineTo(477, y + 40);
    ctx.closePath();
    ctx.fill();
  }

  // Golden Shield Emblem with HND Tech Inscription in Center
  ctx.save();
  ctx.translate(256, 280);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, -90);
  ctx.lineTo(80, -50);
  ctx.lineTo(65, 50);
  ctx.lineTo(0, 95);
  ctx.lineTo(-65, 50);
  ctx.lineTo(-80, -50);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White inner card for official HND vector logo
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-55, -45, 110, 60, 8);
  ctx.fill();
  drawExactHNDLogoImage2(ctx, -50, -40, 100, 50, '#000000');

  // Text below shield
  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 24px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ HND EXPRES ⚡', 0, 75);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const superheroCapeTex = createSuperheroCapeTexture();

/**
 * Mascot Digital Face Screen Texture with Cute Glowing LED Eyes & Smile
 */
export function createMascotFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark curved visor screen
  ctx.fillStyle = '#060a14';
  ctx.fillRect(0, 0, 256, 256);

  // Glowing Cyan LED Eyes (Cute anime/chibi happy curved arches)
  ctx.strokeStyle = '#38bdf8';
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';

  // Left Eye (Happy arch)
  ctx.beginPath();
  ctx.arc(75, 110, 26, Math.PI * 1.1, Math.PI * 1.9, false);
  ctx.stroke();

  // Right Eye (Happy arch)
  ctx.beginPath();
  ctx.arc(181, 110, 26, Math.PI * 1.1, Math.PI * 1.9, false);
  ctx.stroke();

  // Cute rosy digital blush spots
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#fb7185';
  ctx.fillStyle = 'rgba(251, 113, 133, 0.75)';
  ctx.beginPath();
  ctx.ellipse(56, 148, 16, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(200, 148, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheerful digital mouth curve
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 145, 28, 0.15 * Math.PI, 0.85 * Math.PI, false);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const hndGuardTex = createHNDGuardTexture();
export const hndGuardBannerTex = createHNDGuardBannerTexture();
export const hndExpressBannerTex = createHNDExpressBannerTexture();
export const mascotFaceTex = createMascotFaceTexture();
