/** TOTAL POINT 레벨 분류 **/
export const levelMark = (point) => {
  if (point < 0) {
    return '💩';
  } else if (point < 2000) {
    return '🥚';
  } else if (point < 4000) {
    return '🐣';
  } else if (point < 6000) {
    return '🐥';
  } else if (point < 8000) {
    return '🐤';
  } else if (point < 12000) {
    return '🐓';
  } else if (point < 16000) {
    return '🦃';
  } else if (point < 20000) {
    return '🦆';
  } else if (point < 30000) {
    return '🦢';
  } else if (point < 40000) {
    return '🦅';
  } else if (point < 60000) {
    return '🤎';
  } else if (point < 80000) {
    return '💜';
  } else if (point < 100000) {
    return '💙';
  } else if (point < 120000) {
    return '💚';
  } else if (point < 140000) {
    return '💛';
  } else if (point < 160000) {
    return '🧡';
  } else if (point < 180000) {
    return '❤️';
  } else if (point < 200000) {
    return '💝';
  } else if (point < 250000) {
    return '💖';
  } else {
    return '⭐';
  }
};

/** WEEKLY RANK 등수 분류 **/
export const weeklyRank = (ranking) => {
  if (ranking == 1) {
    return '🥇';
  } else if (ranking == 2) {
    return '🥈';
  } else if (ranking == 3) {
    return '🥉';
  } else {
    return ranking;
  }
};
