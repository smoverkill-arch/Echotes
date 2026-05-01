# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog and the project uses semantic versioning for
versioned releases when they start to exist.

## [Unreleased]

### Added

- root canon for Echotes with operational CDD documents
- project-pinned DocGuard configuration and validation scripts
- CI workflow for DocGuard, lint, test and typecheck
- migration coverage checklist for absorption of legacy `docs/`
- expanded root canon content for notes, echoes, timeline navigation, SQL/RLS,
  Zod contracts, tag color inheritance and implementation checklist

### Changed

- `001-auth-day-surface` is now treated as the closed baseline of the product
- root canon is now explicitly treated as a consolidation target, not a fully
  closed migration
- root canon promoted after material absorption of the three legacy `docs/`
  sources
- Spec Kit constitution and templates now treat the root canon as the current
  authority and `docs/` as historical archive

### Fixed

- Spec Kit DocGuard integration no longer depends on `docguard-cli@latest`

### Removed

- the false claim that the canon migration was already complete
