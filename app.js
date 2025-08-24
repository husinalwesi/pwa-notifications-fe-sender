var baseURL = "https://pwa-notifications-be.onrender.com";
// var baseURL = "https://doorapp.ihorizons.org/backend";

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker registered'))
        .then(() => subscribe()) // Call subscribe after service worker is registered
        .catch(error => console.log('Service Worker registration failed:', error));
}

// Ask permission and subscribe
async function subscribe() {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return;
        }

        const swReg = await navigator.serviceWorker.ready;

        const applicationServerKey = urlBase64ToUint8Array('BMHHx70B6PTXRkhgu32lSVMWbYlMtiaeJ41c-ZCS9p4240vnqlgYrAXfLW0wET9chC580-QfJU1by_02McfhYJI');

        const subscription = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });

        const payload = {
            subscription,
            team: 'sender',
            innerteam: 'sender'
        };

        // Send subscription to backend
        await fetch(`${baseURL}/subscribe`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Subscribed successfully!');
    } catch (error) {
        console.error('Subscription failed:', error);
    }
}

// Function to send notification after both purpose and team are selected
async function sendVisitorNotification(purpose, team) {
    const purposeMessages = {
        meeting: {
            title: "Meeting Request",
            body: `A visitor has arrived for a meeting with ${team} team. Please prepare to assist them.`,
        },
        delivery: {
            title: "Delivery Notification",
            body: `A delivery person is waiting for ${team} team. Please check reception area.`,
        },
        inquiry: {
            title: "Inquiry Request",
            body: `A visitor has an inquiry for ${team} team. Someone should attend to them soon.`,
        },
        help: {
            title: "Help Request",
            body: `A visitor needs assistance from ${team} team. Please provide immediate support.`,
        },
    };

    const message = purposeMessages[purpose] || {
        title: "Visitor Alert",
        body: `A visitor has arrived and needs attention from ${team} team.`,
    };

    // Send notification
    return await fetch(`${baseURL}/sendNotification`, {
        method: "POST",
        body: JSON.stringify({
            title: message.title,
            body: message.body,
            team: team,
            innerteam: purpose
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    // .then((response) => {
    //     if (response.ok) {
    //         console.log("Visitor notification sent successfully!");
    //     } else {
    //         console.log("Failed to send visitor notification");
    //     }
    // })
    // .catch((error) => {
    //     console.error("Error sending visitor notification:", error);
    // });
}

// Legacy function for backward compatibility (can be removed if not needed elsewhere)
function pushNotification(title, body) {
    fetch(`${baseURL}/sendNotification`, {
        method: "POST",
        body: JSON.stringify({
            title: title,
            body: body,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.ok) {
                console.log("Notification sent!");
            } else {
                console.log("Failed to send notification");
            }
        })
        .catch((error) => {
            console.error("Error sending notification:", error);
        });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
