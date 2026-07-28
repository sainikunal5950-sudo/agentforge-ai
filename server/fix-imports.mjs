import fs from 'fs';
import path from 'path';

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content.replace(/(from\s+['"]\.[^'"]*)(['"])/g, (match, p1, p2) => {
                if (p1.endsWith('.js') || p1.endsWith('.ts') || p1.endsWith('.json')) return match;
                return p1 + '.js' + p2;
            });
            updated = updated.replace(/(import\(['"]\.[^'"]*)(['"]\))/g, (match, p1, p2) => {
                if (p1.endsWith('.js') || p1.endsWith('.ts') || p1.endsWith('.json')) return match;
                return p1 + '.js' + p2;
            });
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated);
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}
walk('./src');
