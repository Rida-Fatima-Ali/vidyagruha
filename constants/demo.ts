/**
 * Shared demo clock for the prototype. Every mock "today" reference and the
 * faculty current/next lecture logic read from here so the whole app agrees on
 * what "now" means, without depending on the machine clock.
 */

/** The demo date every role's dashboard resolves its schedule for. */
export const DEMO_TODAY = "2026-08-15";

/** The prototype's demo faculty member (Python Lab, CMPN309). */
export const DEMO_FACULTY_NAME = "Varsha Kinge";

/** Week used by the faculty schedule and manage-lecture workflows. */
export const DEMO_WEEK_START = "2026-08-10";

/**
 * The prototype's "now". Placed inside the Saturday Python Lab session
 * (13:00–14:40) so the faculty dashboard can show a live CURRENT lecture.
 */
export const DEMO_NOW = new Date("2026-08-15T13:40:00");
