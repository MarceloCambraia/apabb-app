import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.org.apabb.app',
  appName: 'APABB App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '216085914365-5votk2q68uakk7pudvtpbfr71frrtg2b.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;