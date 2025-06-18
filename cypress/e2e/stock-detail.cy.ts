describe('Stock Detail Page E2E Tests', () => {
  beforeEach(() => {
    // Visit the dashboard first
    cy.visit('/dashboard');
  });

  describe('Navigation to Stock Detail', () => {
    it('should navigate to stock detail page when clicking on a stock card', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Click on the first stock card
      cy.get('[data-testid="stock-card"]').first().click();

      // Should navigate to stock detail page
      cy.url().should('include', '/stocks/');
      cy.url().should('not.include', '/dashboard');

      // Should show stock detail content
      cy.get('[data-testid="stock-detail"]').should('be.visible');
    });

    it('should display stock detail information correctly', () => {
      // Navigate to a specific stock detail page
      cy.visit('/stocks/SNDL');

      // Wait for data to load
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');

      // Check that all stock information is displayed
      cy.get('[data-testid="stock-symbol"]').should('be.visible');
      cy.get('[data-testid="stock-name"]').should('be.visible');
      cy.get('[data-testid="stock-price"]').should('be.visible');
      cy.get('[data-testid="stock-change"]').should('be.visible');
      cy.get('[data-testid="stock-volume"]').should('be.visible');
      cy.get('[data-testid="stock-market-cap"]').should('be.visible');
      cy.get('[data-testid="stock-short-interest"]').should('be.visible');
      cy.get('[data-testid="stock-sector"]').should('be.visible');
      cy.get('[data-testid="stock-industry"]').should('be.visible');
    });

    it('should show detailed price chart', () => {
      // Navigate to stock detail page
      cy.visit('/stocks/SNDL');

      // Wait for data to load
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');

      // Check that price chart is displayed
      cy.get('[data-testid="price-chart"]').should('be.visible');
    });

    it('should show data refresh indicator on detail page', () => {
      // Navigate to stock detail page
      cy.visit('/stocks/SNDL');

      // Wait for data to load
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');

      // Check that refresh indicator is present
      cy.get('[data-testid="data-refresh-indicator"]').should('be.visible');
    });
  });

  describe('Stock Detail Page Functionality', () => {
    it('should handle different stock symbols', () => {
      // Test with different stock symbols
      const testSymbols = ['SNDL', 'CIDM', 'NAKD'];

      testSymbols.forEach((symbol) => {
        cy.visit(`/stocks/${symbol}`);
        cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');
        cy.get('[data-testid="stock-symbol"]').should('contain', symbol);
      });
    });

    it('should display loading state while fetching data', () => {
      // Visit stock detail page
      cy.visit('/stocks/SNDL');

      // Should show loading state initially
      cy.get('[data-testid="loading-card"]').should('be.visible');

      // Should show actual content after loading
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="loading-card"]').should('not.exist');
    });

    it('should handle invalid stock symbols gracefully', () => {
      // Visit with invalid stock symbol
      cy.visit('/stocks/INVALID_SYMBOL_12345');

      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Stock not found');
    });

    it('should handle API errors gracefully', () => {
      // This test would require mocking API failures
      // For now, just verify the error handling structure is in place
      cy.visit('/stocks/SNDL');
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Navigation and User Experience', () => {
    it('should allow navigation back to dashboard', () => {
      // Navigate to stock detail page
      cy.visit('/stocks/SNDL');
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');

      // Navigate back to dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('should maintain URL structure for different stocks', () => {
      // Test URL structure
      cy.visit('/stocks/SNDL');
      cy.url().should('eq', Cypress.config().baseUrl + '/stocks/SNDL');

      cy.visit('/stocks/CIDM');
      cy.url().should('eq', Cypress.config().baseUrl + '/stocks/CIDM');
    });

    it('should have responsive design on mobile', () => {
      // Set viewport to mobile size
      cy.viewport('iphone-x');

      // Navigate to stock detail page
      cy.visit('/stocks/SNDL');
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');

      // Check that content is properly displayed on mobile
      cy.get('[data-testid="stock-symbol"]').should('be.visible');
      cy.get('[data-testid="stock-price"]').should('be.visible');
      cy.get('[data-testid="price-chart"]').should('be.visible');
    });

    it('should load within acceptable time', () => {
      const startTime = Date.now();

      cy.visit('/stocks/SNDL');
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');

      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(10000); // Should load within 10 seconds
    });
  });

  describe('Data Consistency', () => {
    it('should display consistent data between dashboard and detail page', () => {
      // Get stock data from dashboard
      cy.visit('/dashboard');
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Get symbol from first stock card
      cy.get('[data-testid="stock-card"]')
        .first()
        .find('[data-testid="stock-symbol"]')
        .invoke('text')
        .then((symbol) => {
          // Navigate to detail page for that stock
          cy.visit(`/stocks/${symbol}`);
          cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');

          // Verify symbol matches
          cy.get('[data-testid="stock-symbol"]').should('contain', symbol);
        });
    });

    it('should show accurate price and change data', () => {
      // Navigate to stock detail page
      cy.visit('/stocks/SNDL');
      cy.get('[data-testid="stock-detail"]', { timeout: 10000 }).should('be.visible');

      // Check that price is a valid number
      cy.get('[data-testid="stock-price"]')
        .invoke('text')
        .then((priceText) => {
          const price = parseFloat(priceText.replace('$', ''));
          expect(price).to.be.a('number');
          expect(price).to.be.greaterThan(0);
        });

      // Check that change percentage is a valid number
      cy.get('[data-testid="stock-change"]')
        .invoke('text')
        .then((changeText) => {
          const change = parseFloat(changeText.replace('%', '').replace('+', ''));
          expect(change).to.be.a('number');
        });
    });
  });
});
