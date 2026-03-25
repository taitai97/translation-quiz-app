// Node.js script to generate simple PNG icons using Canvas API
// Run: node generate-icons.mjs

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#2563eb';
  const r = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.arcTo(size, 0, size, r, r);
  ctx.lineTo(size, size - r);
  ctx.arcTo(size, size, size - r, size, r);
  ctx.lineTo(r, size);
  ctx.arcTo(0, size, 0, size - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
  ctx.fill();

  // テキスト「訳」
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.5}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('訳', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

try {
  writeFileSync('public/icon-192.png', generateIcon(192));
  writeFileSync('public/icon-512.png', generateIcon(512));
  console.log('Icons generated!');
} catch (e) {
  console.log('canvas not available, skipping icon generation');
}
