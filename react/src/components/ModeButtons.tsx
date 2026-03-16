type Mode = "text" | "image" | "video";

type ModeButtonsProps = {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  reset: () => void;
};

export default function ModeButtons({ mode, setMode, reset, }: ModeButtonsProps) {
  const changeMode = (nextMode: Mode): void => {
    setMode(nextMode);
    reset();
  };

  return (
    <div className="mode-buttons">
      <button
        className={mode === "text" ? "active" : ""}
        onClick={() => changeMode("text")}
      >
        Text
      </button>
      <button
        className={mode === "image" ? "active" : ""}
        onClick={() => changeMode("image")}
      >
        Image
      </button>
      <button
        className={mode === "video" ? "active" : ""}
        onClick={() => changeMode("video")}
      >
        Video
      </button>
    </div>
  );
}