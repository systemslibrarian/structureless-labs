# Pushing the scaffold to GitHub

Assumes you've created the **Structureless-Labs** org (or will use your own account) and
have the `gh` CLI authenticated.

## 1. Org profile (special ".github" repo)
The org landing page comes from a repo literally named `.github`, with the file at
`profile/README.md`.

```bash
mkdir slabs-dotgithub && cd slabs-dotgithub
mkdir -p profile
cp /path/to/scaffold/.github/profile/README.md profile/README.md
git init && git add . && git commit -m "Org profile"
gh repo create Structureless-Labs/.github --public --source=. --push
cd ..
```

## 2. Each project repo
Repeat per repo (sl-researchkit, sl-atlas, slff, sl-bench, sl-vectors, sl-attacklab, sl-kem):

```bash
cd sl-researchkit
git init && git add . && git commit -m "Initial scaffold"
gh repo create Structureless-Labs/sl-researchkit --public --source=. --push
cd ..
```

## 3. Before going public
- [x] Vendor the full Apache-2.0 text into each LICENSE
      (https://www.apache.org/licenses/LICENSE-2.0.txt). Done 2026-06-09.
- [x] Apply your standard crypto-lab Parts 0/A–D pass (theme toggle, README polish,
      GitHub Pages config, scripture footer) to sl-atlas. Done 2026-06-09.
- [ ] Pin sl-atlas as the org's featured repo.

---
*Soli Deo Gloria — 1 Corinthians 10:31*
