import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apabb.together',
  appName: 'APABB Together',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '383523262110-plhl21l0diqbdnmkghrccshmgqt7dbtc.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;