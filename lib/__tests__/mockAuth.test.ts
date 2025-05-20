import { login, logout, getAgentName, isLoggedIn, AGENT_KEY } from '../mockAuthUtils';

describe('mockAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in and stores the agent name', () => {
    login('Agent Smith', 1);
    expect(localStorage.getItem(AGENT_KEY)).toBe('Agent Smith');
    expect(getAgentName()).toBe('Agent Smith');
    expect(isLoggedIn()).toBe(true);
  });

  it('logs out and clears the agent name', () => {
    login('Agent Smith', 1);
    logout();
    expect(localStorage.getItem(AGENT_KEY)).toBeNull();
    expect(getAgentName()).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });
}); 