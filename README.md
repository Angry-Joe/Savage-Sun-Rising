# Savage Sun Rising

A Dark Sun (Athas) themed TTRPG character creation and management site, built on D&D 5th Edition rules with extensive custom campaign content converted from 2nd Edition sources.

**Current status:** Transitioning from an Azure-hosted Master's project to a locally hosted application using conventional web design and PostgreSQL.

---

## Project Origins

This project began as a Master's degree effort that required heavy use of Microsoft Azure services (including DynamoDB for spell data). That cloud dependency is being retired. The goal is now a clean, self-hosted stack that preserves the strong visual identity and character-building experience while moving to more conventional web technologies and a PostgreSQL database.

The look and feel of the original site is intentionally retained for the time being.

---

## Core Focus: 2e → 5e Content Conversion

The most valuable and carefully designed part of this project is the **JSON schema** developed for converting classic Dark Sun 2nd Edition material (especially spells and psionics) into a clean, structured 5th Edition format.

### Reference Implementation

- **Entity model:** `DarkSun.Domain/Entities/DarkSunSpell.cs`
- **Live example data:** `DarkSun.Web/wwwroot/data/priest-1st-level-spells.json` (15 converted 1st-level priest spells)

Key Athasian-specific fields captured in the schema include:

- Elemental spheres (with Major/Minor access)
- `athasianVariant` block (`modifiedEffect`, `materialComponentAthas`, `defilerCost`, `planeSource`)
- `flavorLore` and `artworkPrompt` (Gerald Brom–style prompts)
- Tags, related entries, and source book citations

This schema is the foundation for expanding the content library (more spell levels, wizard spells, psionics, equipment, races, classes, backgrounds, etc.).

---

## Current Architecture (Legacy Azure Era)

| Layer | Project | Notes |
|-------|---------|-------|
| Domain | `DarkSun.Domain` | Entities + seed data |
| Application | `DarkSun.Application` | Services & interfaces |
| Infrastructure | `DarkSun.Infrastructure` | Repositories (DynamoDB spell repo still present), DI |
| Web | `DarkSun.Web` | Blazor + MudBlazor UI, character wizard, login, spells browser |
| Tests | `DarkSun.Tests` | Minimal |

**Character Creation Wizard** (already functional):
- Race → Class → Background → Ability Scores → Equipment → Review

Docker support and a basic GitHub Actions deploy workflow exist from the previous cloud phase.

---

## Migration Goals

1. **Remove Azure / DynamoDB dependencies**
2. **Move to PostgreSQL** for persistent storage (characters, users, spells, content library)
3. **Expand the content library** using the established JSON schema
4. **Keep the existing visual design and character builder UX** while modernizing the backend and data layer
5. **Self-host** on a conventional web/app server

---

## Branch Notes

- `main` – primary branch
- `Content-Library` – working branch for content expansion, schema refinement, and the local hosting / Postgres migration work

As of the initial README commit, `Content-Library` and `main` were identical. Ongoing development continues on `Content-Library`.

---

## Related Repositories

- [Depp-Magic](https://github.com/Angry-Joe/Depp-Magic) – PDF parser / converter tool used to extract 2nd Edition content for conversion into the JSON schema used here.

---

## License

MIT License – see [LICENSE](LICENSE)

Copyright (c) 2026 Angry Joe
