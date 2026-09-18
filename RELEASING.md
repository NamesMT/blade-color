# Releasing

This extension is published to the Visual Studio Code Marketplace from GitHub
Actions. A version tag pushed to `main` triggers `.github/workflows/release.yml`,
which validates the manifest/theme, checks the tag, and runs `vsce publish`.

## One-time setup: the `VSCE_PAT` secret

Publishing authenticates with an Azure DevOps **Personal Access Token (PAT)** that
has the **Marketplace → Manage** scope. You only need to do this once (and again
when the token expires).

### 1. Create the PAT

1. Go to the [Azure DevOps portal](https://go.microsoft.com/fwlink/?LinkId=307137)
   and select your organization (the one linked to the `namesmt` publisher).
2. Click **User settings** (the ⚙️ next to your avatar) → **Personal access tokens** → **New Token**.
3. Fill in:
   - **Name:** anything, e.g. `blade-color-publish`
   - **Organization:** **All accessible organizations** (a specific org causes `401`s)
   - **Expiration:** up to 1 year — set a calendar reminder to rotate it
   - **Scopes:** **Custom defined** → click **Show all scopes** → scroll to
     **Marketplace** → check **Manage**
4. Click **Create**, then **copy the token immediately** — it is shown only once.

> Alternatively, the same token can be created from the Marketplace publisher page:
> <https://marketplace.visualstudio.com/manage> → your publisher → **Security** → **Personal Access Tokens**.
>
> ⚠️ Azure DevOps **global PATs are retired on 2026-12-01**. Before then, plan to
> migrate to [secure automated publishing with Microsoft Entra ID](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#secure-automated-publishing-to-visual-studio-marketplace).

### 2. Store it as a GitHub Actions secret

**Via the web UI:** <https://github.com/NamesMT/blade-color/settings/secrets/actions>
→ **New repository secret** → Name `VSCE_PAT`, paste the token → **Add secret**.

**Via the `gh` CLI:**

```bash
gh secret set VSCE_PAT --repo NamesMT/blade-color
# paste the token, then press Enter (or Ctrl+D on an empty line)
```

## Cutting a release

1. Bump the version in `package.json` and add a `CHANGELOG.md` entry.
2. Commit and push to `main`.
3. Tag the release — the tag **must** match `v<package.json version>`:

   ```bash
   git tag v0.1.4
   git push origin v0.1.4
   ```

4. The `Release` workflow runs `vsce publish`. Watch it:

   ```bash
   gh run watch
   ```

If the tag and `package.json` version disagree, the workflow fails on purpose
before publishing.

## Local equivalents

```bash
npm run validate   # manifest + JSONC theme validation + include-chain check
npm run package    # build a .vsix locally (no marketplace access needed)
```
