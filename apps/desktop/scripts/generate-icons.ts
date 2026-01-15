#!/usr/bin/env bun
/**
 * Generate app icons for Specto
 * macOS Tahoe style - rounded rectangle with "S" symbol
 *
 * Run: bun run apps/desktop/scripts/generate-icons.ts
 * Requires: sharp (bun add -d sharp)
 */

import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

// Create SVG icon - macOS Sequoia style
// Dark background with red accent "S" - matches Darkroom branding
// macOS icons use ~16.67% padding (1/6th on each side)
function createIconSvg(size: number): string {
	const padding = size * 0.166 // macOS standard padding
	const iconSize = size - padding * 2
	const cornerRadius = iconSize * 0.22 // macOS squircle approximation
	const fontSize = iconSize * 0.5
	const center = size / 2

	// Create an "S" as a path for consistency across platforms
	const sPath = createSPath(center, center, iconSize * 0.35)

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a"/>
      <stop offset="100%" style="stop-color:#0a0a0a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff3b3b"/>
      <stop offset="100%" style="stop-color:#e30613"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.01}" stdDeviation="${size * 0.015}" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#bg)" filter="url(#shadow)"/>

  <!-- Border highlight -->
  <rect x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${size * 0.002}"/>

  <!-- S letter as path -->
  <path d="${sPath}" fill="url(#accent)"/>
</svg>`
}

// Create a stylized "S" path centered at (cx, cy) with given scale
function createSPath(cx: number, cy: number, scale: number): string {
	// Stylized S shape - smooth curves
	const s = scale / 100 // normalize
	return `
		M ${cx + 28 * s} ${cy - 70 * s}
		C ${cx - 30 * s} ${cy - 70 * s} ${cx - 50 * s} ${cy - 50 * s} ${cx - 50 * s} ${cy - 25 * s}
		C ${cx - 50 * s} ${cy} ${cx - 25 * s} ${cy + 10 * s} ${cx} ${cy + 15 * s}
		C ${cx + 25 * s} ${cy + 20 * s} ${cx + 50 * s} ${cy + 30 * s} ${cx + 50 * s} ${cy + 55 * s}
		C ${cx + 50 * s} ${cy + 80 * s} ${cx + 30 * s} ${cy + 100 * s} ${cx - 28 * s} ${cy + 100 * s}
		L ${cx - 28 * s} ${cy + 75 * s}
		C ${cx + 15 * s} ${cy + 75 * s} ${cx + 25 * s} ${cy + 65 * s} ${cx + 25 * s} ${cy + 52 * s}
		C ${cx + 25 * s} ${cy + 38 * s} ${cx + 5 * s} ${cy + 30 * s} ${cx - 15 * s} ${cy + 22 * s}
		C ${cx - 40 * s} ${cy + 12 * s} ${cx - 75 * s} ${cy - 5 * s} ${cx - 75 * s} ${cy - 35 * s}
		C ${cx - 75 * s} ${cy - 65 * s} ${cx - 45 * s} ${cy - 95 * s} ${cx + 28 * s} ${cy - 95 * s}
		Z
	`.replace(/\s+/g, ' ').trim()
}

// Alternative icon with eye/observation symbol (specto = I observe)
function createIconSvgAlt(size: number): string {
	const padding = size * 0.1
	const cornerRadius = size * 0.22
	const center = size / 2
	const eyeWidth = size * 0.45
	const eyeHeight = size * 0.25

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a"/>
      <stop offset="100%" style="stop-color:#0a0a0a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff1a1a"/>
      <stop offset="100%" style="stop-color:#e30613"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.03}" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#bg)" filter="url(#shadow)"/>

  <!-- Border highlight -->
  <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" rx="${cornerRadius}" ry="${cornerRadius}" fill="none" stroke="#333" stroke-width="1"/>

  <!-- Eye outline -->
  <ellipse cx="${center}" cy="${center}" rx="${eyeWidth}" ry="${eyeHeight}" fill="none" stroke="url(#accent)" stroke-width="${size * 0.04}" stroke-linecap="round"/>

  <!-- Pupil -->
  <circle cx="${center}" cy="${center}" r="${size * 0.1}" fill="url(#accent)"/>
</svg>`
}

async function main() {
	const iconsDir = join(import.meta.dir, '../src-tauri/icons')

	// Icon sizes needed for Tauri
	const sizes = [
		{ name: '32x32.png', size: 32 },
		{ name: '64x64.png', size: 64 },
		{ name: '128x128.png', size: 128 },
		{ name: '128x128@2x.png', size: 256 },
		{ name: 'icon.png', size: 1024 },
		// Windows
		{ name: 'Square30x30Logo.png', size: 30 },
		{ name: 'Square44x44Logo.png', size: 44 },
		{ name: 'Square71x71Logo.png', size: 71 },
		{ name: 'Square89x89Logo.png', size: 89 },
		{ name: 'Square107x107Logo.png', size: 107 },
		{ name: 'Square142x142Logo.png', size: 142 },
		{ name: 'Square150x150Logo.png', size: 150 },
		{ name: 'Square284x284Logo.png', size: 284 },
		{ name: 'Square310x310Logo.png', size: 310 },
		{ name: 'StoreLogo.png', size: 50 },
	]

	// Write SVG files for manual conversion if sharp isn't available
	const svg1024 = createIconSvg(1024)
	await writeFile(join(iconsDir, 'icon.svg'), svg1024)
	console.log('Created icon.svg (1024x1024)')

	// Try to use sharp for PNG conversion
	try {
		const sharp = await import('sharp')

		for (const { name, size } of sizes) {
			const svg = createIconSvg(size)
			const buffer = await sharp.default(Buffer.from(svg)).png().toBuffer()
			await writeFile(join(iconsDir, name), buffer)
			console.log(`Created ${name}`)
		}

		// Create ICO for Windows
		console.log('\nNote: For icon.ico, use an online converter or icotool')

		// Create ICNS for macOS
		console.log('Note: For icon.icns, use iconutil on macOS:')
		console.log('  mkdir icon.iconset')
		console.log('  # Copy PNGs to iconset with proper names')
		console.log('  iconutil -c icns icon.iconset')

	} catch (e) {
		console.log('\nSharp not installed. To generate PNG icons:')
		console.log('1. Run: bun add -d sharp')
		console.log('2. Re-run this script')
		console.log('\nOr convert icon.svg manually using:')
		console.log('- Figma / Sketch')
		console.log('- Online SVG to PNG converter')
		console.log('- ImageMagick: convert -background none icon.svg -resize 128x128 128x128.png')
	}
}

main()
