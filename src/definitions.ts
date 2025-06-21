export interface CapacitorMMKVPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
