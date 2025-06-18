import React from 'react';
import { jest, expect, describe, it, beforeEach, afterEach } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { DataRefreshIndicator } from './DataRefreshIndicator';

describe('DataRefreshIndicator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows "just now" for very recent updates', () => {
    const now = Date.now();
    render(<DataRefreshIndicator lastUpdated={now} />);
    expect(screen.getByText(/Last updated 0s ago/)).toBeInTheDocument();
  });

  it('shows minutes for updates less than an hour old', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    render(<DataRefreshIndicator lastUpdated={fiveMinutesAgo} />);
    expect(screen.getByText(/Last updated 5m ago/)).toBeInTheDocument();
  });

  it('shows hours for updates less than a day old', () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    render(<DataRefreshIndicator lastUpdated={twoHoursAgo} />);
    expect(screen.getByText(/Last updated 2h ago/)).toBeInTheDocument();
  });

  it('shows days for updates older than a day', () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    render(<DataRefreshIndicator lastUpdated={twoDaysAgo} />);
    expect(screen.getByText(/Last updated 2d ago/)).toBeInTheDocument();
  });

  it('updates the time display every second', () => {
    const now = Date.now();
    render(<DataRefreshIndicator lastUpdated={now} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Last updated 1s ago/)).toBeInTheDocument();
  });

  it('shows refresh needed when data is older than refresh interval', () => {
    const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
    render(<DataRefreshIndicator lastUpdated={sixMinutesAgo} refreshInterval={300000} />);
    expect(screen.getByText(/Refresh needed/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const now = Date.now();
    render(<DataRefreshIndicator lastUpdated={now} className="custom-class" />);
    const container = screen.getByText(/Last updated/).parentElement;
    expect(container).toHaveClass('custom-class');
  });
});
