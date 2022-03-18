## BebaTakataka API
API to facilitate frontend app and help property owners and landlords get garbage collection services. Integrated with MPESA for payments.

### Technologies
- NodeJs
- Express
- Objection
- Typescript
- Multer
- Postgress
- Joi
- Http-errors
- AWS

### Getting started
1. Install git 
```bash
brew install git
```
2. Install node version manager, NVM
3. Install node version 16.x.x and start using it
```bash
nvm install 16.13.1
nvm use 16
```
4. `git clone https://github.com/Chris-Maina/Hamisha-server.git`
3. Go to cloned project folder and install dependencies
```bash
cd Hambisha-server
yarn install
```
4. Add `.env` file with environment variables similar to what is in `env-example`
5. Run migrations
```bash
yarn migrate:latest
```
6. Insert seed entries
```bash
yarn seed:run
```

### Running the application
To start the development server
```bash
yarn dev
```
Access the endpoints using your preferred client e.g. Postman

| Endpoint            | Methods  | Requires token  |
|---------------------|---------|-------------|
| /api/register       | POST    | FALSE |
| /api/login          | POST    | FALSE |
| /api/refresh-token  | GET     | FALSE |
| /profile            | GET     | TRUE  |
| /users/:id          | GET     | TRUE  |
| /users/:id          | PATCH   | TRUE  |
| /jobs               | GET     | FALSE |
| /jobs               | POST    | TRUE  |
| /jobs/:id           | PATCH   | TRUE  |
| /jobs/:id           | DELETE  | TRUE  |
| /proposals          | GET     | TRUE  |
| /proposals          | POST    | TRUE  |
| /proposals/:id      | PATCH   | TRUE  |
| /contracts          | GET     | TRUE  |
| /contracts          | POST    | TRUE  |
| /contracts/:id      | PATCH   | TRUE  |
| /contracts/:id      | GET     | TRUE  |
