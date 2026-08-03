import {test, expect} from '@playwright/test';

test.describe('Usuario API Tests', () => {

    test('should list all users', async ({ request }) => {

        const response = await request.get('/usuarios');

        expect(response.status()).toBe(200);

        const users = await response.json();
        expect(users.usuarios).toBeInstanceOf(Array);
        expect(users.usuarios[0]).toHaveProperty('nome');

    });

});