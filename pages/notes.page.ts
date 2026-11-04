import { Page, Locator, expect } from "@playwright/test";

class Locators {
    constructor(public page: Page) {}

    get usernameInput(): Locator {
        return this.page.locator('input[name="username"]');
    }
    
}

class Actions {
    constructor(public locators: Locators, public page: Page) {}

    async enterUsername(username: string): Promise<void> {
        await this.locators.usernameInput.fill(username);
    }
}

class Assertions {
    constructor(public locators: Locators) {} 

}

export class NotesPage {
  readonly actions: Actions;
  readonly assertions: Assertions;
  private readonly locators: Locators;

  constructor(page: Page) {
    this.locators = new Locators(page);
    this.actions = new Actions(this.locators, page);
    this.assertions = new Assertions(this.locators);
  }
}
