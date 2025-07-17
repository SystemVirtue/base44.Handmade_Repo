export class UISettings {
  static async list() {
    // Mock data for now
    return [
      {
        id: 1,
        color_palette: "celtic",
        background_theme: "dark",
        banner_media_id: "default",
      },
    ];
  }

  static async create(data) {
    // Mock create
    return {
      id: Date.now(),
      ...data,
    };
  }

  static async get(id) {
    // Mock get
    return {
      id,
      color_palette: "celtic",
      background_theme: "dark",
    };
  }
}
