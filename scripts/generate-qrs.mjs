import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Define the base URL. In production, this can come from process.env.NEXT_PUBLIC_BASE_URL or similar.
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const stations = ['1', '2', '3', '4', '5', '6'];

// Resolve the correct path to the public directory
const outputDir = path.join(process.cwd(), 'public', 'qrs');

// Ensure the directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Configuration to maintain stealth dark aesthetic
const qrOptions = {
    color: {
        dark: '#FFFFFF', // White dots
        light: '#121212', // Stealth Dark background
    },
    width: 300,
    margin: 2
};

async function generateQRs() {
    console.log(`Generando QRs apuntando a la base: ${BASE_URL}...`);

    for (const station of stations) {
        const url = `${BASE_URL}/s/${station}`;
        const filePath = path.join(outputDir, `station-${station}.png`);

        try {
            await QRCode.toFile(filePath, url, qrOptions);
            console.log(`✅ Creado: ${filePath} (-> ${url})`);
        } catch (err) {
            console.error(`❌ Error generando QR para la estación ${station}:`, err);
        }
    }

    console.log('\nTodos los códigos QR han sido generados exitosamente en /public/qrs.');
}

generateQRs();
