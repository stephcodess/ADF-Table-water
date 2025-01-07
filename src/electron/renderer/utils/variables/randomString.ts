function generateRandomStringWithTime() {
    const timestamp = Date.now().toString(); // Get current timestamp
    const random = Math.random().toString(36).substring(2, 10); // Generate random number
  
    return timestamp + random;
  }
  
  export const randomString = generateRandomStringWithTime();
