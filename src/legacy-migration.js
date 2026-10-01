export const LEGACY_KEYS = [
  'routeflow.addressRegistry.v1', 'routeflow.addressSync.v1',
  'routeflow.deliveryHistory.v1', 'routeflow.routeHistory.v1', 'routeflow.activeRoute.v1',
  'routeflow.authUser.v1',
];
export const ARCHIVE_KEY = 'routeflow.legacyArchive.v2';
const MARKER_KEY = 'routeflow.legacyMigration.v2';

function validateArchive(value) {
  if (value?.version !== 2 || !value.entries || typeof value.entries !== 'object' || Array.isArray(value.entries)) throw Error('Quarentena inválida.');
  for (const [key, entry] of Object.entries(value.entries)) {
    if (!LEGACY_KEYS.includes(key) || typeof entry?.raw !== 'string' || typeof entry.validJson !== 'boolean') throw Error('Conteúdo da quarentena inválido.');
  }
  return value;
}

// Raw strings are retained even when JSON is invalid. No ownership is inferred.
export function migrateLegacy() {
  try {
    const previous = localStorage.getItem(ARCHIVE_KEY);
    const archive = previous !== null ? validateArchive(JSON.parse(previous)) : { version: 2, entries: {} };
    const originals = new Map(LEGACY_KEYS.map(key => [key, localStorage.getItem(key)]).filter(([, raw]) => raw !== null));
    for (const [key, raw] of originals) {
      if (archive.entries[key] && archive.entries[key].raw !== raw) throw Error('Dados legados diferentes da quarentena; exporte os dados antes de continuar.');
      let validJson = true; try { JSON.parse(raw); } catch { validJson = false; }
      archive.entries[key] = { raw, validJson };
    }
    if (originals.size) {
      const serialized = JSON.stringify(archive);
      localStorage.setItem(ARCHIVE_KEY, serialized);
      const readback = localStorage.getItem(ARCHIVE_KEY);
      validateArchive(JSON.parse(readback));
      if (readback !== serialized) throw Error('A leitura da quarentena não corresponde à gravação.');
      // A failed marker write must also leave every original intact.
      localStorage.setItem(MARKER_KEY, JSON.stringify({ version: 2, verifiedAt: new Date().toISOString() }));
      for (const [key, raw] of originals) if (localStorage.getItem(key) !== raw) throw Error('Dados legados mudaram durante a migração.');
      for (const key of originals.keys()) localStorage.removeItem(key);
    }
    // Obsolete credentials are never reused or exported. Remove the old token
    // only when a valid quarantine has been read; otherwise leave it ignored.
    if (originals.size || previous) localStorage.removeItem('routeflow.authToken.v1');
    return { status: originals.size ? 'migrated' : previous ? 'preserved' : 'empty', count: Object.keys(archive.entries).length };
  } catch (error) {
    return { status: 'blocked', error: error.message };
  }
}

export function exportLegacyArchive() {
  const raw = localStorage.getItem(ARCHIVE_KEY);
  if (!raw) throw Error('Não há dados antigos em quarentena.');
  validateArchive(JSON.parse(raw));
  return raw;
}
