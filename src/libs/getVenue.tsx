import { VENUE_ENDPOINTS } from '@/config/apiConfig';
import { ApiResponse, Venue } from '@/types/dataTypes';

export default async function getVenue(id: string): Promise<ApiResponse<Venue>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const response = await fetch(VENUE_ENDPOINTS.GET_BY_ID(id));

    if(!response.ok) {
      throw new Error("Failed to fetch venue.")
    }

    return await response.json();

  } catch (error) {
    console.error("Error fetching venue:", error);
    throw error;
  }
}