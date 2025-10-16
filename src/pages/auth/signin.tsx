// src/pages/auth/signin.tsx
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Snackbar,
  Fade,
  Zoom
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'
import InventoryIcon from '@mui/icons-material/Inventory'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const CREDENTIALS = {
  username: 'admin',
  password: 'ogaro3'
}

export default function SignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simple credential check
    if (formData.username === CREDENTIALS.username && formData.password === CREDENTIALS.password) {
      // Show success state
      setSuccess(true)
      
      // Store authentication in sessionStorage (clears when browser closes)
      sessionStorage.setItem('authenticated', 'true')
      
      // Redirect to dashboard after a brief delay to show success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      setError('Invalid username or password')
      setLoading(false)
    }
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative'
      }}
    >
      <Container component="main" maxWidth="sm">
        {/* Enhanced Home Button - More visible and accessible */}
        <Box sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20,
          zIndex: 1000
        }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleHomeClick}
            sx={{
              background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: 3,
              '&:hover': {
                background: 'linear-gradient(45deg, #1a252f 0%, #2980b9 100%)',
                boxShadow: 6,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease',
              minWidth: 120
            }}
          >
            Back to Home
          </Button>
        </Box>

        <Zoom in={true} timeout={800}>
          <Paper
            elevation={16}
            sx={{
              padding: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(45deg, #00b09b 0%, #96c93d 100%)',
              }
            }}
          >
            {/* Success Overlay */}
            {success && (
              <Fade in={success}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, #00b09b 0%, #96c93d 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    borderRadius: 3,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'white', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                    Welcome Back!
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
                    Redirecting to Dashboard...
                  </Typography>
                </Box>
              </Fade>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <InventoryIcon sx={{ fontSize: 40, color: 'white' }} />
              <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                Spenza Stock
              </Typography>
            </Box>
            
            <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Admin Sign In
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 3,
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& .MuiAlert-icon': { color: '#ff6b6b' }
                }}
              >
                {error}
              </Alert>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                mt: 1, 
                width: '100%',
                opacity: success ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                disabled={loading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#aeea00',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#2c3e50',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#aeea00',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#aeea00',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#2c3e50',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#aeea00',
                  },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                disabled={loading || success}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: success 
                    ? 'linear-gradient(45deg, #00b09b 0%, #96c93d 100%)'
                    : 'linear-gradient(45deg, #ff416c 0%, #ff4b2b 100%)',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  boxShadow: success ? 6 : 3,
                  '&:hover': {
                    background: success 
                      ? 'linear-gradient(45deg, #00917a 0%, #7ba82d 100%)'
                      : 'linear-gradient(45deg, #e03560 0%, #e63a1f 100%)',
                    boxShadow: 8,
                    transform: success ? 'none' : 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover::after': {
                    left: '100%',
                  }
                }}
              >
                {loading ? 'Signing In...' : success ? 'Login Successful!' : 'Sign In'}
              </Button>
            </Box>

            {/* Alternative Home Navigation - Bottom of form */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="text"
                startIcon={<HomeIcon />}
                onClick={handleHomeClick}
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Return to Homepage
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Inventory Management System v1.0
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Developed by Patrick Nyerere
              </Typography>
            </Box>
          </Paper>
        </Zoom>

        {/* Success Snackbar */}
        <Snackbar
          open={success}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="success" 
            variant="filled"
            sx={{
              background: 'linear-gradient(45deg, #00b09b 0%, #96c93d 100%)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon />
              Login successful! Redirecting to dashboard...
            </Box>
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}