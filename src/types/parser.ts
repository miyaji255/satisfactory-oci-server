export type LogEventType =
  | 'Log file open'
  | 'Command line'
  | 'Login request'
  | 'Join request'
  | 'Join succeeded'
  | 'Connection close';

export interface BaseLogEvent {
  type: LogEventType;
  timestamp?: number;
}

export interface LogFileOpenEvent extends BaseLogEvent {
  type: 'Log file open';
  date: string;
}

export interface CommandLineEvent extends BaseLogEvent {
  type: 'Command line';
  commandLine: string;
}

export interface LoginRequestEvent extends BaseLogEvent {
  type: 'Login request';
  timestamp: number;
  name: string;
  userId: string;
}

export interface JoinRequestEvent extends BaseLogEvent {
  type: 'Join request';
  timestamp: number;
  name: string;
}

export interface JoinSucceededEvent extends BaseLogEvent {
  type: 'Join succeeded';
  timestamp: number;
  name: string;
}

export interface ConnectionCloseEvent extends BaseLogEvent {
  type: 'Connection close';
  timestamp: number;
  userId: string;
}

export type LogEvent =
  | LogFileOpenEvent
  | CommandLineEvent
  | LoginRequestEvent
  | JoinRequestEvent
  | JoinSucceededEvent
  | ConnectionCloseEvent;
