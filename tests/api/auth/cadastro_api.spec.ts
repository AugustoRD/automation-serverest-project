import {test, expect} from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Cadastro API Tests', () => {

    let userIDs: string[] = [];

    test.afterEach(async ({ request }) => {
        for (const userId of userIDs) {
            const response = await request.delete(`/usuarios/${userId}`);
            expect(response.status()).toBe(200);
        }
        userIDs = [];
    });

    test('should create a new user with admin role', async ({ request }) => {

        const randomName = faker.person.fullName();
        const randomEmail = faker.internet.email();

        const newUser = {
            nome: randomName,
            email: randomEmail,
            password: '123456',
            administrador: 'true'
        };

        const response = await request.post('/usuarios', {
            data: newUser
        });

        expect(response.status()).toBe(201);

        const createdUser = await response.json();

        userIDs.push(createdUser._id);

        expect(createdUser).toHaveProperty('message', 'Cadastro realizado com sucesso');
        expect(createdUser).toHaveProperty('_id');

    });

    test('should create a new user without admin role', async ({ request }) => {

        const randonName = faker.person.fullName();
        const randomEmail = faker.internet.email();

        const newUser = {
            nome: randonName,
            email: randomEmail,
            password: '123456',
            administrador: 'false'
        };

        const response = await request.post('/usuarios', {
            data: newUser
        });

        expect(response.status()).toBe(201);

        const createdUser = await response.json();
        userIDs.push(createdUser._id);
        expect(createdUser).toHaveProperty('message', 'Cadastro realizado com sucesso');
        expect(createdUser).toHaveProperty('_id');

    });

    test('should not create a new user with the same email', async ({ request }) => {
        const randonName = faker.person.fullName();
        const randomEmail = faker.internet.email();

        const userData = {
            nome: randonName,
            email: randomEmail,
            password: '123456',
            administrador: 'false'
        };

        const response1 = await request.post('/usuarios', {
            data: userData
        });

        expect(response1.status()).toBe(201);

        const responseBody1 = await response1.json();
        userIDs.push(responseBody1._id);

        const response2 = await request.post('/usuarios', {
            data: userData
        });

        expect(response2.status()).toBe(400);

        const responseBody2 = await response2.json();

        userIDs.push(responseBody2._id);
        expect(responseBody2).toHaveProperty('message', 'Este email já está sendo usado');

    });
    

});