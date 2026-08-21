import soundsManifest from "../../public/sounds.json";
import {
  INSTALL_COMMAND,
  SITE_URL,
  SKILL_INSTALL_COMMAND,
  SUPPORTED_AGENTS,
} from "@/lib/site";

type WebMcpPayload = {
  siteUrl: string;
  installCommand: string;
  skillInstallCommand: string;
  agents: readonly { name: string; description: string }[];
  sounds: { name: string; description: string; category: string }[];
  docsUrl: string;
  soundsUrl: string;
};

const WEBMCP_RUNTIME = String.raw`
function getContext() {
  if (typeof navigator !== "undefined" && navigator.modelContext) {
    return navigator.modelContext;
  }
  if (typeof document !== "undefined" && document.modelContext) {
    return document.modelContext;
  }
  return null;
}

function result(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

var tools = [
  {
    name: "get_install_command",
    description: "Get Codevator install, setup, and agent-skill commands.",
    inputSchema: {
      type: "object",
      properties: {
        agent: {
          type: "string",
          description: "Optional coding agent: claude, codex, gemini, copilot, cursor, windsurf, or opencode.",
        },
      },
      additionalProperties: false,
    },
    execute: async function (input) {
      var agent = input && input.agent;
      return result({
        install: payload.installCommand,
        setup: agent
          ? "npx codevator setup --agent " + agent
          : payload.installCommand,
        skill: payload.skillInstallCommand,
        docs: payload.docsUrl,
      });
    },
  },
  {
    name: "list_sounds",
    description: "List Codevator background sounds, optionally filtered by category.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category: focus, nature, music, or integration.",
        },
      },
      additionalProperties: false,
    },
    execute: async function (input) {
      var category = input && input.category;
      var sounds = payload.sounds.filter(function (sound) {
        return !category || sound.category === category;
      });
      return result({
        sounds: sounds,
        gallery: payload.soundsUrl,
        addCommand: "npx codevator add <name>",
      });
    },
  },
  {
    name: "list_supported_agents",
    description: "List the coding agents Codevator can hook into.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    execute: async function () {
      return result({
        agents: payload.agents,
        setupCommand: "npx codevator setup --agent <name>",
      });
    },
  },
  {
    name: "get_docs_url",
    description: "Get Codevator documentation and discovery URLs for agents.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    execute: async function () {
      return result({
        docs: payload.docsUrl,
        homepage: payload.siteUrl,
        sounds: payload.soundsUrl,
        apiCatalog: payload.siteUrl + "/.well-known/api-catalog",
        skills: payload.siteUrl + "/.well-known/agent-skills/index.json",
        markdownHint: "Send Accept: text/markdown to receive markdown instead of HTML.",
      });
    },
  },
];

function register(ctx) {
  if (!ctx) return;
  if (typeof ctx.registerTool === "function") {
    tools.forEach(function (tool) {
      try {
        ctx.registerTool(tool);
      } catch (error) {}
    });
    return;
  }
  if (typeof ctx.provideContext === "function") {
    try {
      ctx.provideContext({ tools: tools });
    } catch (error) {}
  }
}

register(getContext());
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    register(getContext());
  });
}
`;

export function WebMcpScript() {
  const payload: WebMcpPayload = {
    siteUrl: SITE_URL,
    installCommand: INSTALL_COMMAND,
    skillInstallCommand: SKILL_INSTALL_COMMAND,
    agents: SUPPORTED_AGENTS,
    sounds: soundsManifest.sounds.map((sound) => ({
      name: sound.name,
      description: sound.description,
      category: sound.category,
    })),
    docsUrl: `${SITE_URL}/docs`,
    soundsUrl: `${SITE_URL}/sounds`,
  };

  return (
    <script
      id="webmcp-bootstrap"
      dangerouslySetInnerHTML={{
        __html: `(function (payload) {${WEBMCP_RUNTIME}})(${JSON.stringify(payload)});`,
      }}
    />
  );
}
