import { Page, Locator, expect } from "@playwright/test";

class Locators {
    constructor(public page: Page) {}

    get myNotesHeader(): Locator {
        return this.page.getByTestId('home');
    }

    get profileButton(): Locator {
        return this.page.getByTestId('profile');
    }

    get logoutButton(): Locator {
        return this.page.getByTestId('logout');
    }

    get allCategoryButton(): Locator {
        return this.page.getByTestId('category-all');
    }

    get homeCategoryButton(): Locator {
        return this.page.getByTestId('category-home');
    }

    get workCategoryButton(): Locator {
        return this.page.getByTestId('category-work');
    }

    get personalCategoryButton(): Locator {
        return this.page.getByTestId('category-personal');
    }

    get addNoteButton(): Locator {
        return this.page.getByTestId('add-new-note');
    }


    get categoryDropdown(): Locator {
        return this.page.getByTestId('note-category');
    }

    get completedCheckbox(): Locator {
        return this.page.getByTestId('note-completed');
    }
   
    get noteTitleInput(): Locator {
        return this.page.getByTestId('note-title');
    }

    get noteDescriptionInput(): Locator {
        return this.page.getByTestId('note-description');
    }

    get noteCreateButton(): Locator {
        return this.page.getByTestId('note-submit');
    }

    get noteCancelButton(): Locator {
        return this.page.getByTestId('note-cancel');
    }

    get searchInput(): Locator {
        return this.page.getByTestId('search-input');
    }

    get searchButton(): Locator {
        return this.page.getByTestId('search-btn');
    }

    get noteCard(): Locator {
        return this.page.getByTestId('note-card');
    }

    get noteCardTitle(): Locator {
        return this.page.getByTestId('note-card-title');
    }

    get noteCardDescription(): Locator {
        return this.page.getByTestId('note-card-description');
    }

    get noteCardTimeStamp(): Locator {
        return this.page.getByTestId('note-card-updated-at');
    }

    get noteCardEditButton(): Locator {
        return this.page.getByTestId('note-edit');
    }

    get editNoteSaveButton(): Locator {
        return this.page.getByTestId('note-submit');
    }

    get deleteDialogConfirmButton(): Locator {
        return this.page.getByTestId('note-delete-confirm');
    }

    get cancelDialogConfirmButton(): Locator {
        return this.page.getByTestId('note-delete-cancel-2');
    }

    get deleteNoteDialog(): Locator {
        return this.page.getByTestId('note-delete-dialog');
    }
}

class Actions {
    constructor(public locators: Locators, public page: Page) {}

    async clickAddNoteButton() {
        await this.locators.addNoteButton.click();
    }

    async selectNoteCategory(category: string) {
        await this.locators.categoryDropdown.selectOption(category);
    }

    async checkCompleted() {
        await this.locators.completedCheckbox.check();
    }

    async setCompleted(completed: boolean) {
        const isCompleted = await this.locators.completedCheckbox.isChecked();
        if (isCompleted !== completed) {
            if (completed) {
                await this.locators.completedCheckbox.check();
            } else {
                await this.locators.completedCheckbox.uncheck();
            }
        }
    }

    async addNoteTitle(title: string) {
        await this.locators.noteTitleInput.fill(title);
    }

    async addNoteDescription(description: string) {
        await this.locators.noteDescriptionInput.fill(description);
    }

    async clickNoteCreateButton() {
        await this.locators.noteCreateButton.click();
    }

    async createNote(title: string, description: string, category: string, completed: boolean) {
        await this.selectNoteCategory(category);
        if (completed) {
            await this.checkCompleted();
        }
        await this.addNoteTitle(title);
        await this.addNoteDescription(description);
        await this.clickNoteCreateButton();
    }

    async editNote(oldTitle: string, newTitle: string, newDescription: string, newCategory: string, completed: boolean) {
        const noteCard = this.locators.noteCard.filter({
            has: this.locators.noteCardTitle.getByText(oldTitle, { exact: true }),
        });
        await noteCard.getByTestId('note-edit').click();
        await this.selectNoteCategory(newCategory);
        await this.addNoteTitle(newTitle);
        await this.addNoteDescription(newDescription); 
        await this.setCompleted(completed);
        await this.locators.editNoteSaveButton.click();
    }

    async clickDeleteNoteButton(title: string) {
        const noteCard = this.locators.noteCard.filter({
            has: this.locators.noteCardTitle.getByText(title, { exact: true }),
        });
        await noteCard.getByTestId('note-delete').click();
    }

    async deleteNote() {
        await this.locators.deleteDialogConfirmButton.click();
    }

    async reload() {
        await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    }
}

class Assertions {
    constructor(public locators: Locators) {} 

    async verifyDeleteNoteDialogVisible() {
        await expect(this.locators.deleteNoteDialog).toBeVisible();
        await expect(this.locators.cancelDialogConfirmButton).toBeVisible();
        await expect(this.locators.deleteDialogConfirmButton).toBeVisible();
    }

    async verifyNotesPageElements() {
        await expect(this.locators.myNotesHeader).toBeVisible();
        await expect(this.locators.addNoteButton).toBeVisible();
        await expect(this.locators.profileButton).toBeVisible();
        await expect(this.locators.logoutButton).toBeVisible();
        await expect(this.locators.searchInput).toBeVisible();
        await expect(this.locators.searchButton).toBeVisible();
        await expect(this.locators.allCategoryButton).toBeVisible();
        await expect(this.locators.homeCategoryButton).toBeVisible();
        await expect(this.locators.workCategoryButton).toBeVisible();
        await expect(this.locators.personalCategoryButton).toBeVisible();
    }

    async verifyAddNotePopupElements() {
        await expect(this.locators.categoryDropdown).toBeVisible();
        await expect(this.locators.completedCheckbox).toBeVisible();
        await expect(this.locators.noteTitleInput).toBeVisible();
        await expect(this.locators.noteDescriptionInput).toBeVisible();
        await expect(this.locators.noteCreateButton).toBeVisible();
        await expect(this.locators.noteCancelButton).toBeVisible();
    }

    async verifyNoteCardVisibleInList(title: string, description: string) {
        const noteCard = this.locators.noteCard.filter({has: this.locators.noteCardTitle.getByText(title, { exact: true }),
        });
        const noteCardTitle = noteCard.getByTestId('note-card-title');
        const noteCardDescription = noteCard.getByTestId('note-card-description');
        const noteCardTimeStamp = noteCard.getByTestId('note-card-updated-at');
        await expect(noteCard).toBeVisible();
        await expect(noteCardTitle).toHaveText(title);
        await expect(noteCardDescription).toContainText(description);
        await expect(noteCardTimeStamp).toBeVisible();
    }

    async verifyNoteDeleted(title: string) {
        const noteCard = this.locators.noteCard.filter({
            has: this.locators.noteCardTitle.getByText(title, { exact: true }),
        });
        await expect(noteCard).toHaveCount(0);
    }
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