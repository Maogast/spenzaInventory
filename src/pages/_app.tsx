// pages/_app.tsx
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ThemeProvider, CssBaseline, Container } from '@mui/material'
import theme from '../theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Spenza Inventory</title>
        {/* ensure proper mobile scaling */}
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />

        <QueryClientProvider client={queryClient}>
          <Container
            maxWidth="lg"
            sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}
          >
            <Component {...pageProps} />
          </Container>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  )
}