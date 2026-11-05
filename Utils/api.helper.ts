import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import {API_BASE} from '../Utils/global.var';
import { faker } from '@faker-js/faker';


export class BaseAPIHelper {

  RegisterAPIUrl = API_BASE + '/users/register';
  LoginAPIUrl = API_BASE + '/users/login';
  NotesAPIUrl = API_BASE + '/notes';
  DeleteAccountAPIUrl = API_BASE + '/users/delete-account';



  async generateUniqueUser(): Promise<{ name: string; email: string; password: string }> {
    const fname = faker.person.firstName();
    const lname = faker.person.lastName();
    const name = `${fname} ${lname}`;
    const email = faker.internet.email({ firstName: fname, lastName: lname });
    const password = faker.internet.password({ length: 12, memorable: true, pattern: /[A-Za-z0-9]/ });
    return { name, email, password };
  }

  async registerUserViaAPI(request: APIRequestContext, URL: string, payload: any): Promise<string> {
    const response = await request.post(URL, {
        data: payload
    });
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    expect(response.status()).toBe(201);
    expect(responseBody.data.id).toBeDefined();
    expect(responseBody.message).toBe('User account created successfully');

    return responseBody.data.id;
  }

  async loginViaApi(request: APIRequestContext, URL: string, payload: any): Promise<APIResponse> {
    const response = await request.post(URL, {
      data: payload,
    });
    
    return response;
  }

  async createNoteViaApi(request: APIRequestContext, URL: string, token: string, payload: any): Promise<APIResponse> {
    const response = await request.post(URL, {
      headers: { 'x-auth-token': token },
      data: payload,
    });

    return response;
  }

  async listNotesViaApi(request: APIRequestContext, URL: string, token: string): Promise<APIResponse> {
    const response = await request.get(URL, {
      headers: { 'x-auth-token': token },
    });

    return response;
  }

  async listNoteViaAPI(request: APIRequestContext, URL: string, token: string): Promise<APIResponse> {
    const response = await request.get(URL, {
      headers: { 'x-auth-token': token },
    });

    return response;
  }

  async updateNotesViaAPI(request: APIRequestContext, URL: string, token: string, payload: any): Promise<APIResponse> {
    const response = await request.put(URL, {
      headers: { 'x-auth-token': token },
      data: payload,
    });

    return response;
  }

  async deleteNoteViaApi(request: APIRequestContext, URL: string, token: string): Promise<APIResponse> {
    const response = await request.delete(URL, {
      headers: { 'x-auth-token': token },
    });
    return response;
  }

  async deleteUserViaApi(request: APIRequestContext, URL: string, token: string): Promise<APIResponse> {
    const response = await request.delete(URL, {
      headers: { 'x-auth-token': token },
    });
    return response;
  }

}