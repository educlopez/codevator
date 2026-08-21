import soundsManifest from "../../../public/sounds.json";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../site";
import {
  CODEVATOR_SKILL_DESCRIPTION,
  CODEVATOR_SKILL_NAME,
  skillDigest,
} from "./skill";

export function getApiCatalog() {
  return {
    linkset: [
      {
        anchor: `${SITE_URL}/sounds.json`,
        "service-desc": [
          {
            href: `${SITE_URL}/openapi.json`,
            type: "application/vnd.oai.openapi+json;version=3.1",
          },
        ],
        "service-doc": [
          {
            href: `${SITE_URL}/docs`,
            type: "text/html",
          },
          {
            href: `${SITE_URL}/sounds`,
            type: "text/html",
          },
        ],
        status: [
          {
            href: `${SITE_URL}/api/health`,
            type: "application/json",
          },
        ],
      },
    ],
  };
}

export function getOpenApiDocument() {
  const soundNames = soundsManifest.sounds.map((sound) => sound.name);

  return {
    openapi: "3.1.0",
    info: {
      title: `${SITE_NAME} Sounds Registry`,
      version: String(soundsManifest.version),
      description:
        "Public catalog of background sounds that play while AI coding agents work. Used by the codevator CLI to list and download sounds.",
      contact: {
        name: SITE_NAME,
        url: SITE_URL,
      },
      license: {
        name: "MIT",
        url: "https://github.com/educlopez/codevator/blob/master/LICENSE",
      },
    },
    servers: [{ url: SITE_URL }],
    paths: {
      "/sounds.json": {
        get: {
          operationId: "listSounds",
          summary: "List available sounds",
          description: "Returns the public sound catalog, including categories and download metadata.",
          responses: {
            "200": {
              description: "Sound catalog",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SoundManifest" },
                },
              },
            },
          },
        },
      },
      "/api/health": {
        get: {
          operationId: "health",
          summary: "Health check",
          responses: {
            "200": {
              description: "The site is serving traffic",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Health" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Health: {
          type: "object",
          required: ["ok", "service"],
          properties: {
            ok: { type: "boolean" },
            service: { type: "string" },
          },
        },
        SoundManifest: {
          type: "object",
          required: ["version", "baseUrl", "sounds"],
          properties: {
            version: { type: "integer" },
            baseUrl: { type: "string", format: "uri" },
            sounds: {
              type: "array",
              items: { $ref: "#/components/schemas/Sound" },
            },
          },
        },
        Sound: {
          type: "object",
          required: ["name", "files", "description", "category"],
          properties: {
            name: { type: "string", enum: soundNames },
            files: { type: "integer", minimum: 0 },
            description: { type: "string" },
            category: {
              type: "string",
              enum: ["focus", "nature", "music", "integration"],
            },
            color: { type: "string" },
          },
        },
      },
    },
  };
}

export function getSkillsIndex() {
  return {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: CODEVATOR_SKILL_NAME,
        type: "skill-md",
        description: CODEVATOR_SKILL_DESCRIPTION,
        url: "/.well-known/agent-skills/codevator/SKILL.md",
        digest: skillDigest(),
      },
    ],
  };
}

export function getAiCatalog() {
  return {
    specVersion: "1.0",
    host: {
      displayName: SITE_NAME,
      identifier: "did:web:codevator.dev",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
    },
    entries: [
      {
        identifier: "urn:air:codevator.dev:skill:codevator",
        displayName: "Codevator agent skill",
        type: "text/markdown",
        url: `${SITE_URL}/.well-known/agent-skills/codevator/SKILL.md`,
        representativeQueries: [
          "play elevator music while my coding agent works",
          "change the codevator sound to lo-fi",
          "set codevator volume to 30",
          "install the codevator skill for my agent",
        ],
      },
      {
        identifier: "urn:air:codevator.dev:api:sounds",
        displayName: "Codevator sounds registry",
        type: "application/vnd.oai.openapi+json",
        url: `${SITE_URL}/openapi.json`,
        representativeQueries: [
          "list the background sounds available in codevator",
          "what nature sounds can I add with npx codevator add",
          "where is the codevator sounds catalog JSON",
        ],
      },
      {
        identifier: "urn:air:codevator.dev:docs:site",
        displayName: "Codevator documentation",
        type: "text/markdown",
        url: `${SITE_URL}/docs`,
        representativeQueries: [
          "how do I install codevator",
          "setup codevator for Cursor or Claude Code",
          "what CLI commands does codevator support",
        ],
      },
    ],
  };
}
