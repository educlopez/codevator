import { describe, it, expect } from "vitest";
import { parseArgs } from "../commands.js";

describe("parseArgs", () => {
  it("parses 'setup' command", () => {
    expect(parseArgs(["setup"])).toEqual({ command: "setup", args: [] });
  });

  it("parses 'mode retro' command", () => {
    expect(parseArgs(["mode", "retro"])).toEqual({
      command: "mode",
      args: ["retro"],
    });
  });

  it("parses 'volume 80' command", () => {
    expect(parseArgs(["volume", "80"])).toEqual({
      command: "volume",
      args: ["80"],
    });
  });

  it("parses 'on' command", () => {
    expect(parseArgs(["on"])).toEqual({ command: "on", args: [] });
  });

  it("parses 'off' command", () => {
    expect(parseArgs(["off"])).toEqual({ command: "off", args: [] });
  });

  it("parses 'status' command", () => {
    expect(parseArgs(["status"])).toEqual({ command: "status", args: [] });
  });

  it("parses 'play' command (internal, used by hooks)", () => {
    expect(parseArgs(["play"])).toEqual({ command: "play", args: [] });
  });

  it("parses 'stop' command (internal, used by hooks)", () => {
    expect(parseArgs(["stop"])).toEqual({ command: "stop", args: [] });
  });

  it("returns setup for no args", () => {
    expect(parseArgs([])).toEqual({ command: "setup", args: [] });
  });

  it("parses 'doctor' command", () => {
    expect(parseArgs(["doctor"])).toEqual({ command: "doctor", args: [] });
  });

  it("parses 'list' command", () => {
    expect(parseArgs(["list"])).toEqual({ command: "list", args: [] });
  });

  it("parses 'preview elevator' command", () => {
    expect(parseArgs(["preview", "elevator"])).toEqual({
      command: "preview",
      args: ["elevator"],
    });
  });

  it("parses 'stats' command", () => {
    expect(parseArgs(["stats"])).toEqual({ command: "stats", args: [] });
  });

  it("returns help for unknown command", () => {
    expect(parseArgs(["unknown"])).toEqual({ command: "help", args: [] });
  });

  // New commands added in medium-features
  it("parses 'import ./sound.mp3' command", () => {
    expect(parseArgs(["import", "./sound.mp3"])).toEqual({
      command: "import",
      args: ["./sound.mp3"],
    });
  });

  it("parses 'import ./sound.mp3 --name deep-focus --force' command", () => {
    expect(parseArgs(["import", "./sound.mp3", "--name", "deep-focus", "--force"])).toEqual({
      command: "import",
      args: ["./sound.mp3", "--name", "deep-focus", "--force"],
    });
  });

  it("parses 'remove mysound' command", () => {
    expect(parseArgs(["remove", "mysound"])).toEqual({
      command: "remove",
      args: ["mysound"],
    });
  });

  it("parses 'profile create work --mode ambient' command", () => {
    expect(parseArgs(["profile", "create", "work", "--mode", "ambient"])).toEqual({
      command: "profile",
      args: ["create", "work", "--mode", "ambient"],
    });
  });

  it("parses 'profile use work' command", () => {
    expect(parseArgs(["profile", "use", "work"])).toEqual({
      command: "profile",
      args: ["use", "work"],
    });
  });

  it("parses 'profile list' command", () => {
    expect(parseArgs(["profile", "list"])).toEqual({
      command: "profile",
      args: ["list"],
    });
  });

  it("parses 'profile delete work' command", () => {
    expect(parseArgs(["profile", "delete", "work"])).toEqual({
      command: "profile",
      args: ["delete", "work"],
    });
  });

  it("parses 'setup --agent codex' command", () => {
    expect(parseArgs(["setup", "--agent", "codex"])).toEqual({
      command: "setup",
      args: ["--agent", "codex"],
    });
  });
});
