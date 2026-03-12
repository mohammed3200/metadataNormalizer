/**
 * OJS Plugin Build Script
 * 
 * Automates the creation of a release-ready .tar.gz archive.
 * Reads the version from version.xml and excludes unnecessary files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pluginDir = 'metadataNormalizer';
const versionXmlPath = path.join(__dirname, 'version.xml');

// List of files and directories to exclude from the release archive
const exclusions = [
    '.git',
    '.github',
    '.gitignore',
    'test',
    'build.js',
    'package.json',
    'package-lock.json',
    'node_modules',
    '*.md', // Exclude markdown files like README.md, CONTRIBUTING.md, or plan artifacts if generated locally
];

// Ensure we keep the main plugin directory structure intact inside the tarball
// OJS expects a plugin to be inside a directory mirroring its name (e.g., metadataNormalizer/)

console.log('📦 Starting OJS Plugin Build Process...');

// 1. Read the version from version.xml
let version = 'unknown';
try {
    const versionXml = fs.readFileSync(versionXmlPath, 'utf8');
    const versionMatch = versionXml.match(/<release>(.*?)<\/release>/);
    if (versionMatch && versionMatch[1]) {
        version = versionMatch[1];
        console.log(`✅ Detected version: ${version}`);
    } else {
        console.warn('⚠️ Could not find <release> tag in version.xml. Defaulting to "unknown".');
    }
} catch (error) {
    console.error('❌ Error reading version.xml:', error.message);
    process.exit(1);
}

// 2. Define the output filename
const outputFilename = `${pluginDir}-${version}.tar.gz`;

// 3. Build the tar command
// In Windows, if tar is available (Windows 10+), we can use it directly.
// We need to compress the *current* directory but put it inside a folder named 'metadataNormalizer' in the archive.
// An easier approach for cross-platform is creating a temp directory, copying files, then compressing.

const os = require('os');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ojs-build-'));
const tempPluginDir = path.join(tmpDir, pluginDir);

try {
    // Create staging directory
    fs.mkdirSync(tempPluginDir);

    // Prepare exclusion filter for file copying
    console.log('⏳ Staging files for release...');
    
    // Simple recursive copy function with exclusions
    function copyRecursiveSync(src, dest) {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();
        
        // Check exclusions based on base name or glob pattern
        const baseName = path.basename(src);
        if (exclusions.includes(baseName)) return;
        if (exclusions.includes('*.md') && path.extname(src) === '.md') return;

        if (isDirectory) {
            fs.mkdirSync(dest);
            fs.readdirSync(src).forEach(function(childItemName) {
                copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    }

    // Read current directory and copy non-excluded files
    fs.readdirSync(__dirname).forEach(item => {
        // Skip the output file if it already exists from a previous aborted run
        if (item === outputFilename) return;
        
        copyRecursiveSync(path.join(__dirname, item), path.join(tempPluginDir, item));
    });

    console.log('⏳ Compressing archive...');
    
    // Execute tar command on the staged directory
    // -z: gzip, -c: create, -f: file, -C: change directory
    const command = `tar -zcf ${outputFilename} -C ${tmpDir} ${pluginDir}`;
    
    execSync(command, { cwd: __dirname, stdio: 'inherit' });
    
    console.log(`\n🎉 Success! Release created at: ${outputFilename}`);
    
} catch (error) {
    console.error('\n❌ Build failed:', error.message);
} finally {
    console.log('🧹 Cleaning up temporary files...');
    // Clean up temporary directory (Node 14+ specific method)
    fs.rmSync(tmpDir, { recursive: true, force: true });
}
