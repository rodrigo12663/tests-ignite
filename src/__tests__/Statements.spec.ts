import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../app'

let connection: Connection;

describe("Statements Tests", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance of user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "test",
        email: "test@test.com",
        password: "123"
      })

    const responseCreateSession = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "123"
      })

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${responseCreateSession.body.token}`
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      statement: expect.any(Array),
      balance: expect.any(Number),
    })
  })

  it("should be able to register deposit to user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "test",
        email: "test@test.com",
        password: "123"
      })

    const responseCreateSession = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "123"
      })

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Descrição do deposito",
      })
      .set({
        Authorization: `Bearer ${responseCreateSession.body.token}`
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      user_id: responseCreateSession.body.user.id,
      description: "Descrição do deposito",
      amount: 10,
      type: "deposit",
      created_at: expect.any(String),
      updated_at: expect.any(String)
    })
  })

  it("should be able to register withdraw to user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "test",
        email: "test@test.com",
        password: "123"
      })

    const responseCreateSession = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "123"
      })

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 5,
        description: "Descrição do saque",
      })
      .set({
        Authorization: `Bearer ${responseCreateSession.body.token}`
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      user_id: responseCreateSession.body.user.id,
      description: "Descrição do saque",
      amount: 10 - 5,
      type: "deposit",
      created_at: expect.any(String),
      updated_at: expect.any(String)
    })
  })

  it("should be able to get a statement operation to user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "test",
        email: "test@test.com",
        password: "123"
      })

    const responseCreateSession = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "123"
      })

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 5,
        description: "Descrição do saque",
      })
      .set({
        Authorization: `Bearer ${responseCreateSession.body.token}`
      })


    const response = await request(app)
      .get(`/api/v1/statements/${responseDeposit.body.id}`)
      .set({
        Authorization: `Bearer ${responseCreateSession.body.token}`
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      id: responseDeposit.body.id,
      user_id: responseCreateSession.body.user.id,
      description: responseDeposit.body.description,
      amount: expect.any(String),
      type: responseDeposit.body.type,
      created_at: responseDeposit.body.created_at,
      updated_at: responseDeposit.body.updated_at
    })
  })
})
