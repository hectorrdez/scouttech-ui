# Project notes - constraints and learnings
# Append-only via add-note.cjs. Read before building. Reuse what's here; don't repeat past mistakes.
# Content can be in any language; this file is yours.
- Plane: card 001 = SCOUT-209 (parent SCOUT-208). kanban.json needs "profile": "scouttech" or plane.cjs uses the wrong default credentials (fetch failed).
- Consumers: scoutlog-frontend 028, scoutgroup-frontend 069, scouttech-frontend 071 adopt-scouttech-ui, in that order.
- npm pack -> clean Vite+Tailwind consumer verified (bg-ui-primary generated via @source dist). npm 11 warns 'install-scripts' approval: git-dependency install relies on 'prepare' building dist; if consumers' npm blocks it, run 'npm install-scripts approve scouttech-ui'. Verify on first real git install.
- npm 12 + git dep (verified v0.1.0, 2026-10-18): (1) git deps disabled by default -> EALLOWGIT; consumers need 'allow-git=root' in project .npmrc (Docker: COPY .npmrc before npm ci). (2) prepare shows 'install-scripts blocked' warning but dist IS built (npm runs prepare when packing the git clone); 'npm install-scripts approve scouttech-ui' adds allowScripts{github:...#<sha>:true} to package.json and silences it (re-approve on each tag bump). (3) lockfile resolved = git+ssh, but npm ci works without SSH key (https fallback) while repo is public.
