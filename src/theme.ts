// src/theme.ts
import '@mui/x-data-grid/themeAugmentation'
import { createTheme, ThemeOptions } from '@mui/material/styles'

const themeOptions: ThemeOptions = {
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' }
  },
  components: {
    MuiDataGrid: {
      defaultProps: {
        disableColumnMenu: true,
        density: 'standard'
      },
      styleOverrides: {
        root: {
          border: '1px solid #ccc'
        },
        columnHeaders: {
          backgroundColor: '#e0e0e0',
          color: '#333',
          fontSize: '1rem'
        },
        row: {
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)'
          }
        },
        cell: {
          '&.MuiDataGrid-cell--textRight': {
            justifyContent: 'flex-end'
          }
        },
        footerContainer: {
          backgroundColor: '#fafafa'
        }
      }
    }
  }
}

export default createTheme(themeOptions)