const Logo = ({ size = 40, showText = true }) => {
  return (
    <div className="flex items-center gap-3">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo externo */}
        <circle cx="50" cy="50" r="45" stroke="#ff6b00" strokeWidth="4" fill="#1a1a1a"/>
        
        {/* Raio central */}
        <circle cx="50" cy="50" r="8" fill="#ff6b00"/>
        
        {/* Linhas de controle (estilo radar) */}
        <line x1="50" y1="50" x2="50" y2="15" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="80" y2="30" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="85" y2="50" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="50" x2="80" y2="70" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round"/>
        
        {/* Pontos de conexão */}
        <circle cx="50" cy="15" r="4" fill="#ff6b00"/>
        <circle cx="80" cy="30" r="4" fill="#ff6b00"/>
        <circle cx="85" cy="50" r="4" fill="#ff6b00"/>
        <circle cx="80" cy="70" r="4" fill="#ff6b00"/>
        
        {/* Anel interno */}
        <circle cx="50" cy="50" r="25" stroke="#ff6b00" strokeWidth="2" opacity="0.3" strokeDasharray="4 4"/>
        
        {/* Letra X estilizada */}
        <text 
          x="50" 
          y="58" 
          fontSize="28" 
          fontWeight="bold" 
          fill="#ff6b00" 
          textAnchor="middle" 
          fontFamily="Arial, sans-serif"
        >
          X
        </text>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white leading-none">MaxxControl</span>
          <span className="text-primary text-sm font-bold leading-none">X</span>
        </div>
      )}
    </div>
  )
}

export default Logo
