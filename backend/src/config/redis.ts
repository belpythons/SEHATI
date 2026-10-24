/**
 * Redis Configuration (Disabled)
 *
 * All rate-limiting and session/share caches operate purely in-memory
 * without requiring an external Redis daemon.
 */

export const isRedisReady = (): boolean => false;

export const redis = {
  get: async (_key: string): Promise<string | null> => null,
  set: async (_key: string, _value: string, ..._args: any[]): Promise<string> => "OK",
  del: async (_key: string): Promise<number> => 0,
};
