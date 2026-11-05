import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { NotesPage } from '../pages/notes.page';
import { BasePage } from '../pages/base.page';
import { UI_BASE } from '../Utils/global.var';
import { BaseAPIHelper } from '../Utils/api.helper';
import payloads from '../Utils/payloads.json';
import mockData from '../Utils/mocks/mocksData.json';

const NOTES_LIST_PATTERN = '**/notes/api/notes';
const loginURL = UI_BASE + '/login';

test.describe('M1: Deterministic notes list', () => {
  test('UI renders synthetic notes from fulfilled route', async ({page, request}) => {
    const apiHelper = new BaseAPIHelper();
    let intercepted = false;
    
    const testUser = await apiHelper.generateUniqueUser();
    const payload = { ...payloads.RegisterUser, name: testUser.name, email: testUser.email, password: testUser.password };
    await apiHelper.registerUserViaAPI(request, apiHelper.RegisterAPIUrl, payload);
    
    await page.route(NOTES_LIST_PATTERN, async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      intercepted = true;
      // Using the imported mock fixture
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: mockData.SuccessNotesList, 
      });
    });

    const loginPage = new LoginPage(page);
    const notesPage = new NotesPage(page);
    
    // Ensuring we wait for the intercepted response
    const notesResponsePromise = page.waitForResponse(
      response => response.url().includes('/notes/api/notes') && response.request().method() === 'GET'
    );

    await loginPage.actions.navigateToLogin(loginURL);
    await loginPage.actions.login(testUser.email, testUser.password);
    await notesResponsePromise;

    expect(intercepted).toBe(true);

    await notesPage.assertions.verifyNoteCardVisibleInList('Mock Note 1', 'First note');
    await notesPage.assertions.verifyNoteCardVisibleInList('Mock Note 2', 'Second note');

    await page.unroute(NOTES_LIST_PATTERN);
  });
});

test.describe('M2: Expired session', () => {
  test('401 on notes endpoint should trigger logout or error message', async ({page, request}) => {
    const apiHelper = new BaseAPIHelper();
    const testUser = await apiHelper.generateUniqueUser();
    const payload = { ...payloads.RegisterUser, name: testUser.name, email: testUser.email, password: testUser.password };
    await apiHelper.registerUserViaAPI(request, apiHelper.RegisterAPIUrl, payload);

    await page.route(NOTES_LIST_PATTERN, async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      // Using the imported mock fixture
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        json: mockData.Unauthorized401,
      });
    });

    const loginPage = new LoginPage(page);
    const notesResponsePromise = page.waitForResponse(
      response => response.url().includes('/notes/api/notes') && response.request().method() === 'GET'
    );

    await loginPage.actions.navigateToLogin(loginURL);
    await loginPage.actions.login(testUser.email, testUser.password);
    
    const notesResponse = await notesResponsePromise;
    expect(notesResponse.status()).toBe(401);

    const url = page.url();
    const errorAlert = page.getByTestId('alert-message');
    await expect(errorAlert).toBeVisible();
    const alertText = await errorAlert.innerText();

    console.log(`[M2 Observed] URL after 401: ${url}, error: ${alertText}`);

    await page.unroute(NOTES_LIST_PATTERN);
  });
});

test.describe('M3: Failed mutation', () => {
  test('500 on create should not persist', async ({page, request}) => {
    const CREATE_PATTERN = '**/notes/api/notes**';
    const apiHelper = new BaseAPIHelper();
    
    const testUser = await apiHelper.generateUniqueUser();
    const payloadR = { ...payloads.RegisterUser, name: testUser.name, email: testUser.email, password: testUser.password };
    await apiHelper.registerUserViaAPI(request, apiHelper.RegisterAPIUrl, payloadR);
    
    const payloadL = { ...payloads.LoginUser, email: testUser.email, password: testUser.password };
    const loginResponse = await apiHelper.loginViaApi(request, apiHelper.LoginAPIUrl, payloadL);
    const loginBody = await loginResponse.json();
    const token = loginBody.data.token;
    let intercepted = false;

    await page.route(CREATE_PATTERN, async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      intercepted = true;
      // Using the imported mock fixture
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        json: mockData.InternalServerError500,
      });
    });

    const loginPage = new LoginPage(page);
    await loginPage.actions.navigateToLogin(loginURL);
    await loginPage.actions.login(testUser.email, testUser.password);

    const notesPage = new NotesPage(page);
    
    const noteTitle = 'Failed Note Title';
    const noteDescription = 'This note should fail to save.';

    await notesPage.actions.clickAddNoteButton();
    await notesPage.actions.createNote(noteTitle, noteDescription, 'Home', false);
    
    expect(intercepted).toBe(true);

    const noteVisible = await page
      .getByTestId('note-card')
      .filter({ hasText: noteTitle })
      .isVisible()
      .catch(() => false);

    console.log(`[M3 Observed] Note visible after 500: ${noteVisible}`);

    const serverApiNotesResponse = await apiHelper.listNotesViaApi(request, apiHelper.NotesAPIUrl, token);
    const serverApiNotesBody = await serverApiNotesResponse.json();
    expect(serverApiNotesResponse.status()).toBe(200);
    expect(serverApiNotesBody.data.length).toBe(0);
    expect(serverApiNotesBody.data.find((n: { title: string }) => n.title === noteTitle)).toBeUndefined();

    await page.unroute(CREATE_PATTERN);
  });
});