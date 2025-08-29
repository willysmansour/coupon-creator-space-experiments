import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const NotFoundWithRouter = () => (
  <BrowserRouter>
    <NotFound />
  </BrowserRouter>
);

describe('NotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 404 message correctly', () => {
    render(<NotFoundWithRouter />);
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByText(/The page you are looking for/)).toBeInTheDocument();
  });

  it('has working navigation buttons', async () => {
    const user = userEvent.setup();
    render(<NotFoundWithRouter />);
    
    const homeLink = screen.getByRole('link', { name: /back to home/i });
    const backButton = screen.getByRole('button', { name: /go back/i });
    
    expect(homeLink).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
    
    expect(homeLink).toHaveAttribute('href', '/');
    
    await user.click(backButton);
    // Note: window.history.back() is called, not navigate(-1)
  });

  it('displays current URL in error message', () => {
    render(<NotFoundWithRouter />);
    
    expect(screen.getByText(/URL:/)).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument(); // Current pathname
  });

  it('has correct home link destination', () => {
    render(<NotFoundWithRouter />);
    
    const homeLink = screen.getByRole('link', { name: /back to home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
