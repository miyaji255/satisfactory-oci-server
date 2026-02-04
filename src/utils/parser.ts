import type { LogEvent } from "../types/parser.ts";
import { regex } from "arkregex";

// Using arkregex for type-safe regex patterns
// For complex patterns that cause type depth issues, fall back to standard RegExp
const LOG_FILE_OPEN_REGEX = regex("Log file open, (.*)$");
const COMMAND_LINE_REGEX = regex("^LogInit: Command Line: (.*)$");

// Complex patterns - using standard RegExp to avoid type depth issues
const LOGIN_REQUEST_REGEX = /^\[([^\]]+)\]\[.+\]LogNet: Login request: .*\?Name=([^?]?) userId: (.*) platform: .*$/;
const JOIN_REQUEST_REGEX = /^\[([^\]]+)\]\[.+\]LogNet: Join request: .*\?Name=([^?]?)\?SplitscreenCount=.*$/;
const JOIN_SUCCEEDED_REGEX = /^\[([^\]]+)\]\[.+\]LogNet: Join succeeded: (.*?)$/;
const CONNECTION_CLOSE_REGEX = /^\[([^\]]+)\]\[.+\]LogNet: UNetConnection::Close: .*, Driver: GameNetDriver .*, UniqueId: (.*?),.*$/;

function parseTimestamp(timestamp: string): number {
  return Date.parse(
    `${timestamp
      .replace("-", "T")
      .replace(":", ".")
      .replace(".", "-")
      .replace(".", "-")
      .replace(".", ":")
      .replace(".", ":")}Z`,
  );
}

// Helper to safely get match group or throw
function getGroup(match: RegExpMatchArray, index: number): string {
  const value = match[index];
  if (value === undefined) {
    throw new Error(`Capture group ${index} is undefined`);
  }
  return value;
}

export function parse(message: string): LogEvent | null {
  const logFileOpen = message.match(LOG_FILE_OPEN_REGEX);
  if (logFileOpen) {
    return {
      type: "Log file open",
      date: getGroup(logFileOpen, 1),
    };
  }

  const logFileCommandLine = message.match(COMMAND_LINE_REGEX);
  if (logFileCommandLine) {
    return {
      type: "Command line",
      commandLine: getGroup(logFileCommandLine, 1),
    };
  }

  const loginRequest = message.match(LOGIN_REQUEST_REGEX);
  if (loginRequest) {
    return {
      type: "Login request",
      timestamp: parseTimestamp(getGroup(loginRequest, 1)),
      name: getGroup(loginRequest, 2),
      userId: getGroup(loginRequest, 3),
    };
  }

  const joinRequest = message.match(JOIN_REQUEST_REGEX);
  if (joinRequest) {
    return {
      type: "Join request",
      timestamp: parseTimestamp(getGroup(joinRequest, 1)),
      name: getGroup(joinRequest, 2),
    };
  }

  const joinSucceeded = message.match(JOIN_SUCCEEDED_REGEX);
  if (joinSucceeded) {
    return {
      type: "Join succeeded",
      timestamp: parseTimestamp(getGroup(joinSucceeded, 1)),
      name: getGroup(joinSucceeded, 2),
    };
  }

  const connectionClose = message.match(CONNECTION_CLOSE_REGEX);
  if (connectionClose) {
    return {
      type: "Connection close",
      timestamp: parseTimestamp(getGroup(connectionClose, 1)),
      userId: getGroup(connectionClose, 2),
    };
  }

  return null;
}
