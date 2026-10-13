
export interface AppDefinition {
  id: string;
  name: string;
  packageName: string; // Android package name or Windows executable
  launchUri: string; // URL scheme or path
  category: 'system' | 'social' | 'productivity' | 'entertainment';
}

// Default registry
const APP_REGISTRY: Record<string, AppDefinition> = {
  notepad: { id: 'notepad', name: 'Notepad', packageName: 'com.microsoft.notepad', launchUri: 'notepad://', category: 'productivity' },
  calculator: { id: 'calculator', name: 'Calculator', packageName: 'com.microsoft.calculator', launchUri: 'calculator://', category: 'productivity' },
  chrome: { id: 'chrome', name: 'Chrome', packageName: 'com.android.chrome', launchUri: 'googlechrome://', category: 'social' },
  facebook: { id: 'facebook', name: 'Facebook', packageName: 'com.facebook.katana', launchUri: 'fb://', category: 'social' },
  youtube: { id: 'youtube', name: 'YouTube', packageName: 'com.google.android.youtube', launchUri: 'vnd.youtube://', category: 'entertainment' },
  instagram: { id: 'instagram', name: 'Instagram', packageName: 'com.instagram.android', launchUri: 'instagram://', category: 'social' },
  vscode: { id: 'vscode', name: 'VS Code', packageName: 'com.microsoft.vscode', launchUri: 'vscode://', category: 'productivity' },
  explorer: { id: 'explorer', name: 'File Explorer', packageName: 'com.microsoft.explorer', launchUri: 'explorer://', category: 'system' },
};

export class AppInventoryService {
  private static registry: Record<string, AppDefinition> = { ...APP_REGISTRY };

  static getAllApps(): AppDefinition[] {
    return Object.values(this.registry);
  }

  static getAppByName(name: string): AppDefinition | undefined {
    return Object.values(this.registry).find(app => 
      app.name.toLowerCase() === name.toLowerCase() || 
      app.id.toLowerCase() === name.toLowerCase()
    );
  }

  static registerApp(app: AppDefinition) {
    this.registry[app.id] = app;
  }
}
