export interface RedisCred {
    host: string | undefined;
    port: number | undefined;
    password?: string;
    db?: number
  }