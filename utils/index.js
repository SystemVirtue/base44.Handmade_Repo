export function createPageUrl(pageName) {
  const pageMap = {
    Dashboard: "/dashboard",
    DigitalSignage: "/digital-signage",
    VideoOutput: "/video-output",
    Controls: "/controls",
    QueueSchedule: "/queue-schedule",
    SearchSongs: "/search-songs",
    Scheduler: "/scheduler",
    Settings: "/settings",
    UILookAndFeel: "/ui-look-and-feel",
    Messages: "/messages",
    MusicZoneInfo: "/music-zone-info",
    ChangeMusicZone: "/change-music-zone",
  };

  return pageMap[pageName] || "/";
}
