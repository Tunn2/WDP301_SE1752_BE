// src/config/timezone.config.ts
export function configureTimezone() {
  process.env.TZ = 'Asia/Ho_Chi_Minh';

  console.log('=== TIMEZONE CONFIGURED ===');
  console.log(
    'System timezone:',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  console.log('Process TZ:', process.env.TZ);
  console.log('Current time:', new Date().toString());
}
