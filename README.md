# Subly

**Subly** is a cross-platform subscription tracker built with Expo and React Native. It is designed to help people keep recurring subscriptions visible, understand upcoming renewals, and avoid surprise charges.

## Highlights

- Subscription list with recurring billing details.
- Reminder and notification support for upcoming renewals.
- Mobile-first navigation with a light visual design.
- Supabase integration for application data and authentication flows.
- Android, iOS, and web targets through Expo.

## Technology stack

| Area | Technology |
| --- | --- |
| Mobile app | React Native 0.86 and Expo 57 |
| Language | TypeScript |
| Navigation | React Navigation |
| Backend | Supabase JavaScript client |
| Notifications | Expo Notifications |
| Secure storage | Expo Secure Store |
| Platforms | Android, iOS, and web |

## Getting started

Install Node.js and npm, then run:

```bash
git clone https://github.com/mayankbohara0-dev/Subly.git
cd Subly
npm install
npm start
```

Use the Expo CLI prompts to open the project on an Android emulator, iOS simulator, a physical device, or the web browser:

```bash
npm run android
npm run ios
npm run web
```

## Configuration and security

The repository expects environment-specific Supabase configuration. Do not commit real API secrets, service-role keys, notification credentials, or production data. Review the files under [`supabase/`](./supabase) and [`docs/`](./docs) before connecting a deployment.

## Status

Subly is an active application prototype. Product flows, notification behavior, persistence, and release configuration may continue to evolve.

## Author

Maintained by [Mayank Bohara](https://github.com/mayankbohara0-dev).
