import { RefreshService } from "../../services/refreshService";

export class AppInitializer {
  private static instance: AppInitializer;
  private refreshService: RefreshService;
  private isInitialized: boolean = false;

  private constructor() {
    this.refreshService = RefreshService.getInstance();
  }

  static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log("Initializing application...");

      // Start the refresh cycle
      await this.refreshService.startRefreshCycle();

      this.isInitialized = true;
      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      console.log("Shutting down application...");

      // Stop the refresh cycle
      this.refreshService.stopRefreshCycle();

      this.isInitialized = false;
      console.log("Application shut down successfully");
    } catch (error) {
      console.error("Failed to shut down application:", error);
      throw error;
    }
  }

  isAppInitialized(): boolean {
    return this.isInitialized;
  }
}
