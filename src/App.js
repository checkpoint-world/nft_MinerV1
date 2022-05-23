import { Container, Grid, Box } from '@mui/material';
import { AppRouter } from './router';

function App() {
  return (
    <Container>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <AppRouter />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App;
