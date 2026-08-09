const required = [
    'MONGO_URI',
    'SESSION_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

module.exports = () => {
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
        console.error(`\n❌ Missing environment variables:\n  ${missing.join('\n  ')}\n`);
        process.exit(1);
    }
};