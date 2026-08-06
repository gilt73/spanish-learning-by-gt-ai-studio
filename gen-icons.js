const sharp = require('sharp');

const sizes = [512, 192, 180];

(async () => {
    for (const size of sizes) {
        await sharp('icon.svg')
            .resize(size, size)
            .png()
            .toFile(`icon-${size}.png`);
        console.log(`icon-${size}.png written`);
    }
})();
