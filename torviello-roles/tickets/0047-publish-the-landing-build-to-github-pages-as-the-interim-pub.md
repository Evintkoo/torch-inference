+++
id = "0047"
title = "Publish the landing build to GitHub Pages as the interim public link"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-11-09"
updated = "2026-11-10"
requirements = ["PDL-013", "PDL-014", "SO-012"]
controls = ["GOV-07", "GOV-08", "GOV-10", "GOV-11"]
depends_on = ["0045", "0046"]
labels = ["landing", "deployment", "ci"]
+++
## Outcome

the built landing site is publicly reachable at https://evintkoo.github.io/torch-inference/ via a gh-pages branch containing only the build output, Pages is enabled through the GitHub API, the deploy-landing workflow gains a publish-pages job so every push to main touching torviello-landing auto-publishes, and the Oracle bootstrap path remains ready for when the owner actually creates an Oracle account - nothing else changes

## Acceptance

- [ ] gh-pages branch contains only the built site (index.html with the full SEO head
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] hashed assets
- [ ] favicon.svg
- [ ] og-image.jpg
- [ ] .nojekyll) and nothing from the repository's internal corpus
- [ ] Pages is enabled via the GitHub API and the live URL returns HTTP 200 with the expected title tag
- [ ] verified with curl
- [ ] the deploy-landing workflow gains a publish-pages job (permissions pages:write
- [ ] id-token:write
- [ ] actions/deploy-pages pinned by SHA) and the workflow README documents it
- [ ] the interim canonical situation is documented honestly: the site declares https://torviello.dev/ as canonical (registered later); the github.io URL serves meanwhile
- [ ] uv run --directory torviello-roles python -m torviello_roles check passes and the ticket log records the live URL
- [ ] the HTTP verification
- [ ] and the release commit
- [ ] the owner explicitly authorized publication by asking for a public link (recorded 2026-11-09); only torviello-landing/web build output is published

## Log

- 2026-11-09 — created
- 2026-11-09 — owner direction 2026-11-09: 'i dont have an account' - the premise of an existing Oracle VM is void; the owner's actual goal is a publicly accessible SEO-ready link. Decision recorded by the agent on the owner's standing instruction to do everything via CLI: publish the static build to GitHub Pages on this public repository (no new account, no server, free, HTTPS automatic) while the Oracle bootstrap path stays dormant until the owner signs up for Oracle Cloud - publication explicitly authorized by the repeated request for a public link; only web/dist output ships, the internal corpus never leaves the repo
- 2026-11-09 — started
- 2026-11-09 — LIVE: gh-pages branch pushed (commit f5981f2, build output only + .nojekyll - nothing from the internal corpus); Pages was already enabled and reports status=built; verified with curl: https://evintkoo.github.io/torch-inference/ returns HTTP 200 (0.39s) with the expected title tag, canonical https://torviello.dev/, og:image, robots.txt (allow all + sitemap) and sitemap.xml (loc https://torviello.dev/) all serving. Workflow gains the publish-pages job (push-to-main trigger, pages:write + id-token:write permissions, github-pages environment, actions pinned: upload-pages-artifact v5.0.0 fc324d3, deploy-pages v5.0.1 368f825 - SHAs verified against the commits API; YAML validated) so every push to main touching torviello-landing auto-publishes. Interim canonical situation documented honestly in the deploy README: the site declares torviello.dev (unregistered); the github.io URL serves meanwhile and the domain maps onto Pages with GitHub-managed HTTPS when registered (compatible with the HSTS-preloaded .dev TLD). Oracle bootstrap path stays dormant until the owner creates an Oracle account
- 2026-11-09 — status -> review
- 2026-11-09 — live defect found by the owner (white screen): the site is served from the /torch-inference/ subpath but Vite emitted absolute /assets/... URLs, so the JS/CSS 404ed (curl confirmed src=/assets/index-*.js). Fix: vite.config.ts gains base './' (relative asset URLs work under any mount path - the Pages subpath and a future VM root) with the rationale recorded in the config; rebuilt and verified the built index.html uses ./assets. Also scoped the landing-deploy job to workflow_dispatch only so pushes to main trigger Pages publishing without failing on the dormant VM deploy. Web suite 0 fail after the change
- 2026-11-10 — owner direction: 'fix the urls' - canonical base is no longer the unregistered torviello.dev: web/.env (VITE_SITE_URL) is the single source, currently https://evintkoo.github.io/torch-inference (the live URL); index.html consumes it via %VITE_SITE_URL% replacement and seo-assets generates robots.txt + sitemap.xml from it (they become gitignored generated outputs, GOV-12.05); seo tests assert the built artifact matches the .env value. Live defect found by the owner (white screen) fixed: vite base './' plus republish. Footer/audience/cta/nav placeholder urls replaced by real repository urls per the same direction (logged on 0041). Republished gh-pages after the asset-path fix and verified assets return HTTP 200 under the /torch-inference/ subpath
