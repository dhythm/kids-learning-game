import type { ClockTime } from '../lib/clock'

export default function ClockFace({ hour, minute }: ClockTime) {
  return <svg className="clock-face" viewBox="0 0 200 200" role="img" aria-label="とけい" data-hour={hour} data-minute={minute}>
    <circle cx="100" cy="100" r="96" fill="#fffdf7" stroke="#4f7163" strokeWidth="5" />
    <g aria-hidden="true">{Array.from({ length: 12 }, (_, index) => {
      const angle = index * Math.PI / 6
      return <g key={index}>
        <path d={`M100 9v${index % 3 === 0 ? 10 : 5}`} transform={`rotate(${index * 30} 100 100)`} stroke="#51635b" strokeWidth="3" />
        <text x={100 + 70 * Math.sin(angle)} y={100 - 70 * Math.cos(angle)} textAnchor="middle" dominantBaseline="central" fill="#263d31" fontSize="16">{index || 12}</text>
      </g>
    })}
      <path d="M100 100V59" stroke="#263d31" strokeWidth="8" strokeLinecap="round" transform={`rotate(${hour * 30 + minute / 2} 100 100)`} />
      <path d="M100 100V37" stroke="#a44830" strokeWidth="4" strokeLinecap="round" transform={`rotate(${minute * 6} 100 100)`} />
      <circle cx="100" cy="100" r="5" fill="#263d31" />
    </g>
  </svg>
}
