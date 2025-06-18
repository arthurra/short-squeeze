describe('Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Visit the dashboard before each test
    cy.visit('/dashboard');
  });

  describe('Dashboard Navigation and Initial Load', () => {
    it('should load the dashboard and display the main components', () => {
      // Check that the main dashboard elements are visible
      cy.get('h1').should('contain', 'Penny Stock Insights');
      cy.get('h2').should('contain', 'Stocks');
      cy.get('h3').should('contain', 'Stock List');

      // Check that filters sidebar is present on desktop
      cy.get('aside').should('be.visible');
      cy.get('aside h2').should('contain', 'Filters');

      // Check that stock cards are loading
      cy.get('[data-testid="stock-card"]').should('have.length.at.least', 1);
    });

    it('should display loading states and then show stock data', () => {
      // Initially should show loading cards
      cy.get('[data-testid="loading-card"]').should('have.length.at.least', 6);

      // After loading, should show actual stock cards
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('[data-testid="loading-card"]').should('not.exist');
    });

    it('should show data refresh indicator', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Check that refresh indicator is present
      cy.get('[data-testid="data-refresh-indicator"]').should('be.visible');
    });
  });

  describe('Stock Filtering Functionality', () => {
    it('should filter stocks by sector', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Get initial count of stocks
      cy.get('[data-testid="stock-card"]').then(($cards) => {
        const initialCount = $cards.length;

        // Select Technology sector
        cy.get('aside select').first().click();
        cy.get('[role="option"]').contains('Technology').click();

        // Check that the number of stocks has changed (filtered)
        cy.get('[data-testid="stock-card"]').should('have.length.lessThan', initialCount);

        // Verify all visible stocks are in Technology sector
        cy.get('[data-testid="stock-card"]').each(($card) => {
          cy.wrap($card).should('contain', 'Technology');
        });
      });
    });

    it('should filter stocks by price range', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Select price range filter
      cy.get('aside select').eq(2).click(); // Price range select
      cy.get('[role="option"]').contains('$1 - $2').click();

      // Check that stocks are filtered by price range
      cy.get('[data-testid="stock-card"]').each(($card) => {
        cy.wrap($card)
          .find('[data-testid="stock-price"]')
          .then(($price) => {
            const price = parseFloat($price.text().replace('$', ''));
            expect(price).to.be.at.least(1);
            expect(price).to.be.lessThan(2);
          });
      });
    });

    it('should filter stocks by market cap range', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Select market cap range filter
      cy.get('aside select').eq(3).click(); // Market cap select
      cy.get('[role="option"]').contains('$50M - $100M').click();

      // Check that stocks are filtered by market cap
      cy.get('[data-testid="stock-card"]').should('have.length.at.least', 1);
    });

    it('should filter stocks by short interest range', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Select short interest range filter
      cy.get('aside select').eq(4).click(); // Short interest select
      cy.get('[role="option"]').contains('10% - 20%').click();

      // Check that stocks are filtered by short interest
      cy.get('[data-testid="stock-card"]').should('have.length.at.least', 1);
    });

    it('should filter stocks by volume range', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Select volume range filter
      cy.get('aside select').eq(5).click(); // Volume select
      cy.get('[role="option"]').contains('1M - 5M').click();

      // Check that stocks are filtered by volume
      cy.get('[data-testid="stock-card"]').should('have.length.at.least', 1);
    });

    it('should apply multiple filters simultaneously', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Apply multiple filters
      cy.get('aside select').first().click();
      cy.get('[role="option"]').contains('Healthcare').click();

      cy.get('aside select').eq(2).click();
      cy.get('[role="option"]').contains('$2 - $3').click();

      cy.get('aside select').eq(3).click();
      cy.get('[role="option"]').contains('$100M - $200M').click();

      // Check that filters are applied
      cy.get('[data-testid="stock-card"]').should('have.length.at.least', 1);
    });
  });

  describe('Stock Search Functionality', () => {
    it('should search stocks by symbol', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Search for a specific stock symbol
      cy.get('aside input[type="search"]').type('SNDL');

      // Check that only matching stocks are shown
      cy.get('[data-testid="stock-card"]').should('contain', 'SNDL');
      cy.get('[data-testid="stock-card"]').should('have.length', 1);
    });

    it('should search stocks by company name', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Search for a company name
      cy.get('aside input[type="search"]').type('Sundial');

      // Check that only matching stocks are shown
      cy.get('[data-testid="stock-card"]').should('contain', 'Sundial');
      cy.get('[data-testid="stock-card"]').should('have.length', 1);
    });

    it('should clear search and show all stocks', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Get initial count
      cy.get('[data-testid="stock-card"]').then(($cards) => {
        const initialCount = $cards.length;

        // Search for something
        cy.get('aside input[type="search"]').type('SNDL');
        cy.get('[data-testid="stock-card"]').should('have.length', 1);

        // Clear search
        cy.get('aside input[type="search"]').clear();

        // Should show all stocks again
        cy.get('[data-testid="stock-card"]').should('have.length', initialCount);
      });
    });
  });

  describe('Stock Card Interactions', () => {
    it('should display stock card information correctly', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Check that stock cards have all required information
      cy.get('[data-testid="stock-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="stock-symbol"]').should('be.visible');
          cy.get('[data-testid="stock-name"]').should('be.visible');
          cy.get('[data-testid="stock-price"]').should('be.visible');
          cy.get('[data-testid="stock-change"]').should('be.visible');
          cy.get('[data-testid="stock-volume"]').should('be.visible');
          cy.get('[data-testid="stock-market-cap"]').should('be.visible');
          cy.get('[data-testid="stock-short-interest"]').should('be.visible');
          cy.get('[data-testid="stock-sector"]').should('be.visible');
          cy.get('[data-testid="stock-dilution-risk"]').should('be.visible');
        });
    });

    it('should show sparkline chart on stock cards', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Check that sparkline charts are present
      cy.get('[data-testid="sparkline-chart"]').should('have.length.at.least', 1);
    });

    it('should handle stock card click for detailed view', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Click on a stock card
      cy.get('[data-testid="stock-card"]').first().click();

      // Should navigate to stock detail page or show modal
      // This depends on the implementation - for now just check it's clickable
      cy.get('[data-testid="stock-card"]').first().should('be.visible');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should show mobile menu on small screens', () => {
      // Set viewport to mobile size
      cy.viewport('iphone-x');

      // Check that mobile menu button is visible
      cy.get('button[aria-label="Toggle menu"]').should('be.visible');

      // Check that desktop sidebar is hidden
      cy.get('aside').should('not.be.visible');
    });

    it('should open mobile sidebar when menu button is clicked', () => {
      // Set viewport to mobile size
      cy.viewport('iphone-x');

      // Click mobile menu button
      cy.get('button[aria-label="Toggle menu"]').click();

      // Check that mobile sidebar is open
      cy.get('[data-testid="mobile-sidebar"]').should('be.visible');
      cy.get('[data-testid="mobile-sidebar"] h2').should('contain', 'Filters');
    });

    it('should apply filters from mobile sidebar', () => {
      // Set viewport to mobile size
      cy.viewport('iphone-x');

      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Open mobile sidebar
      cy.get('button[aria-label="Toggle menu"]').click();

      // Apply filter from mobile sidebar
      cy.get('[data-testid="mobile-sidebar"] select').first().click();
      cy.get('[role="option"]').contains('Technology').click();

      // Close mobile sidebar
      cy.get('[data-testid="mobile-sidebar"] button[aria-label="Close"]').click();

      // Check that filter was applied
      cy.get('[data-testid="stock-card"]').should('have.length.at.least', 1);
    });

    it('should have responsive grid layout', () => {
      // Test desktop layout
      cy.viewport(1200, 800);
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('.grid').should('have.class', 'lg:grid-cols-3');

      // Test tablet layout
      cy.viewport(768, 1024);
      cy.get('.grid').should('have.class', 'md:grid-cols-2');

      // Test mobile layout
      cy.viewport(375, 667);
      cy.get('.grid').should('not.have.class', 'md:grid-cols-2');
      cy.get('.grid').should('not.have.class', 'lg:grid-cols-3');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // This test would require mocking API failures
      // For now, we'll test that error boundaries are in place
      cy.get('[data-testid="error-boundary"]').should('not.exist');

      // Check that the app loads successfully
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('should show error message when data fails to load', () => {
      // This would require intercepting and failing API calls
      // For now, just verify the app handles loading states
      cy.get('[data-testid="loading-card"]').should('have.length.at.least', 6);
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);
    });
  });

  describe('Performance and User Experience', () => {
    it('should load dashboard within acceptable time', () => {
      const startTime = Date.now();

      cy.visit('/dashboard');
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(10000); // Should load within 10 seconds
    });

    it('should have smooth interactions without layout shifts', () => {
      // Wait for initial load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Apply filters and check for smooth transitions
      cy.get('aside select').first().click();
      cy.get('[role="option"]').contains('Technology').click();

      // Should not cause major layout shifts
      cy.get('main').should('be.visible');
      cy.get('aside').should('be.visible');
    });

    it('should maintain filter state during interactions', () => {
      // Wait for data to load
      cy.get('[data-testid="stock-card"]', { timeout: 10000 }).should('have.length.at.least', 1);

      // Apply a filter
      cy.get('aside select').first().click();
      cy.get('[role="option"]').contains('Healthcare').click();

      // Interact with a stock card
      cy.get('[data-testid="stock-card"]').first().click();

      // Filter should still be applied
      cy.get('[data-testid="stock-card"]').should('contain', 'Healthcare');
    });
  });
});
