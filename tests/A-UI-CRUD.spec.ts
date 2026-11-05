import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { NotesPage } from '../pages/notes.page';
import {BasePage} from '../pages/base.page';
import {BaseAPIHelper}  from '../Utils/api.helper';
import payloads from '../Utils/payloads.json';


test.describe('UI CRUD Operations', async () => {
    let apiHelper: BaseAPIHelper;
    let loginPage: LoginPage;
    let notesPage: NotesPage;
    let basePage: BasePage;

    test('Create, Edit and Delete notes with persistence checks', async ({page, request}) => {

        loginPage = new LoginPage(page);
        notesPage = new NotesPage(page);
        apiHelper = new BaseAPIHelper; 
        basePage = new BasePage(page);

        const user = await apiHelper.generateUniqueUser();
        const payload = { ...payloads.RegisterUser, name: user.name, email: user.email, password: user.password };

        await test.step('Register User via API', async () => {
            await apiHelper.registerUserViaAPI(request, apiHelper.RegisterAPIUrl, payload);
            console.log(`User registered successfully. Name: ${user.name}, Email: ${user.email}`);
        });

        await test.step('Login via UI', async () => {
            await basePage.actions.navigateToBasePage();
            await basePage.assertions.verifyBasePageElements();
            await basePage.actions.clickLoginButton();
            await loginPage.assertions.verifyLoginFields();
            await loginPage.actions.login(user.email, user.password);
            await loginPage.assertions.verifySuccessfulLogin();
        });

        await test.step('Create Note via UI', async () => {
            const noteTitle = 'Test Note';
            const noteTitle1 = 'Test Note 1';
            const noteDescription = 'This is a test note.';
            const noteDescription1 = 'This is another test note.';
            await notesPage.actions.clickAddNoteButton();
            await notesPage.assertions.verifyAddNotePopupElements();
            await notesPage.actions.createNote(noteTitle, noteDescription, 'Personal', false);
            await notesPage.assertions.verifyNoteCardVisibleInList(noteTitle, noteDescription);
            await notesPage.actions.clickAddNoteButton();
            await notesPage.assertions.verifyAddNotePopupElements();
            await notesPage.actions.createNote(noteTitle1, noteDescription1, 'Work', false);
            await notesPage.assertions.verifyNoteCardVisibleInList(noteTitle1, noteDescription1);
        });

        await test.step('Edit Note via UI', async () => {
            const noteTitle = 'Test Note';
            const updatedNoteTitle = 'Updated Test Note';
            const updatedNoteDescription = 'This is an updated test note.';
            await notesPage.actions.editNote(noteTitle, updatedNoteTitle, updatedNoteDescription, 'Personal', true);
            await notesPage.assertions.verifyNoteCardVisibleInList(updatedNoteTitle, updatedNoteDescription);
            await notesPage.actions.reload();
            await notesPage.assertions.verifyNoteCardVisibleInList(updatedNoteTitle, updatedNoteDescription);
        });

        await test.step('Delete Note via UI', async () => {
            const noteTitle = 'Updated Test Note';
            await notesPage.actions.clickDeleteNoteButton(noteTitle);
            await notesPage.assertions.verifyDeleteNoteDialogVisible();
            await notesPage.actions.deleteNote();
            await notesPage.assertions.verifyNoteDeleted(noteTitle);
            await notesPage.actions.reload();
            await notesPage.assertions.verifyNoteDeleted(noteTitle);
        });
        
    });

});