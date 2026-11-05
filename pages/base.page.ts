import { Page, Locator, expect } from "@playwright/test";
import {UI_BASE} from '../Utils/global.var';

class Locators {
    constructor(public page: Page) {}

    get loginButton(): Locator {
        return this.page.getByRole('link', { name: 'Login' });
    }

    get createAccountButton(): Locator {
        return this.page.getByRole('link', { name: 'Create an account' });
    }

    get welcomeMessage(): Locator {
        return this.page.locator('h1', { hasText: 'Welcome to Notes App' });
    }

}

class Actions {
    constructor(public locators: Locators, public page: Page) {}

    async clickLoginButton() {
        await this.locators.loginButton.click();
    }

    async clickCreateAccountButton() {
        await this.locators.createAccountButton.click();
    }
    
    async navigateToBasePage() {
        await this.page.goto(UI_BASE);
    }
}

class Assertions {
    constructor(public locators: Locators) {} 

    
    async verifyBasePageElements() {
        await expect(this.locators.welcomeMessage).toBeVisible();
        await expect(this.locators.loginButton).toBeVisible();
        await expect(this.locators.createAccountButton).toBeVisible();
    }


}

export class BasePage {
  readonly actions: Actions;
  readonly assertions: Assertions;
  private readonly locators: Locators;

  constructor(page: Page) {
    this.locators = new Locators(page);
    this.actions = new Actions(this.locators, page);
    this.assertions = new Assertions(this.locators);
  }
}