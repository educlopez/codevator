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

  it("returns help for no args", () => {
    expect(parseArgs([])).toEqual({ command: "help", args: [] });
  });

  it("returns help for unknown command", () => {
    expect(parseArgs(["unknown"])).toEqual({ command: "help", args: [] });
  });
});
