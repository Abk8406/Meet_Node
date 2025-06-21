const { spawn } = require('child_process');
const path = require('path');

// Start the server
const server = spawn('node', ['index.js'], {
    stdio: 'inherit',
    shell: true
});

// Wait for server to start
setTimeout(() => {
    console.log('Starting ngrok tunnel...');
    // Start ngrok for HTTPS
    const ngrok = spawn('ngrok', ['http', '5000'], {
        stdio: 'inherit',
        shell: true
    });

    // Handle ngrok process exit
    ngrok.on('exit', (code) => {
        console.log(`ngrok process exited with code ${code}`);
        server.kill();
        process.exit();
    });
}, 5000);

// Handle server errors
server.on('error', (err) => {
    console.error('Failed to start server:', err);
});

// Handle process termination
process.on('SIGINT', () => {
    server.kill();
    process.exit();
}); 