import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Hardcoded service account credentials
const serviceAccount: ServiceAccount = {
  projectId: "quantum-traders",
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0nI21zCE0BMuL
0YU29yAUTcxnKZNWqN3qYQ+lp6ZtUE0WdPWGNhQY97I5IY1MX410j5vXtHxhDpxI
bgy8u2eCxtjJXq1eg6wwGwmA02O3T5Xy6guTlMMT+uhn2iMPZPsgRAEuCX72xquB
DCvOSxzdK9BmbC6taaqVMVv3Ad+MLSsIqhJ+jFzwwsEBueFMbX1pmILCa6T8OFyv
ER+X5UlQDlSU3B5W4AbWR2xf/PrdW9NAX8aFt0zMEdtua1InxhICXres6SLKvAx9
KcgDlxRPOySGVCOOj5tgsEfAUDOQ5t0DxtpAcIsDaU2bjWL6KayFlgjpKGUvmLpo
0t9usjtHAgMBAAECggEARl32Uj2xNACoQxXDBpq6u15iRFEs7+cD6uSdAYfzbgSK
vDSeUgdwxhd/LwYU9IwH40FuUNinWvMjzY5e1QtYtVl+rdn+xuObKvTlu3TglVNj
Ewy/rOSZKognkwqofT91HemQ4hxeBIx71l/lE08tdDg1TipY90RDazQbZf2rWIO6
hNK0QmDT77E+7wNlC7YsX7+Mplj9ymNU5x26PQI3ZjI16lcnNomdSrODr8VJjfRf
eUe0PxyZhCV/ux1TH98iQN0ZQ8Hive3VEuCfZG7IcZzoGFX7gKduNS0Nt4U4y3ym
jbDsSfLBhk+HI0ZqDWmSR5loqgUEf+UxcwGl2UPVtQKBgQDoHclRWiyIQUTZdoy4
RrvOwNzpGJn3NCZ+Vv+uLTYxWx6AL5xNw1CBgPCPUM1+eZSTD3SwiIulb7PwzDSL
lirb9BsKWUEh8AAE4xHpht3TXd7ANmuj7UHh2ELAje6JvBgqonuiG4FW0SRkcl8R
2QB0edxQoxYupsBtSpjYD9BlkwKBgQDHMhIWN55TMu5yD5ZK8b1ztO4lx0JVyL2F
gj8T+gWRsutTrPW6DQ2OEBisT1E9hidBf3nAUDANzKiNOEiCY8O+xVivcuA4KPJp
MsckRd6RHLMx++YxthkqImUq3wkdf+mUy3cA1PYRJlAGcaN87heUyPXMWgGQiMH9
ZiR7+XJj/QKBgQC5Fr9ompI2GG2xRoIRk33A8TN2wAJOCAzF49O/7RdwpesdZlmp
/JvemJW6gkFKn+Jkngd7mXZZdkgzNHKV+Cm2+ODzEJcKW9l4DCVFZSDPoeO0u/B7
Z/6H+63G46aZuB5BKQ2TB4HMW7s8SaMblUFyn5WZy2It0xRQUhKs/3c69wKBgGRJ
RiffWpuiob/VLyKOMIanidqFRlVwGlK0L1O8Zb9j5+yZwKEp3zAt1G40BL/H4c2t
AzwaYwcfiaCHvKHA3pUWQD8cw9wiaWEjSnVto89FNsasfsl6V5MJ/AsofStX8d6S
zVgi37vkoReNcPT93etvfaiji/QblicgnK+596h1AoGAQtfYBX+DKKhMuBUmro1N
iCnDR8lc+hpmLTYTVQjTrwL0b4QqjLtplmikkGRpUVpmGJfSXctZnKwb1y35n9nQ
OnmQBEgORpH5TsNsV11rYPbGnBB1jta2TH+RajiM4a76UgbqG6z5tG7yevlztnT0
ndEBlIfu7iiuACbVl3uSVsI=
-----END PRIVATE KEY-----`,
  clientEmail: "firebase-adminsdk-fbsvc@quantum-traders.iam.gserviceaccount.com",
};

// Initialize Firebase
const app = initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore(app);

// Collections
export const productsCollection = db.collection('products');
export const categoriesCollection = db.collection('categories');

console.log('Firebase Admin initialized successfully');