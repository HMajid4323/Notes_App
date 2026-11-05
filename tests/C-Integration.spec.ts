import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { NotesPage } from '../pages/notes.page';
import {BasePage} from '../pages/base.page';
import {BaseAPIHelper}  from '../Utils/api.helper';
import payloads from '../Utils/payloads.json';


test.describe('Cross-Layer Persistence', async () => {
    let apiHelper: BaseAPIHelper;
    let loginPage: LoginPage;
    let notesPage: NotesPage;
    let basePage: BasePage;


    test('API-created note appears in UI, UI edit reflected in API', async ({page, request}) => {
        apiHelper = new BaseAPIHelper;
        const user = await apiHelper.generateUniqueUser();
        let token: string;
        let noteId: string;
        let userId: string;
        const noteTitle = 'Test Note';
        const noteDescription = 'Created Via API';
        const updatedNoteTitle = 'Test Note - Updated';
        const updatedNoteDescription = 'Updated Via UI';

        await test.step('User Register and Login Via API', async () => {
            
            const payloadR = { ...payloads.RegisterUser, name: user.name, email: user.email, password: user.password };
            userId = await apiHelper.registerUserViaAPI(request, apiHelper.RegisterAPIUrl, payloadR);

            const payloadL = { ...payloads.LoginUser, email: user.email, password: user.password }
            const loginResponse = await apiHelper.loginViaApi(request, apiHelper.LoginAPIUrl, payloadL);
            const loginBody = await loginResponse.json();
            token = loginBody.data.token;
        })

        await test.step('Create Note Via API', async () => {
            
            const payload = { ...payloads.CreateNote, title: noteTitle, description: noteDescription, category: 'Personal', completed: false };
            const createNoteResponse = await apiHelper.createNoteViaApi(request, apiHelper.NotesAPIUrl, token, payload);
            const createNoteBody = await createNoteResponse.json();
            noteId = createNoteBody.data.id;
        });

        await test.step('Login as same user in UI and verify note', async () => {
            loginPage = new LoginPage(page);
            notesPage = new NotesPage(page);
            basePage = new BasePage(page);
            await basePage.actions.navigateToBasePage();
            await basePage.actions.clickLoginButton();

            await loginPage.actions.login(user.email, user.password);
            await notesPage.assertions.verifyNoteCardVisibleInList(noteTitle, noteDescription);
        });

        await test.step('Edit Note via UI', async () => {
            await notesPage.actions.editNote(noteTitle, updatedNoteTitle, updatedNoteDescription, 'Home', true);
            await notesPage.assertions.verifyNoteCardVisibleInList(updatedNoteTitle, updatedNoteDescription);
        });

        await test.step('Verify UI edit via API', async () => {
            await expect.poll(async () => {
            const response = await apiHelper.listNotesViaApi(request, apiHelper.NotesAPIUrl, token);
            
            if (response.status() !== 200) {
                return null;
            }

            const body = await response.json();
            const updatedNote = body.data?.find((note: { id: string }) => note.id === noteId);

            return updatedNote ? { title: updatedNote.title, description: updatedNote.description } : null;
            }, {
                message: 'The UI-edited note should eventually be reflected by the API',
                timeout: 10_000,
                intervals: [250, 500, 1000],
            }).toEqual({
                title: updatedNoteTitle,
                description: updatedNoteDescription,
            });
            console.log('Consistency observed between UI and API');
        });
    });
});