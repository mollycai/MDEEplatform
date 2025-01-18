declare global {
  interface PlatformConfigs {
    Version?: string;
    Title?: string;
    KeepAlive?: boolean;
    Layout?: string;
    Locale?: string;
    MultiTagsCache?: boolean;
    Theme?: themeColorValue;
    Grey?: boolean;
    DarkMode?: boolean;
    EpThemeColor?: string;
    ShowLogo?: boolean;
    HideTabs?: boolean;
    HideFooter?: boolean;
    StorageNameSpace?: string;
  }

  type themeColorValue =
    | 'light'
    | 'default'
    | 'volcano'
    | 'saucePurple'
    | 'darkPink'
    | 'dusk'
    | 'mingQing'
    | 'auroraGreen';
}

export {};

declare module 'vue' {
  interface GlobalProperties {
    $config: PlatformConfigs;
  }
}
