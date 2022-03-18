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
2. Install node version manager, [nvm](https://github.com/nvm-sh/nvm)
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

| Endpoint                | Methods | Requires token|
|-------------------------|---------|---------------|
| /api/register           | POST    | FALSE         |
| /api/login              | POST    | FALSE         |
| /api/refresh-token      | GET     | FALSE         |
| /api/profile            | GET     | TRUE          |
| /api/users/:id          | GET     | TRUE          |
| /api/users/:id          | PATCH   | TRUE          |
| /api/jobs               | GET     | FALSE         |
| /api/jobs               | POST    | TRUE          |
| /api/jobs/:id           | PATCH   | TRUE          |
| /api/jobs/:id           | DELETE  | TRUE          |
| /api/proposals          | GET     | TRUE          |
| /api/proposals          | POST    | TRUE          |
| /api/proposals/:id      | PATCH   | TRUE          |
| /api/contracts          | GET     | TRUE          |
| /api/contracts          | POST    | TRUE          |
| /api/contracts/:id      | PATCH   | TRUE          |
| /api/contracts/:id      | GET     | TRUE          |
