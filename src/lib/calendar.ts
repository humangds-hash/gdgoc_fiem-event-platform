import { EventDetails } from "@/types/event";

export function getGoogleCalendarUrl(event: EventDetails): string {
  const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
  
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.tagline}\n\nVenue: ${event.hallOrRoom}, ${event.venueName}\nOrganized by: ${event.communityName}`
  );
  const location = encodeURIComponent(`${event.hallOrRoom}, ${event.venueName}, ${event.city}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export function downloadIcsFile(event: EventDetails) {
  const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TinyGD//Event//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@tinygd.dev`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.tagline} - Hosted by ${event.communityName}`,
    `LOCATION:${event.hallOrRoom}, ${event.venueName}, ${event.city}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
