# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog and the project uses semantic versioning for
versioned releases when they start to exist.

## [Unreleased]

### Added

- root canon for Echotes with operational CDD documents
- project-pinned DocGuard configuration and validation scripts
- CI workflow for DocGuard, lint, test and typecheck

### Changed

- `001-auth-day-surface` is now treated as the closed baseline of the product
- `docs/echotes_*` stopped being the sovereign canon of the repo

### Fixed

- Spec Kit DocGuard integration no longer depends on `docguard-cli@latest`

### Removed

- normative dependence on the legacy canon files in `docs/`
