import { build } from 'esbuild';
import { mkdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const output = resolve(root, '.test-output/ui.test.cjs');
await mkdir(resolve(root, '.test-output'), { recursive: true });
await build({ entryPoints: ['tests/ui.test.jsx'], outfile: output, bundle: true,
    platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    plugins: [{ name: 'offline-supabase', setup(builder) {
        builder.onLoad({ filter: /[/\\]lib[/\\]supabase\.js$/ }, () => ({
            contents: "export { mockSupabase as supabase } from './tests/ui-mocks.js';", resolveDir: root, loader: 'js',
        }));
    } }],
});
try {
    const result = spawnSync(process.execPath, ['--test', output], { stdio: 'inherit' });
    process.exitCode = result.status ?? 1;
} finally { await unlink(output); }
