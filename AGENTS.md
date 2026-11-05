# AGENTS.md

## Agentic SDLC

- Every change is a PR from a worktree, never the main checkout.
- Review matrix: product-behavior code → Review A+B on different models; test-only/docs-only → merge on green, no review; art → one Low review; design/story → no review.
- At most 3 review rounds, then label `needs-bob`.
- No force-push, no --no-verify, no amending pushed commits, no deploy without Bob's OK.
- Secrets via env only, never committed. CI runs gitleaks on every PR.
- Wright squash-merges on green.
