import { APIRequestContext, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';


export class BaseAPIHelper {

private readonly API_BASE = 'https://practice.expandtesting.com/notes/api';
private readonly UI_BASE = 'https://practice.expandtesting.com/notes/app';
LoginUiUrl = this.UI_BASE + '/login';
RegisterAPIUrl = this.API_BASE + '/users/register';

 async generateUniqueUser(): Promise<{ name: string; email: string; password: string }> {
  const fname = faker.person.firstName();
  const lname = faker.person.lastName();
  const name = `${fname} ${lname}`;
  const email = faker.internet.email({ firstName: fname, lastName: lname });
  const password = faker.internet.password({ length: 12, memorable: true, pattern: /[A-Za-z0-9]/ });
  return { name, email, password };
}

async registerUser(request: APIRequestContext, URL: string, payload: any) {;
  const response = await request.post(URL, {
      data: payload
  });
    return response;
  }

 async postrequest(request: APIRequestContext, RegisterUrl: string, data: [string, string, string], user: { name: string; email: string; password: string; }): Promise<string> {
  const response = await request.post(`${this.API_BASE}/users/register`, {
    data: user,
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  return body.data.id;
}

// export async function loginViaApi(
//   request: APIRequestContext,
//   user: UserCredentials
// ): Promise<string> {
//   const res = await request.post(`${API_BASE}/users/login`, {
//     data: { email: user.email, password: user.password },
//   });
//   expect(res.status()).toBe(200);
//   const body = await res.json();
//   return body.data.token;
// }

// export async function createNoteViaApi(
//   request: APIRequestContext,
//   token: string,
//   payload: NotePayload
// ): Promise<NoteResponse> {
//   const res = await request.post(`${API_BASE}/notes`, {
//     headers: { 'x-auth-token': token },
//     data: payload,
//   });
//   expect(res.status()).toBe(200);
//   const body = await res.json();
//   return body.data;
// }

// export async function listNotesViaApi(
//   request: APIRequestContext,
//   token: string
// ): Promise<NoteResponse[]> {
//   const res = await request.get(`${API_BASE}/notes`, {
//     headers: { 'x-auth-token': token },
//   });
//   expect(res.status()).toBe(200);
//   const body = await res.json();
//   return body.data;
// }

// export async function deleteNoteViaApi(
//   request: APIRequestContext,
//   token: string,
//   noteId: string
// ): Promise<void> {
//   const res = await request.delete(`${API_BASE}/notes/${noteId}`, {
//     headers: { 'x-auth-token': token },
//   });
//   expect(res.status()).toBe(200);
// }

// export async function deleteUserViaApi(
//   request: APIRequestContext,
//   token: string
// ): Promise<void> {
//   await request.delete(`${API_BASE}/users/delete-account`, {
//     headers: { 'x-auth-token': token },
//   });
// }

}