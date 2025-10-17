// src/theme.ts
import '@mui/x-data-grid/themeAugmentation'
import { createTheme, ThemeOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    success: Palette['primary']
    warning: Palette['primary']
    info: Palette['primary']
    gradient: {
      primary: string
      secondary: string
      success: string
      warning: string
      error: string
    }
  }
  interface PaletteOptions {
    success?: PaletteOptions['primary']
    warning?: PaletteOptions['primary']
    info?: PaletteOptions['primary']
    gradient?: {
      primary: string
      secondary: string
      success: string
      warning: string
      error: string
    }
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gradient: true
  }
}

const themeOptions: ThemeOptions = {
  palette: {
    primary: { 
      main: '#2c3e50',
      light: '#3498db',
      dark: '#1a252f',
      contrastText: '#ffffff'
    },
    secondary: { 
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
      contrastText: '#ffffff'
    },
    success: {
      main: '#27ae60',
      light: '#58d68d',
      dark: '#229954',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#f39c12',
      light: '#f7dc6f',
      dark: '#d68910',
      contrastText: '#ffffff'
    },
    error: {
      main: '#e74c3c',
      light: '#ec7063',
      dark: '#cb4335',
      contrastText: '#ffffff'
    },
    info: {
      main: '#17a2b8',
      light: '#48c9b0',
      dark: '#138496',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#566573'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      success: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
      warning: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)',
      error: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    button: {
      fontWeight: 600,
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 8
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: 8
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: 4
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          padding: '8px 16px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        },
        contained: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1a252f 0%, #2980b9 100%)'
          }
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
          }
        }
      },
      variants: [
        {
          props: { variant: 'gradient' },
          style: {
            background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #1a252f 0%, #2980b9 100%)'
            }
          }
        }
      ]
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#3498db'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2c3e50',
              borderWidth: 2
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        },
        standardSuccess: {
          backgroundColor: '#d5f4e6',
          color: '#166534'
        },
        standardError: {
          backgroundColor: '#fde8e8',
          color: '#991b1b'
        },
        standardWarning: {
          backgroundColor: '#fef3c7',
          color: '#92400e'
        },
        standardInfo: {
          backgroundColor: '#dbeafe',
          color: '#1e40af'
        }
      }
    },
    MuiDataGrid: {
      defaultProps: {
        disableColumnMenu: true,
        density: 'comfortable',
        autoHeight: false,
        pageSizeOptions: [10, 25, 50],
        initialState: {
          pagination: {
            paginationModel: { pageSize: 10 }
          }
        }
      },
      styleOverrides: {
        root: {
          border: '1px solid #e1e5e9',
          borderRadius: 12,
          overflow: 'hidden',
          fontFamily: '"Inter", "Roboto", sans-serif'
        },
        columnHeaders: {
          backgroundColor: '#2c3e50',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 600,
          borderBottom: '2px solid #3498db'
        },
        row: {
          '&:nth-of-type(even)': {
            backgroundColor: '#f8f9fa'
          },
          '&:hover': {
            backgroundColor: 'rgba(52, 152, 219, 0.08)'
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(52, 152, 219, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(52, 152, 219, 0.16)'
            }
          }
        },
        cell: {
          borderBottom: '1px solid #e1e5e9',
          '&.MuiDataGrid-cell--textRight': {
            justifyContent: 'flex-end'
          },
          '&:focus': {
            outline: 'none'
          },
          '&:focus-within': {
            outline: 'none'
          }
        },
        footerContainer: {
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e1e5e9'
        },
        columnHeader: {
          '&:focus': {
            outline: 'none'
          },
          '&:focus-within': {
            outline: 'none'
          }
        },
        sortIcon: {
          color: '#ffffff'
        },
        menuIcon: {
          color: '#ffffff'
        }
      }
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: '1px solid #e1e5e9'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6
        },
        filled: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#27ae60',
            color: 'white'
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: '#f39c12',
            color: 'white'
          },
          '&.MuiChip-colorError': {
            backgroundColor: '#e74c3c',
            color: 'white'
          }
        }
      }
    }
  }
}

export default createTheme(themeOptions)