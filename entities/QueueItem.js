export class QueueItem {
  static async list(options = {}) {
    // Mock queue data
    return [
      {
        id: 1,
        song_id: 1,
        order_index: 1,
        is_currently_playing: true,
      },
      {
        id: 2,
        song_id: 2,
        order_index: 2,
        is_currently_playing: false,
      },
    ];
  }
}
