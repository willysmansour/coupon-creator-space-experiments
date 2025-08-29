import { render, screen } from '@testing-library/react';
import { ModernMetricCard } from '../ModernMetricCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

describe('ModernMetricCard', () => {
  const defaultProps = {
    title: 'Total Sales',
    value: '$10,000',
    icon: TrendingUp,
  };

  it('renders basic card information correctly', () => {
    render(<ModernMetricCard {...defaultProps} />);
    
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
  });

  it('displays change information when provided', () => {
    render(
      <ModernMetricCard 
        {...defaultProps} 
        change="5.2% increase from last month" 
      />
    );
    
    expect(screen.getByText('5.2% increase from last month')).toBeInTheDocument();
  });

  it('shows positive change correctly', () => {
    render(
      <ModernMetricCard 
        {...defaultProps} 
        change="5.2% increase" 
        trend="up"
      />
    );
    
    // Should have positive styling (text-success)
    const changeElement = screen.getByText('5.2% increase');
    expect(changeElement).toHaveClass('text-success');
  });

  it('shows negative change correctly', () => {
    render(
      <ModernMetricCard 
        {...defaultProps} 
        change="3.1% decrease" 
        trend="down"
      />
    );
    
    // Should have negative styling (text-destructive)
    const changeElement = screen.getByText('3.1% decrease');
    expect(changeElement).toHaveClass('text-destructive');
  });

  it('handles change without trend', () => {
    render(
      <ModernMetricCard 
        {...defaultProps} 
        change="no change"
      />
    );
    
    // Should use default trend (up) styling
    const changeElement = screen.getByText('no change');
    expect(changeElement).toHaveClass('text-success');
  });

  it('renders different icons correctly', () => {
    const { rerender } = render(<ModernMetricCard {...defaultProps} icon={TrendingUp} />);
    
    // Check that icon is rendered (TrendingUp should be present)
    expect(document.querySelector('svg')).toBeInTheDocument();
    
    // Rerender with different icon
    rerender(<ModernMetricCard {...defaultProps} icon={TrendingDown} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('applies hover effects correctly', () => {
    render(<ModernMetricCard {...defaultProps} />);
    
    const card = screen.getByText('Total Sales').closest('[class*="hover:shadow-md"]');
    expect(card).toHaveClass('transition-all', 'duration-200', 'hover:shadow-md');
  });

  it('works without change information', () => {
    render(<ModernMetricCard {...defaultProps} />);
    
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    // Should not show any change information
    expect(screen.queryByText(/increase|decrease/)).not.toBeInTheDocument();
  });

  it('handles very long titles gracefully', () => {
    render(
      <ModernMetricCard 
        {...defaultProps} 
        title="This is a very long title that might wrap to multiple lines in the card" 
      />
    );
    
    expect(screen.getByText(/This is a very long title/)).toBeInTheDocument();
  });

  it('handles very large numbers in value', () => {
    render(
      <ModernMetricCard 
        {...defaultProps} 
        value="$1,234,567,890" 
      />
    );
    
    expect(screen.getByText('$1,234,567,890')).toBeInTheDocument();
  });
});
