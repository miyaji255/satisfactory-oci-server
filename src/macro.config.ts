/**
 * Bun macro to load and validate config.jsonc at compile/build time
 * This embeds the config values into the bundle, avoiding runtime file I/O
 */

import * as v from "valibot";

// Purge config schema
const PurgeSchema = v.object({
  serverName: v.string(),
  channelName: v.string(),
  afterDays: v.number(),
  afterLines: v.number(),
  hour: v.number(),
  onStartup: v.boolean(),
});

// Config schema with valibot
const ConfigSchema = v.object({
  // Discord settings
  discord: v.object({
    serverName: v.string(),
    channelName: v.string(),
  }),

  // Server settings
  server: v.object({
    ip: v.string(),
    port: v.number(),
    maxPlayers: v.number(),
    queryTimeoutMs: v.number(),
  }),

  // Database
  dbPath: v.string(),

  // Polling
  pollIntervalMinutes: v.number(),

  // Log
  log: v.object({
    location: v.string(),
    useWatchFile: v.boolean(),
  }),

  // Purge
  purge: PurgeSchema,

  // Features
  disableUnreachableFoundMessages: v.boolean(),
  ignorePollStateWhenMessaging: v.boolean(),
});

// Types inferred from valibot schema
export type ConfigSettings = v.InferOutput<typeof ConfigSchema>;
export type PurgeConfig = v.InferOutput<typeof PurgeSchema>;

// Async function to load and validate config
export async function loadConfig(): Promise<ConfigSettings> {
  const configPath = process.env.CONFIG_PATH || "./config.jsonc";
  const configFile = Bun.file(configPath);
  const configText = await configFile.text();
  const rawConfig = Bun.JSONC.parse(configText);

  // Validate with valibot
  return v.parse(ConfigSchema, rawConfig);
}

// Alias for macro usage - Bun awaits this at bundle-time and embeds the resolved value
export const loadConfigMacro = loadConfig as unknown as () => ConfigSettings;
