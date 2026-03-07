export interface AgentAdapter {
  name: string;
  detect(): boolean;
  setupHooks(): void;
  removeHooks(): void;
  isInstalled(): boolean;
}
