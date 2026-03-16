type TextUploadBoxProps = {
  dragging: boolean;
  text: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  textRef: React.RefObject<HTMLDivElement | null>;
  getAccept: () => string;
  focusTextEditor: () => void;
  openFilePicker: () => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  handleTextDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleTextInput: (e: React.FormEvent<HTMLDivElement>) => void;
  handleTextPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
};

export default function TextUploadBox({
  dragging,
  text,
  inputRef,
  textRef,
  getAccept,
  focusTextEditor,
  openFilePicker,
  handleDragOver,
  handleDragLeave,
  handleTextDrop,
  handleChange,
  handleTextInput,
  handleTextPaste,
}: TextUploadBoxProps) {
  return (
    <div
      className={`text-upload-box ${dragging ? "dragging" : ""}`}
      onClick={focusTextEditor}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleTextDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={getAccept()}
        onChange={handleChange}
        hidden
      />

      <div className="text-editor-wrap">
        {!text && (
          <div
            className="text-placeholder-row"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              focusTextEditor();
            }}
          >
            <span className="text-placeholder">Paste your text, Drop or</span>
            <button
              type="button"
              className="inline-upload-btn"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                openFilePicker();
              }}
            >
              Upload
            </button>
          </div>
        )}

        <div
          ref={textRef}
          className={`text-editable ${text ? "filled" : ""}`}
          contentEditable
          suppressContentEditableWarning
          onInput={handleTextInput}
          onPaste={handleTextPaste}
        />
      </div>
    </div>
  );
}