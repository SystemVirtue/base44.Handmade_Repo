export class CustomMedia {
  static async get(id) {
    // Mock data
    return {
      id,
      file_url:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=100&fit=crop",
    };
  }

  static async list() {
    return [];
  }
}
