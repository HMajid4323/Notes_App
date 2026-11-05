import { test, expect } from '@playwright/test';
import {BaseAPIHelper}  from '../Utils/api.helper';
import payloads from '../Utils/payloads.json';


test.describe('API CRUD Operations', () => {

    let apiHelper: BaseAPIHelper;


    test('Full CRUD lifecycle with auth', async ({request}) => {
    
        apiHelper = new BaseAPIHelper;
        const user = await apiHelper.generateUniqueUser();
        let token: string;
        let noteId: string;
        let userId: string;

        await test.step('Register User via API', async () => {
            const payload = { ...payloads.RegisterUser, name: user.name, email: user.email, password: user.password };
            userId = await apiHelper.registerUserViaAPI(request, apiHelper.RegisterAPIUrl, payload);
            console.log(`User created duccessfully. Name: ${user.name}, Email: ${user.email}`);
        });

        await test.step('Login User via API', async () => {
            const payload = { ...payloads.LoginUser, email: user.email, password: user.password }
            const loginResponse = await apiHelper.loginViaApi(request, apiHelper.LoginAPIUrl, payload);
            expect(loginResponse.status()).toBe(200);
            const loginBody = await loginResponse.json();
            expect(loginBody.message).toBe('Login successful');
            expect(loginBody.data).toBeDefined();
            expect(loginBody.data.token).not.toBe("");
            expect(loginBody.data.name).toBe(user.name);
            expect(loginBody.data.email).toBe(user.email.toLowerCase());
            console.log(`User logged in successfully. Name: ${user.name}, Email: ${user.email},Token: ${loginBody.data.token}`);
            token = loginBody.data.token;
        });

        await test.step('Create Note via API', async () => {
            const noteTitle = 'Test Note';
            const noteDescription = 'Created Via API';
            const payload = { ...payloads.CreateNote, title: noteTitle, description: noteDescription, category: 'Personal', completed: false };
            const createNoteResponse = await apiHelper.createNoteViaApi(request, apiHelper.NotesAPIUrl, token, payload);
            expect(createNoteResponse.status()).toBe(200);
            const createNoteBody = await createNoteResponse.json();
            expect(createNoteBody.message).toBe('Note successfully created');
            expect(createNoteBody.data).toBeDefined();
            expect(createNoteBody.data.title).toBe(noteTitle);
            expect(createNoteBody.data.description).toBe(noteDescription);
            expect(createNoteBody.data.user_id).toBe(userId);
            console.log(`Note created successfully. Title: ${createNoteBody.data.title}, Description: ${createNoteBody.data.description}`);
            noteId = createNoteBody.data.id;

        });

        await test.step('List Notes and Verify Creation', async () => {
            const listNoteResponse = await apiHelper.listNotesViaApi(request, apiHelper.NotesAPIUrl, token);
            expect(listNoteResponse.status()).toBe(200);
            const listNotesBody = await listNoteResponse.json();
            expect(listNotesBody.message).toBe('Notes successfully retrieved');
            expect(listNotesBody.data).toBeDefined();
            expect(listNotesBody.data).toEqual(
                expect.arrayContaining([expect.objectContaining({ id: noteId })])
            );
        });

        await test.step('Update Note Via API', async () => {
            const updatedNoteTitle = 'Test Note - Updated';
            const updatedNoteDescription = 'Updated via API';
            const payload =  { ...payloads.UpdateNote, id: noteId, title: updatedNoteTitle, description: updatedNoteDescription, category: 'Work', completed: true };
            const UpdateURL = apiHelper.NotesAPIUrl + '/' + noteId;
            const updateNoteResponse = await apiHelper.updateNotesViaAPI(request, UpdateURL, token, payload);
            expect(updateNoteResponse.status()).toBe(200);
            const updateNotesBody = await updateNoteResponse.json();
            expect(updateNotesBody.message).toBe('Note successfully Updated');
            expect(updateNotesBody.data).toBeDefined();
            expect(updateNotesBody.data.title).toBe(updatedNoteTitle);
            expect(updateNotesBody.data.description).toBe(updatedNoteDescription);
            expect(updateNotesBody.data.id).toBe(noteId);
            expect(updateNotesBody.data.user_id).toBe(userId);
            console.log(`Note updated successfully. Title: ${updateNotesBody.data.title}, Description: ${updateNotesBody.data.description}`);
        });

        await test.step('Delete Note Via API and Confirm Deletion', async () => {
            const DeleteURL = apiHelper.NotesAPIUrl + '/' + noteId;
            const deleteNoteResponse = await apiHelper.deleteNoteViaApi(request, DeleteURL, token);
            expect(deleteNoteResponse.status()).toBe(200);
            const deleteNotesBody = await deleteNoteResponse.json();
            expect(deleteNotesBody.message).toBe('Note successfully deleted');
            const listNoteURL = apiHelper.NotesAPIUrl + '/' + noteId;
            const listNoteResponse = await apiHelper.listNoteViaAPI(request, listNoteURL, token);
            expect(listNoteResponse.status()).toBe(404);
            const listNoteBody = await listNoteResponse.json();
            expect(listNoteBody.message).toBe('No note was found with the provided ID, Maybe it was deleted');
            console.log(`Note deleted successfully.`);

        });
    });
});

//   test('Protected operation without auth returns 401', async ({ apiContext }) => {
//     const res = await apiContext.get(`${API_BASE}/notes`);
//     expect(res.status()).toBe(401);
//   });

//   test('User A cannot view or modify User B note', async ({ apiContext }) => {
//     const userA = uniqueUser();
//     const userB = uniqueUser();

//     const tokenA = await registerUser(apiContext, userA);
//     const tokenB = await registerUser(apiContext, userB);

//     try {
//       await test.step('User B creates a note', async () => {
//         const noteB = await createNoteViaApi(apiContext, tokenB, {
//           title: 'B private note',
//           description: 'Should not be visible to A',
//           category: 'Personal',
//         });

//         await test.step('User A lists notes and must not see B note', async () => {
//           const notesA = await listNotesViaApi(apiContext, tokenA);
//           expect(notesA.find((n) => n.id === noteB.id)).toBeUndefined();
//         });

//         await test.step('User A tries to delete B note and gets 401/403', async () => {
//           const res = await apiContext.delete(`${API_BASE}/notes/${noteB.id}`, {
//             headers: { 'x-auth-token': tokenA },
//           });
//           expect([401, 403, 404]).toContain(res.status());
//         });
//       });
//     } finally {
//       await deleteUserViaApi(apiContext, tokenA).catch(() => {});
//       await deleteUserViaApi(apiContext, tokenB).catch(() => {});
//     }
