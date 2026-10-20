---
name: External repository working copies
description: Avoid losing nested Git metadata during workspace checkpoints
---

Keep a clone used for external-repository commits outside the workspace, such as in `/tmp`, and verify its repository root before committing.

**Why:** A nested clone's `.git` directory disappeared between operations during this session; later `git -C` commands resolved to the parent workspace instead. A previous nested commit was no longer available there.

**How to apply:** Check `git rev-parse --show-toplevel` before writes. Preserve a deliverable patch or bundle in tracked project files if external push is blocked, since `/tmp` is temporary. Do not assume a nested checkout still owns its Git metadata.
