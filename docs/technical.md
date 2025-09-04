# Technical Notes

Key decisions:
- Prompt discovery: public raw GitHub via `prompts/index.json` → fetch agent user prompt template `.md` files and system prompt(s)
- Diff preview: jsdiff unified diff rendered as markdown code block
- Writes: GitHub Contents API (create/update) with token in n8n credentials
- Docs: Mirror `prompts/**/*.md` into `docs/prompts/` and include in `mkdocs.yml`

HTTP endpoints:
- Index: `https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/index.json`
- Prompt base: `https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/`
- GitHub API (read): `GET /repos/{owner}/{repo}/contents/{path}?ref={branch}`
- GitHub API (write): `PUT /repos/{owner}/{repo}/contents/{path}`

Parameters (defaults):
- PROMPTS_INDEX_URL: as above
- PROMPTS_BASE_RAW: as above
- OUTPUT_BRANCH: main
- DIFF_PREVIEW_MAX_CHARS: 2000
- HTTP_TIMEOUT_MS: 10000
- RETRY_COUNT: 2

Security:
- Store tokens in n8n credentials only; never log secrets
- Validate output repo URL; guard large inputs

MkDocs:
- Theme: readthedocs
- Nav includes LLM Templates index and template pages
