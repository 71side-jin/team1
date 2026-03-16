import { useEffect, useRef, useState } from "react";
import "./App.css";
import ModeButtons from "./components/ModeButtons";
import MediaUploadBox from "./components/MediaUploadBox";
import TextUploadBox from "./components/TextUploadBox";
import MediaResultPanel from "./components/MediaResultPanel";
import TextResultPanel from "./components/TextResultPanel";

type Mode = "text" | "image" | "video";

const ACCEPT_MAP: Record<Mode, string> = {
  text: ".txt",
  image: "image/*",
  video: "video/*",
};

const LABEL_MAP: Record<Exclude<Mode, "text">, string> = {
  image: "Drag & Drop or Click to Upload an Image",
  video: "Drag & Drop or Click to Upload a Video",
};

export default function App() {
  const [mode, setMode] = useState<Mode>("image");
  const [dragging, setDragging] = useState(false);
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function resetState(): void {
    setText("");
    setDragging(false);
    setIsAnalyzing(false);
    setResult("");
    setIsPreviewLoading(false);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");

    if (textRef.current) textRef.current.innerText = "";
    if (inputRef.current) inputRef.current.value = "";
  }

  function getAccept(): string {
    return ACCEPT_MAP[mode];
  }

  function getLabel(): string {
    if (mode === "image") return LABEL_MAP.image;
    if (mode === "video") return LABEL_MAP.video;
    return "";
  }

  function openFilePicker(): void {
    inputRef.current?.click();
  }

  function focusTextEditor(): void {
    textRef.current?.focus();
  }

  function updateTextEditor(newText: string): void {
    setText(newText);
    setResult("");

    if (textRef.current) {
      textRef.current.innerText = newText;
      textRef.current.focus();
    }
  }

  async function handleTextFile(selectedFile: File): Promise<void> {
    const content = await selectedFile.text();
    updateTextEditor(content);
  }

  async function handleMediaFile(selectedFile: File): Promise<void> {
    setIsPreviewLoading(true);
    setResult("");

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const previewPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve(URL.createObjectURL(selectedFile)), 1200);
    });

    const analyzePromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("RESULT"), 2000);
    });

    const [objectUrl, analyzeResult] = await Promise.all([
      previewPromise,
      analyzePromise,
    ]);

    setPreviewUrl(objectUrl);
    setResult(analyzeResult);
    setIsPreviewLoading(false);
  }

  async function handleFile(selectedFile?: File): Promise<void> {
    if (!selectedFile) return;

    if (mode === "text") {
      await handleTextFile(selectedFile);
      return;
    }

    await handleMediaFile(selectedFile);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(): void {
    setDragging(false);
  }

  async function handleDrop(
    e: React.DragEvent<HTMLDivElement>
  ): Promise<void> {
    e.preventDefault();
    setDragging(false);
    await handleFile(e.dataTransfer.files?.[0]);
  }

  async function handleTextDrop(
    e: React.DragEvent<HTMLDivElement>
  ): Promise<void> {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await handleTextFile(droppedFile);
      return;
    }

    const droppedText = e.dataTransfer.getData("text");
    if (droppedText) {
      const currentText = textRef.current?.innerText || text;
      updateTextEditor(currentText + droppedText);
    }
  }

  async function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    await handleFile(e.target.files?.[0]);
  }

  function handleTextInput(e: React.FormEvent<HTMLDivElement>): void {
    setText(e.currentTarget.innerText);
  }

  function handleTextPaste(
    e: React.ClipboardEvent<HTMLDivElement>
  ): void {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const currentText = textRef.current?.innerText || "";
    updateTextEditor(currentText + pasted);
  }

  async function handleAnalyze(): Promise<void> {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResult("");

    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    setIsAnalyzing(false);
    setResult("RESULT");
  }

  return (
    <div className="page">
      <h1 className="title">I SEE YOU</h1>
      <p className="subtitle">AI Detector</p>

      <ModeButtons mode={mode} setMode={setMode} reset={resetState} />

      {mode !== "text" ? (
        <>
          <MediaUploadBox
            mode={mode}
            dragging={dragging}
            previewUrl={previewUrl}
            isPreviewLoading={isPreviewLoading}
            getLabel={getLabel}
            inputRef={inputRef}
            getAccept={getAccept}
            openFilePicker={openFilePicker}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleChange={handleChange}
          />

          <MediaResultPanel
            previewUrl={previewUrl}
            isPreviewLoading={isPreviewLoading}
            result={result}
            resetState={resetState}
          />
        </>
      ) : (
        <>
          <TextUploadBox
            dragging={dragging}
            text={text}
            inputRef={inputRef}
            textRef={textRef}
            getAccept={getAccept}
            focusTextEditor={focusTextEditor}
            openFilePicker={openFilePicker}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleTextDrop={handleTextDrop}
            handleChange={handleChange}
            handleTextInput={handleTextInput}
            handleTextPaste={handleTextPaste}
          />

          <TextResultPanel
            text={text}
            isAnalyzing={isAnalyzing}
            result={result}
            handleAnalyze={handleAnalyze}
            resetState={resetState}
          />
        </>
      )}
    </div>
  );
}