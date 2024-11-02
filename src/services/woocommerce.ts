import axios from 'axios';

export interface WooCommerceServer {
  id: string;
  name: string;
  url: string;
  consumerKey: string;
  consumerSecret: string;
  isActive: boolean;
  lastChecked?: string;
  status?: 'online' | 'offline' | 'error';
  errorMessage?: string;
  responseTime?: number;
}

interface ServerMonitorCallback {
  (servers: WooCommerceServer[]): void;
}

class WooCommerceService {
  private static STORAGE_KEY = 'woocommerce_servers';
  private static monitoringInterval: number | null = null;
  private static monitorCallbacks: ServerMonitorCallback[] = [];
  private static DEFAULT_TIMEOUT = 10000; // 10 seconds
  private static MAX_RETRIES = 2;

  static getServers(): WooCommerceServer[] {
    const serversJson = localStorage.getItem(this.STORAGE_KEY);
    return serversJson ? JSON.parse(serversJson) : [];
  }

  static getActiveServers(): WooCommerceServer[] {
    const servers = this.getServers();
    return servers.filter(server => server.isActive && server.status === 'online');
  }

  static async addServer(server: Omit<WooCommerceServer, 'id' | 'isActive' | 'status'>): Promise<WooCommerceServer> {
    const servers = this.getServers();
    const newServer: WooCommerceServer = {
      ...server,
      id: crypto.randomUUID(),
      isActive: true, // New servers are active by default
      status: 'offline'
    };

    servers.push(newServer);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(servers));
    this.notifyMonitorCallbacks();
    return newServer;
  }

  static updateServer(serverId: string, updates: Partial<WooCommerceServer>): void {
    const servers = this.getServers();
    const index = servers.findIndex(s => s.id === serverId);
    
    if (index !== -1) {
      servers[index] = { ...servers[index], ...updates };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(servers));
      this.notifyMonitorCallbacks();
    }
  }

  static deleteServer(serverId: string): void {
    const servers = this.getServers().filter(s => s.id !== serverId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(servers));
    this.notifyMonitorCallbacks();
  }

  static toggleServerActive(serverId: string): void {
    const servers = this.getServers();
    const server = servers.find(s => s.id === serverId);
    if (server) {
      server.isActive = !server.isActive;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(servers));
      this.notifyMonitorCallbacks();
    }
  }

  private static async checkServerWithRetry(
    server: WooCommerceServer,
    retryCount: number = 0
  ): Promise<{
    status: 'online' | 'offline' | 'error';
    errorMessage?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      const response = await axios.get(`${server.url}/wp-json/wc/v3/system_status`, {
        auth: {
          username: server.consumerKey,
          password: server.consumerSecret
        },
        timeout: this.DEFAULT_TIMEOUT
      });

      const responseTime = Date.now() - startTime;

      return {
        status: response.status === 200 ? 'online' : 'error',
        errorMessage: response.status !== 200 ? 'Server returned unexpected status' : undefined,
        responseTime
      };
    } catch (error) {
      const isTimeout = error instanceof Error && 
        (error.message.includes('timeout') || error.message.includes('ECONNABORTED'));
      
      if (isTimeout && retryCount < this.MAX_RETRIES) {
        return this.checkServerWithRetry(server, retryCount + 1);
      }

      const isNetworkError = error instanceof Error && 
        (error.message.includes('Network Error') || isTimeout);
      
      return {
        status: isNetworkError ? 'offline' : 'error',
        errorMessage: error instanceof Error ? 
          `${error.message}${retryCount > 0 ? ` (after ${retryCount + 1} attempts)` : ''}` : 
          'Unknown error occurred',
        responseTime: Date.now() - startTime
      };
    }
  }

  static async checkServerStatus(server: WooCommerceServer): Promise<{
    status: 'online' | 'offline' | 'error';
    errorMessage?: string;
    responseTime?: number;
  }> {
    return this.checkServerWithRetry(server);
  }

  static async checkAllServersStatus(): Promise<void> {
    const servers = this.getServers();
    let hasChanges = false;
    
    const results = await Promise.all(
      servers.map(async server => {
        const result = await this.checkServerStatus(server);
        return { server, result };
      })
    );

    results.forEach(({ server, result }) => {
      const { status, errorMessage, responseTime } = result;
      if (
        server.status !== status || 
        server.errorMessage !== errorMessage ||
        server.responseTime !== responseTime
      ) {
        this.updateServer(server.id, {
          status,
          errorMessage,
          responseTime,
          lastChecked: new Date().toISOString()
        });
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.notifyMonitorCallbacks();
    }
  }

  static startMonitoring(callback?: ServerMonitorCallback): void {
    if (callback) {
      this.monitorCallbacks.push(callback);
    }

    if (this.monitoringInterval === null) {
      this.checkAllServersStatus();
      this.monitoringInterval = window.setInterval(() => {
        this.checkAllServersStatus();
      }, 5000);
    }
  }

  static stopMonitoring(callback?: ServerMonitorCallback): void {
    if (callback) {
      this.monitorCallbacks = this.monitorCallbacks.filter(cb => cb !== callback);
    }

    if (this.monitorCallbacks.length === 0 && this.monitoringInterval !== null) {
      window.clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private static notifyMonitorCallbacks(): void {
    const servers = this.getServers();
    this.monitorCallbacks.forEach(callback => callback(servers));
  }
}

export default WooCommerceService;