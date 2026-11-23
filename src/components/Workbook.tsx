export default function Workbook() {
  return <svg className="workbook" viewBox="0 0 230 155" fill="none" aria-hidden="true">
    <ellipse cx="122" cy="139" rx="78" ry="7" fill="#413923" opacity=".09" />
    <g stroke="#37463f" strokeWidth="3" strokeLinejoin="round" transform="rotate(9 118 78)">
      <rect x="66" y="23" width="102" height="116" rx="7" fill="#699c86" />
      <rect x="63" y="18" width="102" height="116" rx="7" fill="#fff8db" />
      <rect x="60" y="13" width="102" height="115" rx="7" fill="#9bd0b5" />
      <path d="M76 14v112" stroke="#65997d" strokeWidth="2" />
      {[29, 47, 65, 83, 101].map(y => <path key={y} d={`M65 ${y}c-14 3-15-9-6-10`} strokeLinecap="round" />)}
      <rect x="88" y="29" width="56" height="21" rx="4" fill="#fff9dd" strokeWidth="2" />
      <path d="M96 40h9m-4.5-4.5v9m12-4.5h8m6-3h9m-9 6h9" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M94 78v5m37-5v5m-26 2q7 12 15 0" strokeWidth="4" strokeLinecap="round" />
      <g fill="#f4a88e" stroke="none"><ellipse cx="89" cy="88" rx="6" ry="3"/><ellipse cx="136" cy="88" rx="6" ry="3"/></g>
    </g>
    <g transform="rotate(29 178 104)" stroke="#484337" strokeWidth="2.5" strokeLinejoin="round">
      <rect x="170" y="65" width="15" height="64" rx="4" fill="#efac57"/><path d="M170 77h15v7h-15z" fill="#fff6d9"/><path d="M170 129h15l-7.5 17z" fill="#fbe1a1"/><path d="m175 140 2.5 6 2.5-6z" fill="#484337"/><path d="M177.5 89v34" stroke="#ffd788"/>
    </g>
    <g fill="#fff8d5" stroke="#907444" strokeWidth="2"><path d="m29 49 3 9 8 3-8 3-3 9-3-9-8-3 8-3z"/><path d="m192 22 2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></g>
  </svg>
}
