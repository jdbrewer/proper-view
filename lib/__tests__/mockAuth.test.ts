// Mock document.cookie to behave like a real browser
let cookieStore: string[] = [];

Object.defineProperty(document, "cookie", {
  get() {
    return cookieStore.join("; ");
  },
  set(value: string) {
    const [cookiePair] = value.split(";");
    const [name, val] = cookiePair.split("=");

    // Remove existing cookie with same name
    cookieStore = cookieStore.filter(
      (cookie) => !cookie.startsWith(`${name}=`)
    );

    // Add new cookie if it has a value (not being deleted)
    if (val && !value.includes("expires=Thu, 01 Jan 1970")) {
      cookieStore.push(cookiePair);
    }
  },
  configurable: true,
});

import {
  login,
  logout,
  getAgentName,
  getAgentId,
  isLoggedIn,
} from "../mockAuthUtils";

describe("mockAuth", () => {
  beforeEach(() => {
    // Clear cookies
    cookieStore = [];
  });

  it("logs in and stores the agent data", () => {
    login("Agent Smith", 1);

    expect(getAgentName()).toBe("Agent Smith");
    expect(getAgentId()).toBe(1);
    expect(isLoggedIn()).toBe(true);
  });

  it("logs out and clears the agent data", () => {
    login("Agent Smith", 1);

    // Verify login worked
    expect(getAgentName()).toBe("Agent Smith");
    expect(getAgentId()).toBe(1);
    expect(isLoggedIn()).toBe(true);

    logout();

    expect(getAgentName()).toBeNull();
    expect(getAgentId()).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });
});
