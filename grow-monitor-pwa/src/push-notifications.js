const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const subscribeEndpoint = `${import.meta.env.VITE_API_URL}/subscribe`;

// Konverterar en base64-sträng till ett format som Push API förstår
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Huvudfunktionen för att starta prenumerationsprocessen
export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Push-notiser stöds inte av din webbläsare.');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (subscription === null) {
      console.log('Ingen prenumeration funnen, skapar en ny.');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      // Skicka den nya prenumerationen till vår backend
      await sendSubscriptionToBackend(subscription);
    } else {
      console.log('Användaren prenumererar redan.');
    }
    alert('Du prenumererar nu på notiser!');
  } catch (error) {
    console.error('Fel vid prenumeration:', error);
    alert('Kunde inte starta prenumeration på notiser.');
  }
}

// Skickar prenumerationsobjektet till vårt /subscribe API
async function sendSubscriptionToBackend(subscription) {
  const response = await fetch(subscribeEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });
  if (!response.ok) {
    throw new Error('Kunde inte spara prenumerationen på servern.');
  }
  console.log('Prenumeration sparad på backend!');
}