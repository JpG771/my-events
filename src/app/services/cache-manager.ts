// Cache Management Utility
// Provides utilities for managing IndexedDB and Service Worker caches

export class CacheManager {
  private static dbName = 'MyEventsDB';
  
  /**
   * Clear all IndexedDB data
   */
  static async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      
      request.onsuccess = () => {
        console.log('IndexedDB cleared successfully');
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to clear IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onblocked = () => {
        console.warn('IndexedDB deletion blocked');
      };
    });
  }
  
  /**
   * Clear all Service Worker caches
   */
  static async clearServiceWorkerCache(): Promise<void> {
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Service Worker caches cleared');
    }
  }
  
  /**
   * Clear all caches (IndexedDB + Service Worker)
   */
  static async clearAllCaches(): Promise<void> {
    await Promise.all([
      this.clearIndexedDB(),
      this.clearServiceWorkerCache()
    ]);
    console.log('All caches cleared');
  }
  
  /**
   * Force Service Worker update
   */
  static async updateServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('Service Worker update triggered');
      }
    }
  }
  
  /**
   * Check if Service Worker is active
   */
  static isServiceWorkerActive(): boolean {
    return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
  }
  
  /**
   * Get cache storage estimate
   */
  static async getStorageEstimate(): Promise<StorageEstimate | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return null;
  }
  
  /**
   * Check if offline mode is available
   */
  static isOfflineCapable(): boolean {
    return 'serviceWorker' in navigator && 
           'indexedDB' in window && 
           'caches' in window;
  }
}
