// Simulating a mock API call to fetch building options with id and name
export async function fetchBuilding(): Promise<{ id: string; name: string }[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", name: "North Tower" },
        { id: "2", name: "South Wing" },
        { id: "3", name: "East Complex" },
      ]);
    }, 1000);
  });
}
