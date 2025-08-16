export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin' | 'coach'
  createdAt?: string
  updatedAt?: string
}

export interface AuthUser extends User {
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}