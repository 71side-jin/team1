import ImageIcon from "../icons/ImageIcon";
import VideoIcon from "../icons/VideoIcon";

type Mode = "text" | "image" | "video";

type MediaUploadBoxProps = {
  mode: Mode;
  dragging: boolean;
  previewUrl: string;
  isPreviewLoading: boolean;
  getLabel: () => string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  getAccept: () => string;
  openFilePicker: () => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export default function MediaUploadBox({
  mode,
  dragging,
  previewUrl,
  isPreviewLoading,
  getLabel,
  inputRef,
  getAccept,
  openFilePicker,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleChange,
}: MediaUploadBoxProps) {
  return (
    <div
      className={`upload-box ${dragging ? "dragging" : ""}`}
      onClick={!previewUrl ? openFilePicker : undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={getAccept()}
        onChange={handleChange}
        hidden
      />

      {isPreviewLoading && (
        <div className="media-loading">
          <span className="spinner dark" />
        </div>
      )}

      {!isPreviewLoading && previewUrl && mode === "image" && (
        <img src={previewUrl} alt="preview" className="media-preview" />
      )}

      {!isPreviewLoading && previewUrl && mode === "video" && (
        <video src={previewUrl} className="media-preview" controls />
      )}

      {!isPreviewLoading && !previewUrl && (
        <div className="upload-content">
          <div className="upload-icon">
            {mode === "image" && <ImageIcon />}
            {mode === "video" && <VideoIcon />}
          </div>

          <p className="upload-text">{getLabel()}</p>
        </div>
      )}
    </div>
  );
}