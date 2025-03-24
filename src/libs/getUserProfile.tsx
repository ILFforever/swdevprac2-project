import { AUTH_ENDPOINTS, createAuthHeader } from '@/config/apiConfig';
import { ApiResponse, User } from '@/types/dataTypes';

export default async function getUserProfile(token: string): Promise<ApiResponse<User>> {
    const response = await fetch(AUTH_ENDPOINTS.GET_PROFILE, {
        method: "GET",
        headers: {
            ...createAuthHeader(token),
            'Content-Type': 'application/json'
        },
    });
    
    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }
    
    return await response.json();
}