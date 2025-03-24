import { AUTH_ENDPOINTS } from '@/config/apiConfig';

export default async function userLogin(userEmail: string, userPassword: string) {
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "email": userEmail,
            "password": userPassword
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
    }
    
    return data;
}