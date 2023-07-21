const formatterSecondsToTime = (segundos: number, duration: number) => {
    if (duration >= 3600) {
      return (
        Math.floor(segundos / 3600)
          .toString()
          .padStart(2, "0") +
        ":" +
        Math.floor(segundos / 60)
          .toString()
          .padStart(2, "0") +
        ":" +
        Math.floor(segundos % 60)
          .toString()
          .padStart(2, "0")
      );
    } else {
      return (
        Math.floor(segundos / 60)
          .toString()
          .padStart(2, "0") +
        ":" +
        Math.floor(segundos % 60)
          .toString()
          .padStart(2, "0")
      );
    }
  };

export default formatterSecondsToTime;