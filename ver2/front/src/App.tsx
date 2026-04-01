import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import ImageIcon from "./icons/ImageIcon";
import VideoIcon from "./icons/VideoIcon";
import FileIcon from "./icons/FileIcon";

type AppPage = "home" | "multiModal" | "text" | "image" | "video";
type WorkspacePage = Exclude<AppPage, "home">;
type ModeOption = "mode1" | "mode2" | "mode3" | "mode4";

type ToolCard = {
  id: WorkspacePage;
  title: string;
  description: string;
};

type Section = {
  title: string;
  items: ToolCard[];
};

type UploadState = {
  file: File | null;
  text: string;
  previewUrl: string;
  isPreviewLoading: boolean;
  dragging: boolean;
};

type AnalyzeSuccessResponse = {
  ok: true;
  id: string;
  modelType: string;
  modelName: string;
  fileName: string;
  result: string;
};

type AnalyzeErrorResponse = {
  ok: false;
  message: string;
};

type AnalyzeResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;

const sections: Section[] = [
  {
    title: "",
    items: [
      {
        id: "multiModal",
        title: "멀티모달",
        description: "텍스트, 이미지, 영상을 함께 검사합니다.",
      },
      {
        id: "text",
        title: "텍스트",
        description: "텍스트 파일 또는 입력 문장을 검사합니다.",
      },
      {
        id: "image",
        title: "이미지",
        description: "이미지 파일을 업로드해 검사합니다.",
      },
      {
        id: "video",
        title: "영상",
        description: "영상 파일을 업로드해 검사합니다.",
      },
    ],
  },
];

const PAGE_MODE_OPTIONS: Record<
  WorkspacePage,
  { value: ModeOption; label: string }[]
> = {
  multiModal: [
    { value: "mode1", label: "멀티모달 모드 1" },
    { value: "mode2", label: "멀티모달 모드 2" },
    { value: "mode3", label: "멀티모달 모드 3" },
    { value: "mode4", label: "멀티모달 모드 4" },
  ],
  text: [
    { value: "mode1", label: "텍스트 모드 1" },
    { value: "mode2", label: "텍스트 모드 2" },
    { value: "mode3", label: "텍스트 모드 3" },
    { value: "mode4", label: "텍스트 모드 4" },
  ],
  image: [
    { value: "mode1", label: "이미지 모드 1" },
    { value: "mode2", label: "이미지 모드 2" },
    { value: "mode3", label: "이미지 모드 3" },
    { value: "mode4", label: "이미지 모드 4" },
  ],
  video: [
    { value: "mode1", label: "영상 모드 1" },
    { value: "mode2", label: "영상 모드 2" },
    { value: "mode3", label: "영상 모드 3" },
    { value: "mode4", label: "영상 모드 4" },
  ],
};

const createInitialUploadState = (): UploadState => ({
  file: null,
  text: "",
  previewUrl: "",
  isPreviewLoading: false,
  dragging: false,
});

function TopNav({
  currentPage,
  onHome,
  onNavigate,
}: {
  currentPage: WorkspacePage;
  onHome: () => void;
  onNavigate: (page: WorkspacePage) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { id: WorkspacePage; label: string }[] = [
    { id: "multiModal", label: "멀티모달" },
    { id: "text", label: "텍스트" },
    { id: "image", label: "이미지" },
    { id: "video", label: "영상" },
  ];

  const handleNavClick = (page: WorkspacePage) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  return (
    <header className="top-nav-wrap">
      <div className="top-nav">
        <div
          className="brand"
          onClick={() => {
            setMenuOpen(false);
            onHome();
          }}
        >
          I SEE YOU
        </div>

        <nav className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? "active" : ""}`}
              type="button"
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="메뉴 열기"
          type="button"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`mobile-nav-link ${currentPage === item.id ? "active" : ""}`}
              type="button"
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function ToolItem({ item, onClick }: { item: ToolCard; onClick: () => void }) {
  return (
    <button className="card" onClick={onClick} type="button">
      <div className="accent" />
      <div className="card-content">
        <div className="card-text">
          <div className="card-title">{item.title}</div>
          <p className="card-desc">{item.description}</p>
        </div>
      </div>
    </button>
  );
}

function SectionBlock({
  section,
  onCardClick,
}: {
  section: Section;
  onCardClick: (toolId: WorkspacePage) => void;
}) {
  return (
    <div className="section">
      {section.title ? <h2>{section.title}</h2> : null}
      <div className="grid">
        {section.items.map((item) => (
          <ToolItem key={item.id} item={item} onClick={() => onCardClick(item.id)} />
        ))}
      </div>
    </div>
  );
}

function HomePage({
  onCardClick,
}: {
  onCardClick: (toolId: WorkspacePage) => void;
}) {
  return (
    <div className="container home-simple">
      <div className="hero">
        <div>
          <h1 className="brand-title">I SEE YOU</h1>
          <p className="brand-subtitle">AI Detector</p>
        </div>
      </div>

      {sections.map((section) => (
        <SectionBlock
          key={section.title || "main"}
          section={section}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}

function WorkspaceTopUploader({
  page,
  uploadState,
  setUploadState,
  clearResult,
  resetToken,
}: {
  page: WorkspacePage;
  uploadState: UploadState;
  setUploadState: React.Dispatch<React.SetStateAction<UploadState>>;
  clearResult: () => void;
  resetToken: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const requestIdRef = useRef(0);

  const isTextMode = page === "text";
  const isImageMode = page === "image";
  const isVideoMode = page === "video";
  const isMultiModalMode = page === "multiModal";

  const ACCEPT_MAP: Record<WorkspacePage, string> = {
    multiModal: ".txt,image/*,video/*",
    text: ".txt",
    image: "image/*",
    video: "video/*",
  };

  const LABEL_MAP: Record<WorkspacePage, string> = {
    multiModal: "Drag & Drop or Click to Upload a File",
    text: "",
    image: "Drag & Drop or Click to Upload an Image",
    video: "Drag & Drop or Click to Upload a Video",
  };

  useEffect(() => {
    setUploadState(createInitialUploadState());
    requestIdRef.current += 1;

    if (textRef.current) {
      textRef.current.value = "";
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    clearResult();
  }, [page, resetToken, clearResult, setUploadState]);

  useEffect(() => {
    return () => {
      if (uploadState.previewUrl) {
        URL.revokeObjectURL(uploadState.previewUrl);
      }
    };
  }, [uploadState.previewUrl]);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const focusTextEditor = () => {
    textRef.current?.focus();
  };

  const updateTextEditor = (newText: string) => {
    clearResult();
    setUploadState((prev) => ({
      ...prev,
      text: newText,
    }));
    textRef.current?.focus();
  };

  const handleTextFile = async (selectedFile: File) => {
    const content = await selectedFile.text();
    clearResult();

    setUploadState((prev) => ({
      ...prev,
      file: selectedFile,
      text: content,
      previewUrl: "",
      isPreviewLoading: false,
    }));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleMediaFile = async (selectedFile: File) => {
    clearResult();
    const currentRequestId = ++requestIdRef.current;

    setUploadState((prev) => {
      if (prev.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }

      return {
        ...prev,
        file: selectedFile,
        text: "",
        previewUrl: "",
        isPreviewLoading: true,
      };
    });

    const objectUrl = await new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(selectedFile));
      }, 500);
    });

    if (currentRequestId !== requestIdRef.current) {
      URL.revokeObjectURL(objectUrl);
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      previewUrl: objectUrl,
      isPreviewLoading: false,
    }));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleMultiModalFile = async (selectedFile: File) => {
    if (
      selectedFile.type.startsWith("image/") ||
      selectedFile.type.startsWith("video/")
    ) {
      await handleMediaFile(selectedFile);
      return;
    }

    if (
      selectedFile.type.startsWith("text/") ||
      selectedFile.name.endsWith(".txt")
    ) {
      await handleTextFile(selectedFile);
      return;
    }

    clearResult();
    setUploadState((prev) => ({
      ...prev,
      file: selectedFile,
      text: "",
      previewUrl: "",
      isPreviewLoading: false,
    }));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFile = async (selectedFile?: File) => {
    if (!selectedFile) return;

    if (isMultiModalMode) {
      await handleMultiModalFile(selectedFile);
      return;
    }

    if (isTextMode) {
      await handleTextFile(selectedFile);
      return;
    }

    await handleMediaFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState((prev) => ({ ...prev, dragging: true }));
  };

  const handleDragLeave = () => {
    setUploadState((prev) => ({ ...prev, dragging: false }));
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState((prev) => ({ ...prev, dragging: false }));

    const droppedFile = e.dataTransfer.files?.[0];
    await handleFile(droppedFile);
  };

  const handleTextDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState((prev) => ({ ...prev, dragging: false }));

    const droppedFile = e.dataTransfer.files?.[0];

    if (droppedFile) {
      await handleTextFile(droppedFile);
      return;
    }

    const droppedText = e.dataTransfer.getData("text");
    if (droppedText) {
      const currentText = textRef.current?.value ?? uploadState.text;
      updateTextEditor(currentText + droppedText);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    await handleFile(selectedFile);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    clearResult();
    setUploadState((prev) => ({
      ...prev,
      text: e.target.value,
    }));
  };

  const renderMediaPreview = () => {
    if (uploadState.isPreviewLoading) {
      return (
        <div className="media-loading">
          <span className="spinner dark" />
        </div>
      );
    }

    if (!uploadState.previewUrl) return null;

    if (
      (isImageMode || isMultiModalMode) &&
      uploadState.file?.type.startsWith("image/")
    ) {
      return (
        <img
          src={uploadState.previewUrl}
          alt="preview"
          className="media-preview"
        />
      );
    }

    if (
      (isVideoMode || isMultiModalMode) &&
      uploadState.file?.type.startsWith("video/")
    ) {
      return (
        <video
          src={uploadState.previewUrl}
          className="media-preview"
          controls
        />
      );
    }

    return null;
  };

  return (
    <section className="top-upload-panel">
      {!isTextMode && (
        <div
          className={`upload-box ${uploadState.dragging ? "dragging" : ""}`}
          onClick={!uploadState.previewUrl ? openFilePicker : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_MAP[page]}
            onChange={handleChange}
            hidden
          />

          {renderMediaPreview()}

          {!uploadState.isPreviewLoading && !uploadState.previewUrl && (
            <div className="upload-content simple-upload-content">
              <div className="upload-icon">
                {page === "multiModal" && <FileIcon />}
                {page === "image" && <ImageIcon />}
                {page === "video" && <VideoIcon />}
              </div>
              <p className="upload-text">{LABEL_MAP[page]}</p>
            </div>
          )}
        </div>
      )}

      {isTextMode && (
        <div
          className={`text-upload-box ${uploadState.dragging ? "dragging" : ""}`}
          onClick={focusTextEditor}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleTextDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_MAP[page]}
            onChange={handleChange}
            hidden
          />

          <div className="text-editor-wrap">
            {!uploadState.text && (
              <div
                className="text-placeholder-row"
                onClick={(e) => {
                  e.stopPropagation();
                  focusTextEditor();
                }}
              >
                <span className="text-placeholder">Paste your text, Drop or</span>
                <button
                  type="button"
                  className="inline-upload-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFilePicker();
                  }}
                >
                  Upload
                </button>
              </div>
            )}

            <textarea
              ref={textRef}
              className={`text-editable ${uploadState.text ? "filled" : ""}`}
              value={uploadState.text}
              onChange={handleTextChange}
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Workspace({
  page,
  onHome,
  onNavigate,
}: {
  page: WorkspacePage;
  onHome: () => void;
  onNavigate: (page: WorkspacePage) => void;
}) {
  const [selectedMode, setSelectedMode] = useState<ModeOption>("mode1");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resetToken, setResetToken] = useState(0);
  const [uploadState, setUploadState] = useState<UploadState>(createInitialUploadState());

  useEffect(() => {
    setSelectedMode("mode1");
    setIsAnalyzing(false);
    setResult("");
    setErrorMessage("");
    setUploadState(createInitialUploadState());
    setResetToken((prev) => prev + 1);
  }, [page]);

  const canAnalyze =
    !uploadState.isPreviewLoading &&
    (uploadState.file !== null || uploadState.text.trim().length > 0);

  const clearResult = useCallback(() => {
    setIsAnalyzing(false);
    setResult("");
    setErrorMessage("");
  }, []);

  const parseApiResponse = async (response: Response): Promise<AnalyzeResponse> => {
    const raw = await response.text();

    if (!raw) {
      throw new Error(`빈 응답이 왔습니다. status=${response.status}`);
    }

    try {
      return JSON.parse(raw) as AnalyzeResponse;
    } catch {
      throw new Error(`JSON이 아닌 응답입니다. status=${response.status}, body=${raw}`);
    }
  };

  const analyzeText = async (textValue?: string, fileName?: string): Promise<AnalyzeResponse> => {
    const response = await fetch("/api/analyze-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textValue ?? uploadState.text,
        fileName: fileName ?? uploadState.file?.name ?? "input.txt",
        selectedMode,
        page,
      }),
    });

    return parseApiResponse(response);
  };

  const analyzeMedia = async (mode: "image" | "video", file: File): Promise<AnalyzeResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    formData.append("selectedMode", selectedMode);
    formData.append("page", page);

    const response = await fetch("/api/analyze-media", {
      method: "POST",
      body: formData,
    });

    return parseApiResponse(response);
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    setResult("");
    setErrorMessage("");

    try {
      let data: AnalyzeResponse;

      if (page === "text") {
        data = await analyzeText();
      } else if (page === "image") {
        if (!uploadState.file) {
          throw new Error("이미지 파일이 없습니다.");
        }
        data = await analyzeMedia("image", uploadState.file);
      } else if (page === "video") {
        if (!uploadState.file) {
          throw new Error("영상 파일이 없습니다.");
        }
        data = await analyzeMedia("video", uploadState.file);
      } else {
        if (!uploadState.file && !uploadState.text.trim()) {
          throw new Error("분석할 입력이 없습니다.");
        }

        if (uploadState.file) {
          if (uploadState.file.type.startsWith("image/")) {
            data = await analyzeMedia("image", uploadState.file);
          } else if (uploadState.file.type.startsWith("video/")) {
            data = await analyzeMedia("video", uploadState.file);
          } else if (
            uploadState.file.type.startsWith("text/") ||
            uploadState.file.name.endsWith(".txt")
          ) {
            const text = uploadState.text || (await uploadState.file.text());
            data = await analyzeText(text, uploadState.file.name);
          } else {
            throw new Error("현재 멀티모달에서는 txt, image, video만 지원합니다.");
          }
        } else {
          data = await analyzeText();
        }
      }

      if (!data.ok) {
        setErrorMessage(data.message || "분석에 실패했습니다.");
        setResult("");
        return;
      }

      setResult(data.result);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "서버 요청 중 오류가 발생했습니다."
      );
      setResult("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = useCallback(() => {
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }

    setUploadState(createInitialUploadState());
    setIsAnalyzing(false);
    setResult("");
    setErrorMessage("");
    setResetToken((prev) => prev + 1);
  }, [uploadState.previewUrl]);

  return (
    <div className="workspace-page">
      <TopNav currentPage={page} onHome={onHome} onNavigate={onNavigate} />

      <main className="workspace-shell">
        <WorkspaceTopUploader
          page={page}
          uploadState={uploadState}
          setUploadState={setUploadState}
          clearResult={clearResult}
          resetToken={resetToken}
        />

        <section className="top-control-bar">
          <div className="top-control-left">
            <label className="top-control-label" htmlFor="mode-select">
              모드 :
            </label>
            <select
              id="mode-select"
              className="top-control-select"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as ModeOption)}
            >
              {PAGE_MODE_OPTIONS[page].map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="analyze-inline-btn"
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
          >
            {isAnalyzing ? <span className="spinner" /> : "Analyze"}
          </button>
        </section>

        {errorMessage && (
          <div className="analyze-section top-upload-actions">
            <p className="result-text">{errorMessage}</p>
            <div className="analyze-button-row">
              <button type="button" className="reset-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}

        {result && !errorMessage && (
          <div className="analyze-section top-upload-actions">
            <p className="result-text">{result}</p>
            <div className="analyze-button-row">
              <button type="button" className="reset-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<AppPage>("home");

  const handleCardClick = (toolId: WorkspacePage) => {
    setPage(toolId);
  };

  return page === "home" ? (
    <HomePage onCardClick={handleCardClick} />
  ) : (
    <Workspace
      page={page}
      onHome={() => setPage("home")}
      onNavigate={(nextPage) => setPage(nextPage)}
    />
  );
}