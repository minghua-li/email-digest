declare module 'imap' {
  import { EventEmitter } from 'events';

  interface ImapConfig {
    user: string;
    password: string;
    host: string;
    port: number;
    tls?: boolean;
    tlsOptions?: {
      rejectUnauthorized?: boolean;
    };
  }

  interface Box {
    name: string;
    readOnly: boolean;
    newKeywords: boolean;
    uidvalidity: number;
    uidnext: number;
    flags: string[];
    permFlags: string[];
    persistentUIDs: boolean;
    messages: {
      total: number;
      new: number;
    };
  }

  interface ImapMessage extends EventEmitter {
    on(event: 'body', listener: (stream: NodeJS.ReadableStream, info: any) => void): this;
    once(event: 'end', listener: () => void): this;
  }

  interface ImapFetch extends EventEmitter {
    on(event: 'message', listener: (msg: ImapMessage, seqno: number) => void): this;
    once(event: 'error', listener: (err: Error) => void): this;
    once(event: 'end', listener: () => void): this;
  }

  class Connection extends EventEmitter {
    constructor(config: ImapConfig);
    connect(): void;
    end(): void;
    openBox(mailboxName: string, openReadOnly: boolean, callback: (err: Error | null, box?: Box) => void): void;
    search(criteria: any[], callback: (err: Error | null, results: number[]) => void): void;
    fetch(source: number | number[] | string, options: any): ImapFetch;
    addFlags(source: number | number[] | string, flags: string | string[], callback: (err: Error | null) => void): void;
    expunge(callback: (err: Error | null) => void): void;
  }

  export = Connection;
}

declare module 'mailparser' {
  export interface ParsedMail {
    text?: string;
    html?: string;
    subject?: string;
    from?: any;
    to?: any;
    date?: Date;
  }

  export function simpleParser(source: string | Buffer | NodeJS.ReadableStream): Promise<ParsedMail>;
}
