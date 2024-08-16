/** TOTAL POINT 레벨 분류 **/
export const levelMark = (point) => {
  if (isNaN(point) || point < 0) {
    return '💩';
  } else if (point < 200) {
    return '🥚';
  } else if (point < 400) {
    return '🐣';
  } else if (point < 600) {
    return '🐥';
  } else if (point < 800) {
    return '🐤';
  } else if (point < 1200) {
    return '🐓';
  } else if (point < 1600) {
    return '🦃';
  } else if (point < 2000) {
    return '🦆';
  } else if (point < 3000) {
    return '🦢';
  } else if (point < 4000) {
    return '🦅';
  } else if (point < 6000) {
    return '🤎';
  } else if (point < 8000) {
    return '💜';
  } else if (point < 10000) {
    return '💙';
  } else if (point < 12000) {
    return '💚';
  } else if (point < 14000) {
    return '💛';
  } else if (point < 16000) {
    return '🧡';
  } else if (point < 18000) {
    return '❤️';
  } else if (point < 20000) {
    return '💝';
  } else if (point < 25000) {
    return '💖';
  } else {
    return '⭐';
  }
};

/** RANK MARK 분류 **/
export const rankMark = (ranking) => {
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
