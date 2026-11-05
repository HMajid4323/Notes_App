import { Page, Locator, expect } from "@playwright/test";
import {NotesPage} from './notes.page'

class Locators {
    constructor(public page: Page) {}


    get usernameInput(): Locator {
        return this.page.getByTestId('login-email');
    }

    get passwordInput(): Locator {
        return this.page.getByTestId('login-password');
    }

    get submitButton(): Locator {
        return this.page.getByTestId('login-submit');
    }
    
}

class Actions {
    constructor(public locators: Locators, public page: Page) {}

    async navigateToLogin(URL: string) {
        await this.page.goto(URL);
    }

    async enterUsername(username: string) {
        await this.locators.usernameInput.fill(username);
    }

    async enterPassword(password: string) {
        await this.locators.passwordInput.fill(password);
    }

    async clickSubmit() {
        await this.locators.submitButton.click();
    }

    async login(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickSubmit();
    }
}

class Assertions {
    constructor(public locators: Locators, private notesPage: NotesPage) {} 

    async verifyLoginFields() {
        await expect(this.locators.usernameInput).toBeVisible();
        await expect(this.locators.passwordInput).toBeVisible();
        await expect(this.locators.submitButton).toBeVisible();
    }

    async verifySuccessfulLogin() {
        await this.notesPage.assertions.verifyNotesPageElements();
    }

}

export class LoginPage {
  readonly actions: Actions;
  readonly assertions: Assertions;
  private readonly locators: Locators;
  private readonly notesPage: NotesPage;

  constructor(page: Page) {
    this.locators = new Locators(page);
    this.notesPage = new NotesPage(page);
    this.actions = new Actions(this.locators, page);
    this.assertions = new Assertions(this.locators, this.notesPage);
  }
}