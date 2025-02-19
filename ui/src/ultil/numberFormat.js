export const formatEnrolled = (enrolled) => {
  if (enrolled >= 1_000_000_000) {
    return (enrolled / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (enrolled >= 1_000_000) {
    return (enrolled / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (enrolled >= 1_000) {
    return (enrolled / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    return enrolled.toString();
  }
};
