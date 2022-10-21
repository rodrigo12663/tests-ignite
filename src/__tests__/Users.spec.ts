import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../app'

let connection: Connection;

describe("Users Tests", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "test",
      email: "test@test.com",
      password: "123"
    })

    expect(response.statusCode).toBe(201)
  })

  it("should be able to create session of user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "123"
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject(
      {
        user: {
          id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String)
        },
        token: expect.any(String)
      }
    )
  })

  it("should be able to get profile of authenticated user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@test.com",
      password: "123"
    })

    const { token } = response.body

    const responseProfile = await request(app).get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(response.statusCode).toBe(200)
    expect(responseProfile.body).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String)
    })
  })
})
