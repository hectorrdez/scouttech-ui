# Project notes - constraints and learnings
# Append-only via add-note.cjs. Read before building. Reuse what's here; don't repeat past mistakes.
# Content can be in any language; this file is yours.
- Plane: card 001 = SCOUT-209 (parent SCOUT-208). kanban.json needs "profile": "scouttech" or plane.cjs uses the wrong default credentials (fetch failed).
- Consumers: scoutlog-frontend 028, scoutgroup-frontend 069, scouttech-frontend 071 adopt-scouttech-ui, in that order.
- npm pack -> clean Vite+Tailwind consumer verified (bg-ui-primary generated via @source dist). npm 11 warns 'install-scripts' approval: git-dependency install relies on 'prepare' building dist; if consumers' npm blocks it, run 'npm install-scripts approve scouttech-ui'. Verify on first real git install.
