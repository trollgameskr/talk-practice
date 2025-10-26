/**
 * Icon Generator Script for GeminiTalk PWA
 *
 * This script generates app icons in various sizes for the Progressive Web App.
 * It requires the 'canvas' package which is installed as a dev dependency.
 *
 * Usage: node generate-icons.js
 *
 * This script only needs to be run when creating or updating app icons.
 * The generated icons are committed to the repository.
 */

const {createCanvas} = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, 'public');

// Create icons for each size
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw a speech bubble icon
  const bubbleSize = size * 0.6;
  const bubbleX = size * 0.5;
  const bubbleY = size * 0.45;
  const bubbleRadius = bubbleSize / 2;

  // Main bubble circle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2);
  ctx.fill();

  // Bubble tail
  ctx.beginPath();
  ctx.moveTo(bubbleX - bubbleRadius * 0.3, bubbleY + bubbleRadius * 0.5);
  ctx.lineTo(bubbleX - bubbleRadius * 0.6, bubbleY + bubbleRadius * 1.1);
  ctx.lineTo(bubbleX - bubbleRadius * 0.1, bubbleY + bubbleRadius * 0.7);
  ctx.closePath();
  ctx.fill();

  // Add text "EN" in the bubble for larger icons
  if (size >= 72) {
    ctx.fillStyle = '#3b82f6';
    ctx.font = `bold ${size * 0.25}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EN', bubbleX, bubbleY);
  }

  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, `icon-${size}x${size}.png`), buffer);
  console.log(`Created icon-${size}x${size}.png`);
});

console.log('All icons generated successfully!');
