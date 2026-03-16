type TextResultPanelProps = {
  text: string;
  isAnalyzing: boolean;
  result: string;
  handleAnalyze: () => Promise<void>;
  resetState: () => void;
};

export default function TextResultPanel({
  text,
  isAnalyzing,
  result,
  handleAnalyze,
  resetState,
}: TextResultPanelProps) {
  if (!text.trim()) return null;

  return (
    <div className="analyze-section">
      <div className="analyze-button-row">
        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? <span className="spinner" /> : "Analyze"}
        </button>

        {result && (
          <button
            type="button"
            className="reset-btn"
            onClick={resetState}
          >
            Reset
          </button>
        )}
      </div>

      {result && <p className="result-text">{result}</p>}
    </div>
  );
}