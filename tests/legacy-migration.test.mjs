import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment } from './helpers.mjs';
import { migrateLegacy, LEGACY_KEYS, ARCHIVE_KEY } from '../src/legacy-migration.js';

test('legacy archive is verified by readback before any old key is removed; migration is repeatable', () => {
  environment(); for (const key of LEGACY_KEYS) localStorage.setItem(key, JSON.stringify({ legacy: key }));
  localStorage.setItem('routeflow.authToken.v1', 'old-token');
  const removed = []; const remove = localStorage.removeItem;
  localStorage.removeItem = key => { if (LEGACY_KEYS.includes(key)) { assert.ok(JSON.parse(localStorage.getItem(ARCHIVE_KEY)).entries[key]); removed.push(key); } remove(key); };
  assert.equal(migrateLegacy().status, 'migrated');
  assert.equal(removed.length, LEGACY_KEYS.length);
  const archive = localStorage.getItem(ARCHIVE_KEY);
  assert.equal(migrateLegacy().status, 'preserved'); assert.equal(localStorage.getItem(ARCHIVE_KEY), archive);
  assert.equal(localStorage.getItem('routeflow.authToken.v1'), null);
});

test('quota failure preserves all original keys', () => {
  const values = environment(); for (const key of LEGACY_KEYS) localStorage.setItem(key, '[]');
  const originals = new Map(values);
  localStorage.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); };
  assert.equal(migrateLegacy().status, 'blocked');
  for (const [key, value] of originals) assert.equal(localStorage.getItem(key), value);
});

test('invalid legacy JSON is preserved verbatim in quarantine, never adopted', () => {
  environment(); localStorage.setItem(LEGACY_KEYS[0], '{invalid');
  assert.equal(migrateLegacy().status, 'migrated');
  const entry = JSON.parse(localStorage.getItem(ARCHIVE_KEY)).entries[LEGACY_KEYS[0]];
  assert.equal(entry.raw, '{invalid'); assert.equal(entry.validJson, false);
});

test('corrupt or mismatching archive readback never deletes originals', () => {
  environment(); localStorage.setItem(LEGACY_KEYS[0], '[1]');
  const get = localStorage.getItem; let reads = 0;
  localStorage.getItem = key => key === ARCHIVE_KEY && ++reads > 1 ? '{invalid' : get(key);
  assert.equal(migrateLegacy().status, 'blocked'); assert.equal(get(LEGACY_KEYS[0]), '[1]');
});

test('preexisting invalid archive is not overwritten', () => {
  environment(); localStorage.setItem(LEGACY_KEYS[0], '[1]'); localStorage.setItem(ARCHIVE_KEY, '{broken');
  assert.equal(migrateLegacy().status, 'blocked'); assert.equal(localStorage.getItem(ARCHIVE_KEY), '{broken');
  assert.equal(localStorage.getItem(LEGACY_KEYS[0]), '[1]');
});

test('quota failure writing migration marker preserves originals after archive verification', () => {
  environment(); localStorage.setItem(LEGACY_KEYS[0], '[1]');const set=localStorage.setItem;
  localStorage.setItem=(key,value)=>{if(key==='routeflow.legacyMigration.v2')throw new DOMException('quota','QuotaExceededError');set(key,value)};
  assert.equal(migrateLegacy().status,'blocked');assert.equal(localStorage.getItem(LEGACY_KEYS[0]),'[1]');
  assert.equal(JSON.parse(localStorage.getItem(ARCHIVE_KEY)).entries[LEGACY_KEYS[0]].raw,'[1]');
});

test('valid JSON with wrong archive shape blocks deletion', () => {
  environment();localStorage.setItem(LEGACY_KEYS[0],'[1]');localStorage.setItem(ARCHIVE_KEY,'{"version":2,"entries":[]}');
  assert.equal(migrateLegacy().status,'blocked');assert.equal(localStorage.getItem(LEGACY_KEYS[0]),'[1]');
});

test('empty invalid archive is not silently overwritten',()=>{
  environment();localStorage.setItem(LEGACY_KEYS[0],'[1]');localStorage.setItem(ARCHIVE_KEY,'');
  assert.equal(migrateLegacy().status,'blocked');assert.equal(localStorage.getItem(ARCHIVE_KEY),'');
  assert.equal(localStorage.getItem(LEGACY_KEYS[0]),'[1]');
});
