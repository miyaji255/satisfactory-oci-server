import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  type TextChannel,
  type ChannelResolvable,
  type Message,
} from "discord.js";
import type { PurgeConfig } from "../macro.config.ts";

export function createDiscordClient(): Client {
  return new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });
}

export function setDiscordActivity(client: Client, activity: string): void {
  if (client.user) {
    client.user.setActivity(activity);
  }
}

export async function sendDiscordMessage(
  client: Client,
  channelName: string,
  message: string,
): Promise<void> {
  if (!message) return;

  console.log(`[DISCORD] Searching for channel: "${channelName}"`);

  // Find all matching channels (not server-specific)
  const targetChannels = client.channels.cache.filter(
    (channel) =>
      channel.type === ChannelType.GuildText && channel.name === channelName,
  );

  console.log(`[DISCORD] Found ${targetChannels.size} matching channel(s)`);

  if (targetChannels.size === 0) {
    console.error(`[DISCORD] ERROR: No channels found with name: "${channelName}"`);
    console.error(`[DISCORD] Available channels:`);
    client.channels.cache.forEach(channel => {
      if (channel.type === ChannelType.GuildText) {
        console.error(`[DISCORD]   - #${channel.name} (in ${channel.guild.name})`);
      }
    });
    return;
  }

  // Send to all matching channels
  for (const targetChannel of targetChannels.values()) {
    if (targetChannel.type !== ChannelType.GuildText) continue;

    const guildName = targetChannel.guild.name;
    console.log(`[DISCORD] Checking permissions for: ${guildName} > #${channelName}`);

    if (!targetChannel.guild.members.me?.permissionsIn(targetChannel)?.has(PermissionsBitField.Flags.SendMessages)) {
      console.error(`[DISCORD] ERROR: No permission to send messages in: ${guildName} > #${channelName}`);
      continue;
    }

    console.log(`[DISCORD] Sending message to: ${guildName} > #${channelName}`);
    console.log(`[DISCORD] Message preview: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    try {
      await targetChannel.send(message);
      console.log(`[DISCORD] Message sent successfully to: ${guildName} > #${channelName}`);
    } catch (error) {
      console.error(`[DISCORD] ERROR: Failed to send message to: ${guildName} > #${channelName}`);
      console.error(`[DISCORD] Error:`, error);
    }
  }
}


// Purge functions

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

export function willPurge(config: PurgeConfig): boolean {
  return !!(config.afterDays >= 0 || config.afterLines >= 0);
}

export function getNextPurge(hour: number = 2): number {
  const now = Date.now();
  const timeToday = now % MS_PER_DAY;
  const upcomingMidnight = now - timeToday + MS_PER_DAY;
  return upcomingMidnight + hour * MS_PER_HOUR;
}

export async function attemptPurge(client: Client, config: PurgeConfig): Promise<void> {
  // Find all matching channels (not server-specific)
  const targetChannels = client.channels.cache.filter(
    (channel) =>
      channel.type === ChannelType.GuildText && channel.name === config.channelName,
  );

  if (targetChannels.size === 0) {
    console.error(`チャンネルが見つかりません: ${config.channelName}`);
    return;
  }

  // Purge messages from all matching channels
  for (const targetChannel of targetChannels.values()) {
    if (targetChannel.type !== ChannelType.GuildText) continue;

    const guildName = targetChannel.guild.name;

    if (!targetChannel.guild.members.me?.permissionsIn(targetChannel)?.has(PermissionsBitField.Flags.ViewChannel)) {
      console.error(`チャンネルを表示する権限がありません: ${guildName}: ${config.channelName}`);
      continue;
    }

    if (!targetChannel.guild.members.me?.permissionsIn(targetChannel)?.has(PermissionsBitField.Flags.ManageMessages)) {
      console.error(`メッセージを管理する権限がありません: ${guildName}: ${config.channelName}`);
      continue;
    }

    const botUserId = targetChannel.guild.members.me.user.id;
    const now = Date.now();
    const purgeTime = config.afterDays * MS_PER_DAY;
    const purgeLines = config.afterLines;

    const messages = await fetchAllMessages(targetChannel);
    const botMessages = messages
      .filter((message) => message.author.bot && message.author.id === botUserId)
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    const botMessagesToPurge = botMessages.filter((message, index) => {
      if (index >= purgeLines) return true;
      if (message.createdTimestamp < now - purgeTime) return true;
      return false;
    });

    if (botMessagesToPurge.length > 0) {
      console.log(`${guildName}: ${botMessagesToPurge.length}件のメッセージを削除中（全${botMessages.length}件中）...`);
      for (const message of botMessagesToPurge) {
        try {
          await message.delete();
        } catch (error) {
          console.error('メッセージの削除に失敗しました:', error);
        }
      }
    }
  }
}

async function fetchAllMessages(channel: TextChannel): Promise<Message[]> {
  const messages: Message[] = [];
  let lastId: string | undefined;

  while (true) {
    const fetchedMessages = await channel.messages.fetch({
      limit: 100,
      ...(lastId && { before: lastId }),
    });

    if (fetchedMessages.size === 0) break;

    messages.push(...Array.from(fetchedMessages.values()));
    lastId = fetchedMessages.last()?.id;
  }

  return messages;
}
