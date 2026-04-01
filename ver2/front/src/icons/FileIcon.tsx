export default function FileIcon() {
  return (
    <svg width="88" height="88" viewBox="0 0 64 64" fill="none">
      {/* 파일 본체 */}
      <path
        d="M16 8H36L48 20V52C48 54 46 56 44 56H16C14 56 12 54 12 52V12C12 10 14 8 16 8Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* 접힌 모서리 */}
      <path
        d="M36 8V20H48"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* 텍스트 라인 느낌 */}
      <line
        x1="18"
        y1="30"
        x2="40"
        y2="30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="38"
        x2="36"
        y2="38"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}