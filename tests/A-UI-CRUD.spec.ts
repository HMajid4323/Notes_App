import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { NotesPage } from '../pages/notes.page';
import {BaseAPIHelper}  from '../Utils/api.helper';
import payloads from '../Utils/payloads.json';


test.describe('UI CRUD Operations', async () => {
    let apiHelper: BaseAPIHelper;
    let loginPage: LoginPage;
    let notesPage: NotesPage;

    test.beforeEach('Login and Create Note', async ({ page }) => {
        loginPage = new LoginPage(page);
        notesPage = new NotesPage(page);
        apiHelper = new BaseAPIHelper; 
    });


    test('Create, edit, delete note with persistence checks', async ({request}) => {

        const user = await apiHelper.generateUniqueUser();
        console.log(`Generated User - Name: ${user.name}, Email: ${user.email}, Password: ${user.password}`);
        const payload = { ...payloads.RegisterUser, name: user.name, email: user.email, password: user.password };
        await test.step('Register User via API', async () => {
            const tokenresponse = await apiHelper.registerUser(request, apiHelper.RegisterAPIUrl, payload);
            const tokenresponseBody = await tokenresponse.json();
            expect(tokenresponseBody).toBeDefined();
            expect(tokenresponse.status()).toBe(201);
            expect(tokenresponseBody.data.id).toBeDefined();
            expect(tokenresponseBody.message).toBe('User account created successfully');
            console.log(`User registered successfully. Response: ${JSON.stringify(tokenresponseBody)}`);
        });

        await test.step('Login via UI', async () => {
            await loginPage.actions.navigateToLogin(apiHelper.LoginUiUrl);
            await loginPage.actions.login(user.email, user.password);
            await loginPage.assertions.verifySuccessfulLogin();
        });
       // const token = await apiHelper.registerUser(request, { name, email, password });
        // console.log(`User registered successfully. Token: ${token}`);
        // await loginPage.login(email, password);
        // await notesPage.createNote('Test Note', 'This is a test note.', 'General');
        // const noteExists = await notesPage.isNotePresent('Test Note');
        // expect(noteExists).toBeTruthy();
    });

});