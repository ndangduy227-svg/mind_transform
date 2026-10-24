import { build } from 'esbuild';
import { mkdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const output = resolve(root, '.test-output/ui.test.cjs');
const blogOutput = resolve(root, '.test-output/blog.test.cjs');
await mkdir(resolve(root, '.test-output'), { recursive: true });
for (const [entry, outfile] of [['tests/ui.test.jsx', output], ['tests/blog.test.jsx', blogOutput]]) await build({ entryPoints: [entry], outfile, bundle: true,
    platform: 'node', format: 'cjs', jsx: 'automatic',
    external: ['react', 'react/*', 'react-dom', 'react-dom/*', '@testing-library/react', 'react-router-dom', 'react-helmet-async', 'framer-motion', 'jsdom', 'lucide-react'],
    loader: { '.md': 'text', '.css': 'empty' },
    plugins: [{ name: 'offline-supabase', setup(builder) {
        builder.onLoad({ filter: /[/\\]lib[/\\]supabase\.js$/ }, () => ({
            contents: "export { mockSupabase as supabase } from './tests/ui-mocks.js';", resolveDir: root, loader: 'js',
        }));
    } }],
});
try {
    const result = spawnSync(process.execPath, ['--test', output, blogOutput], { stdio: 'inherit' });
    process.exitCode = result.status ?? 1;
} finally { await Promise.all([unlink(output), unlink(blogOutput)]); }
