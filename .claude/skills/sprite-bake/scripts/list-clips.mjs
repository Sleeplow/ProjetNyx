// List animation clips (and mesh/skin counts) in a .glb without any 3D library,
// by reading the glTF JSON chunk. Handy for picking clip names for a bake job.
//
// Usage: node .claude/skills/sprite-bake/scripts/list-clips.mjs <a.glb> [b.glb ...]
import { readFileSync } from 'fs';

function glbJson(path) {
  const buf = readFileSync(path);
  let off = 12; // skip 12-byte header (magic, version, length)
  while (off < buf.length) {
    const len = buf.readUInt32LE(off);
    const type = buf.readUInt32LE(off + 4);
    if (type === 0x4e4f534a) return JSON.parse(buf.subarray(off + 8, off + 8 + len).toString('utf8')); // 'JSON'
    off += 8 + len;
  }
  return {};
}

for (const p of process.argv.slice(2)) {
  const j = glbJson(p);
  const anims = (j.animations || []).map((a) => a.name);
  console.log(`\n### ${p.split('/').pop()}`);
  console.log(`  nodes:${(j.nodes || []).length} meshes:${(j.meshes || []).length} skins:${(j.skins || []).length} animations:${anims.length}`);
  if (anims.length) console.log(`  clips: ${anims.join(', ')}`);
}
