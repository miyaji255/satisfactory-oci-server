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
  serverName: string,
  channelName: string,
  message: string,
): Promise<void> {
  if (!message) return;

  const targetChannel = client.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildText && channel.guild.name === serverName && channel.name === channelName,
  );
  if (!targetChannel || /** Type Narrowing */ targetChannel.type !== ChannelType.GuildText) {
    console.error(`チャンネルが見つかりません: ${serverName}: ${channelName}`);
    return;
  }

  if (!targetChannel.guild.members.me?.permissionsIn(targetChannel)?.has(PermissionsBitField.Flags.SendMessages)) {
    console.error(`チャンネルにメッセージを送る権限がありません: ${serverName}: ${channelName}`);
    return;
  }

  console.log(`Sending message to: ${serverName}: ${channelName}`);
  try {
    await targetChannel.send(message);
  } catch (error) {
    console.error(error);
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
  const targetChannel = client.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildText &&
      channel.guild.name === config.serverName &&
      channel.name === config.channelName,
  );

  if (!targetChannel || /** Type Narrowing */ targetChannel.type !== ChannelType.GuildText) {
    console.error(`チャンネルが見つかりません: ${config.serverName}: ${config.channelName}`);
    return;
  }

  if (!targetChannel.guild.members.me?.permissionsIn(targetChannel)?.has(PermissionsBitField.Flags.ViewChannel)) {
    console.error(`チャンネルを表示する権限がありません: ${config.serverName}: ${config.channelName}`);
    return;
  }

  if (!targetChannel.guild.members.me?.permissionsIn(targetChannel)?.has(PermissionsBitField.Flags.ManageMessages)) {
    console.error(`メッセージを管理する権限がありません: ${config.serverName}: ${config.channelName}`);
    return;
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
    console.log(`${botMessagesToPurge.length}件のメッセージを削除中（全${botMessages.length}件中）...`);
    for (const message of botMessagesToPurge) {
      try {
        await message.delete();
      } catch (error) {
        console.error('メッセージの削除に失敗しました:', error);
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
