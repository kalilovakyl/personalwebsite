import { readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';

const catalog = JSON.parse(await readFile(new URL('../backend/projects.json', import.meta.url)));
const pagesLimit = 25 * 1024 * 1024;

test('published catalog has featured projects, valid dimensions, and unique IDs', () => {
  const ids = new Set(catalog.map(({ id }) => id));
  assert.equal(ids.size, catalog.length);
  for (const id of ['studio-session', 'red-build', 'open-case']) assert.ok(ids.has(id));
  for (const project of catalog) {
    assert.ok(project.width > 0 && project.height > 0);
    assert.ok(project.alt);
    assert.ok(['music', 'builds'].includes(project.category));
  }
});

test('all catalog media exist and fit Cloudflare Pages per-file limit', async () => {
  for (const project of catalog) {
    for (const filename of [project.image, project.video].filter(Boolean)) {
      assert.match(filename, /^[a-z0-9-]+\.(webp|mp4)$/);
      const file = await stat(new URL(`../public/media/${filename}`, import.meta.url));
      assert.ok(file.isFile());
      assert.ok(file.size > 0 && file.size <= pagesLimit, filename);
    }
  }
});

test('the archive includes all 22 supplied photos and eight supplied videos', () => {
  const photos = catalog.filter((project) => !project.video);
  const videos = catalog.filter((project) => project.video);
  assert.equal(new Set(photos.map((project) => project.image)).size, 22);
  assert.equal(new Set(videos.map((project) => project.video)).size, 8);
  assert.equal(catalog.length, 30);
});
