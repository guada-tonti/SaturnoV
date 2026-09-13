/** Formatea MET sin cambiar los datos históricos; conserva notas y precisión. */
export function formatMissionTime(value) {
  return value.replace(/\b(T[+-])\s*(\d+):(\d{2})(?::(\d{2}))?/g,
    (_, sign, hoursText, minutesText, secondsText) => {
      const hours = Number(hoursText);
      const days = Math.floor(hours / 24);
      const showDays = hours > 24;
      const units = [
        ...(showDays ? [`${days}d`] : []),
        `${showDays ? hours % 24 : hours}h`,
        `${Number(minutesText)}m`,
        ...(secondsText === undefined ? [] : [`${Number(secondsText)}s`])
      ];
      return units.join(':');
    });
}
