type MediaResultPanelProps = {
  previewUrl: string;
  isPreviewLoading: boolean;
  result: string;
  resetState: () => void;
};

export default function MediaResultPanel({
  previewUrl,
  isPreviewLoading,
  result,
  resetState,
}: MediaResultPanelProps) {
  if (!previewUrl || isPreviewLoading) return null;

  return (
    <div className="analyze-section">
      <div className="analyze-button-row">
        <button
          type="button"
          className="reset-btn"
          onClick={resetState}
        >
          Reset
        </button>
      </div>

      {result && <p className="result-text">{result}</p>}
    </div>
  );
}