import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const PasswordInput = ({ value, onChange, placeholder = "Senha", required = false, className = "" }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 pr-12 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-primary ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}

export default PasswordInput
