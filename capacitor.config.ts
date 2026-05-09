import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pdfminty.app',
  appName: 'PDFMinty',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    appendUserAgent: 'PDFMintyApp',
    backgroundColor: '#ffffff'
  }
};

export default config;
