import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apabb.together',
  appName: 'APABB Together',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
};

export default config;