import * as migration_20260717_051020_initial from './20260717_051020_initial';

export const migrations = [
  {
    up: migration_20260717_051020_initial.up,
    down: migration_20260717_051020_initial.down,
    name: '20260717_051020_initial'
  },
];
