
/**
 * @file services/simulatedApiService.ts
 * @description Provides a mock API service for fetching simulated data.
 * This is used to populate UI components with dynamic data without making real network requests,
 * which is useful for development, testing, and creating a stable demo environment.
 */

/**
 * Simulates fetching external API data with a random delay and a small chance of a network error.
 * This function helps demonstrate how the UI handles loading states and potential API failures.
 * The data returned is procedurally generated to provide some variability.
 * 
 * @returns {Promise<{ users: any[]; packets: number }>} A promise that resolves with an object
 * containing mock user data and a simulated packet count, or rejects with a simulated error.
 */
export const fetchSimulatedApiData = async (): Promise<{ users: any[]; packets: number }> => {
  return new Promise((resolve, reject) => {
    // Simulate a network latency between 0.5 to 2 seconds.
    const delay = 500 + Math.random() * 1500; 

    setTimeout(() => {
      // Introduce a 2% chance of a simulated network error to test error handling.
      if (Math.random() < 0.02) { 
        reject(new Error('Simulated network request failed: Connection timed out.'));
        return;
      }

      // Generate a variable number of mock users.
      const mockUsers = Array.from({ length: 10 + Math.floor(Math.random() * 10) }).map((_, i) => ({ id: i, name: `User ${i}` }));
      
      // Simulate a packet count based on the number of active users.
      const mockPackets = mockUsers.length * 10 + Math.floor(Math.random() * 50);

      resolve({ users: mockUsers, packets: mockPackets });
    }, delay);
  });
};