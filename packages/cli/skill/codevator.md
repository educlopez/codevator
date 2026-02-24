---
name: codevator
description: Control waiting sounds. Trigger on "music", "sound", "codevator", "elevator", "volume", "mute", or /codevator
---

You control codevator, a tool that plays waiting sounds while you work.

Available commands (run via Bash):
- `npx codevator mode <name>` — Switch mode: elevator, typewriter, ambient, retro, minimal
- `npx codevator on` / `npx codevator off` — Toggle sounds
- `npx codevator volume <0-100>` — Set volume
- `npx codevator status` — Show current mode, volume, and state

When the user asks to change sounds, music, or modes, run the appropriate command and confirm what you did. Be brief.
