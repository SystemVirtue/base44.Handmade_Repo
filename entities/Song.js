export class Song {
  static async list() {
    // Mock song data
    return [
      {
        id: 1,
        title: "Deep Cover (Explicit)",
        artist: "FAT JOE",
        duration: "3:45",
        votes: 5,
      },
      {
        id: 2,
        title: "Sample Song 2",
        artist: "Artist 2",
        duration: "4:20",
        votes: 3,
      },
    ];
  }

  static async update(id, data) {
    // Mock update
    return { id, ...data };
  }
}
