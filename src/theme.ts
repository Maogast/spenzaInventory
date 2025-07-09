// src/theme.ts
import { createTheme } from '@mui/material/styles'

// Module augmentation so TS knows about MuiDataGrid in theme.components
declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      defaultProps?: Record<string, any>
      styleOverrides?: Record<string, any>
    }
  }
}

const theme = createTheme({
  palette: {
    primary:   { main: '#1976d2' },
    secondary: { main: '#f50057' },
  },
  components: {
    MuiDataGrid: {
      // No localeText override: uses built-in English defaults
      defaultProps: {},

      styleOverrides: {
        root: {
          border: '1px solid #ccc',
        },
        columnHeaders: {
          backgroundColor: '#e0e0e0',
          color: '#333',
          fontSize: '1rem',
        },
        row: {
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
        },
        cell: {
          '&.MuiDataGrid-cell--textRight': {
            justifyContent: 'flex-end',
          },
        },
        footerContainer: {
          backgroundColor: '#fafafa',
        },
      },
    },
  },
})

export default theme