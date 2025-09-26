# 📁 GitHub Workflows & Automation

This directory contains automated workflows and documentation for the Govt Invoice project.

## 🚀 Available Workflows

### 1. **Automated APK Release** (`release-apk.yml`)

Automatically builds and releases signed APK files when PRs with release triggers are merged.

**Triggers:**

- PR with `release` label merged to main
- PR with `[release]` in title merged to main
- Adding `release` label to an already-merged PR ✨

**Features:**

- 🔄 Smart version bumping (major/minor/patch)
- 🔐 Signed APK builds
- 📝 Auto-generated release notes
- 🏷️ Git tagging
- 📱 GitHub Releases integration
- 🔄 Re-triggerable by adding labels to closed PRs
- 🚫 Duplicate release prevention

### 2. **Welcome Workflow** (`welcome.yml`)

Welcomes new contributors and provides guidance.

## 📚 Documentation

| File                                         | Description                                     |
| -------------------------------------------- | ----------------------------------------------- |
| [`RELEASE_WORKFLOW.md`](RELEASE_WORKFLOW.md) | Complete guide for the automated release system |
| [`SECRETS_SETUP.md`](SECRETS_SETUP.md)       | Quick setup guide for GitHub Secrets            |

## 🚀 Quick Start for Releases

1. **Setup Secrets** (one-time setup)

   - Follow [`SECRETS_SETUP.md`](SECRETS_SETUP.md)
   - Add 4 required secrets to your repository

2. **Create Release PR**

   - Add `release` label OR `[release]` in title
   - Include version bump hints: `[major]`, `[minor]`, or leave for patch

3. **Merge to Main**

   - Workflow automatically triggers
   - APK gets built and released
   - Version gets updated across files

4. **Re-trigger Releases** ✨
   - Add `release` label to any already-merged PR
   - Workflow will re-run if no existing release found
   - Duplicate releases are automatically prevented

## 🎯 Version Bump Examples

| PR Title                             | Version Change            |
| ------------------------------------ | ------------------------- |
| `[release] Fix attendance bug`       | `1.0.3` → `1.0.4` (patch) |
| `[release][minor] Add QR sharing`    | `1.0.3` → `1.1.0` (minor) |
| `[release][major] Complete redesign` | `1.0.3` → `2.0.0` (major) |

## 🔧 Current Project Status

- ✅ Release workflow configured
- ✅ Signing setup ready
- ✅ Documentation complete
- ⏳ Secrets need to be added (see [SECRETS_SETUP.md](SECRETS_SETUP.md))

## 🆘 Need Help?

1. **For secrets setup**: Check [`SECRETS_SETUP.md`](SECRETS_SETUP.md)
2. **For workflow details**: Read [`RELEASE_WORKFLOW.md`](RELEASE_WORKFLOW.md)
3. **For issues**: Create a GitHub issue with details
4. **For questions**: Tag maintainers @anisharma07 or @Irtesaam

---

🎉 **Ready to automate your releases?** Follow the setup guides above!
