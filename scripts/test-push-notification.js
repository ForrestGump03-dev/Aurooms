// Script per creare prenotazione di test e inviare notifica push
// Esegui con: node scripts/test-push-notification.js

require('dotenv').config({ path: '.env.development' });
const { Pool } = require('pg');
const webpush = require('web-push');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTestBookingAndNotify() {
  try {
    console.log('🔄 Creazione prenotazione di test...\n');
    
    // 1. Crea prenotazione con numero più corto
    const timestamp = Date.now().toString().slice(-8); // Ultimi 8 cifre
    const bookingNumber = 'BK-' + timestamp;
    const result = await pool.query(`
      INSERT INTO bookings (
        booking_number, 
        guest_name, 
        guest_email, 
        guest_phone,
        check_in, 
        check_out, 
        guests_count, 
        room_type,
        total_amount, 
        payment_status,
        special_requests,
        created_at
      ) VALUES (
        $1,
        'Mario Rossi',
        'mario.rossi@test.com',
        '+39 333 1234567',
        CURRENT_DATE + INTERVAL '7 days',
        CURRENT_DATE + INTERVAL '10 days',
        2,
        'Blue Room',
        299.00,
        'succeeded',
        'Test notifica push - Arrivo previsto ore 15:00',
        NOW()
      ) RETURNING *
    `, [bookingNumber]);
    
    const booking = result.rows[0];
    console.log('✅ Prenotazione creata con successo!');
    console.log('─'.repeat(50));
    console.log('📋 Dettagli Prenotazione:');
    console.log('   Booking #:', booking.booking_number);
    console.log('   Cliente:', booking.guest_name);
    console.log('   Email:', booking.guest_email);
    console.log('   Telefono:', booking.guest_phone);
    console.log('   Camera:', booking.room_type);
    console.log('   Check-in:', new Date(booking.check_in).toLocaleDateString('it-IT'));
    console.log('   Check-out:', new Date(booking.check_out).toLocaleDateString('it-IT'));
    console.log('   Ospiti:', booking.guests_count);
    console.log('   Totale:', booking.total_amount + ' €');
    console.log('   ID Database:', booking.id);
    console.log('─'.repeat(50));
    
    // 2. Configura VAPID
    console.log('\n📤 Preparazione invio notifica push...');
    
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.log('❌ ERRORE: Variabili VAPID non trovate!');
      console.log('   Aggiungi NEXT_PUBLIC_VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY al .env.development');
      await pool.end();
      process.exit(1);
    }
    
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@aurooms.it',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    
    // 3. Recupera subscriptions
    const subsResult = await pool.query('SELECT * FROM push_subscriptions');
    console.log('   📱 Subscriptions trovate:', subsResult.rows.length);
    
    if (subsResult.rows.length === 0) {
      console.log('\n⚠️  ATTENZIONE: Nessuna subscription attiva!');
      console.log('   1. Vai su http://localhost:3000/admin/dashboard');
      console.log('   2. Click su "Abilita Notifiche"');
      console.log('   3. Accetta i permessi del browser');
      console.log('   4. Riprova questo script\n');
      await pool.end();
      return;
    }
    
    // 4. Invia notifiche
    console.log('\n📨 Invio notifiche push...\n');
    
    let sent = 0;
    let failed = 0;
    
    for (const sub of subsResult.rows) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key
          }
        };
        
        const payload = JSON.stringify({
          title: '🎉 Nuova Prenotazione!',
          body: `${booking.guest_name} ha prenotato ${booking.room_type}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: {
            url: 'http://localhost:3000/admin/dashboard',
            bookingId: booking.id,
            bookingNumber: booking.booking_number,
            guestName: booking.guest_name,
            roomType: booking.room_type,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            totalAmount: booking.total_amount
          }
        });
        
        await webpush.sendNotification(pushSubscription, payload);
        console.log('   ✅ Notifica inviata a:', sub.user_agent || 'Browser sconosciuto');
        console.log('      Endpoint:', sub.endpoint.substring(0, 60) + '...');
        sent++;
      } catch (error) {
        console.log('   ❌ Errore invio a:', sub.user_agent || 'Browser sconosciuto');
        console.log('      Motivo:', error.message);
        failed++;
      }
    }
    
    console.log('\n' + '─'.repeat(50));
    console.log('📊 Riepilogo Invio:');
    console.log('   ✅ Inviate con successo:', sent);
    console.log('   ❌ Fallite:', failed);
    console.log('─'.repeat(50));
    
    if (sent > 0) {
      console.log('\n🎯 FATTO! Dovresti ricevere la notifica sul tuo dispositivo!');
      console.log('   La notifica apparirà come:');
      console.log('   ┌────────────────────────────────┐');
      console.log('   │ 🎉 Nuova Prenotazione!         │');
      console.log('   │                                │');
      console.log('   │ Mario Rossi ha prenotato       │');
      console.log('   │ Blue Room                      │');
      console.log('   │                                │');
      console.log('   │ [Visualizza] [Chiudi]          │');
      console.log('   └────────────────────────────────┘');
      console.log('\n   Click sulla notifica per aprire la dashboard!\n');
    } else {
      console.log('\n⚠️  Nessuna notifica inviata con successo.');
      console.log('   Verifica che:');
      console.log('   1. Le notifiche siano abilitate nel browser');
      console.log('   2. I permessi siano concessi');
      console.log('   3. Il Service Worker sia registrato\n');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    console.error('   Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

// Esegui
console.log('🚀 Test Notifica Push - AuRooms\n');
createTestBookingAndNotify();
