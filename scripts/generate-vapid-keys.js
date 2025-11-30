// Script per generare chiavi VAPID per Web Push
// Esegui con: node scripts/generate-vapid-keys.js

const webpush = require('web-push');

console.log('🔑 Generazione chiavi VAPID per Web Push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Chiavi generate con successo!\n');
console.log('📋 Aggiungi queste variabili al tuo file .env e a Vercel:\n');
console.log('─'.repeat(70));
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@aurooms.it`);
console.log('─'.repeat(70));
console.log('\n⚠️  IMPORTANTE:');
console.log('   - NEXT_PUBLIC_VAPID_PUBLIC_KEY è pubblica (usata nel browser)');
console.log('   - VAPID_PRIVATE_KEY è PRIVATA (solo server, MAI committare su Git!)');
console.log('   - VAPID_SUBJECT è la tua email di contatto\n');
console.log('📌 Su Vercel:');
console.log('   1. Vai su Settings → Environment Variables');
console.log('   2. Aggiungi tutte e 3 le variabili');
console.log('   3. Seleziona Production, Preview, Development\n');
console.log('🔄 Dopo aver aggiunto le variabili su Vercel, fai un nuovo deploy.\n');
