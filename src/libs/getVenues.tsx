import { VENUE_ENDPOINTS } from '@/config/apiConfig';
import { ApiResponse, Venue } from '@/types/dataTypes';

export default async function getVenues(): Promise<ApiResponse<Venue[]>> {
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const response = await fetch(VENUE_ENDPOINTS.GET_ALL);

    if(!response.ok) {
      throw new Error("Failed to fetch venues.")
    }

    return await response.json();

  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
}