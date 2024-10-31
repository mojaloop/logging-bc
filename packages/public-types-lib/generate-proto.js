const { execSync } = require('child_process');
const path = require('path');

// Resolve paths
const protoDir = path.resolve(__dirname, 'src/proto');
const protoFile = path.resolve(protoDir, 'log_entry.proto');
const outDir = path.resolve(protoDir);

// Construct the command
const command = `npx protoc --ts_out=service=true:${outDir} --proto_path=${protoDir} ${protoFile}`;

console.log('Running command:', command);

// Execute the command
try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error('Error executing command:', error);
    process.exit(1);
}
