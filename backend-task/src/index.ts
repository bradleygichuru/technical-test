import express, { Express, Request, RequestHandler, Response } from "express";
import dotenv from "dotenv";
const cors = require("cors");
import { pool } from "./utils/pool-inst";
import bodyParser from "body-parser";
import { hashSync, genSaltSync, compareSync } from "bcrypt";
const jwt = require("jsonwebtoken");
import { QueryResult } from "pg";
import { User } from "./utils/my-types";
import Router from "express-promise-router";
dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;
const router = Router();
app.use(cors());
app.use(bodyParser.json());
const authenticateToken: RequestHandler = (req, res, next) => {
  //middleware verify submitted jwt token
  const authHeader = req.headers["authorization"];
  const token = authHeader;
  console.log({ token, authHeader });
  if (token == null) {
    return res.status(401).json({ status: "unauthenticated" });
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      console.log(err);

      if (err) {
        return res.status(403).json({ status: "unauthorized" });
      }
      next();
    },
  );
};
router.get("/users", async (req: Request, res: Response) => {
  //get all users
  console.log("GET /users");
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM users");
    return res.json({ users: result?.rows, status: "success" });
  } catch (e) {
    console.error(e);
    return res.status(500).send("An internal error occured");
  } finally {
    client.release();
  }
});
router.get("/users/:id", async (req: Request, res: Response) => {
  //get use by id
  const client = await pool.connect();
  try {
    console.log(`GET /users/${req.params.id}`);
    const result = await client.query("SELECT * FROM users WHERE id=$1", [
      req.params.id,
    ]);
    return res.json({ users: result?.rows, status: "success" });
  } catch (e) {
    console.error(e);
    return res.status(500).send("An internal error occured");
  } finally {
    client.release();
  }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log(`DELETE /users/${req.params.id}`);
    const result = await client.query(
      "DELETE FROM users WHERE id=$1 RETURNING *",
      [req.params.id],
    );
    if (result.rows[0].id == parseInt(req.params.id as string)) {
      return res.json({ status: "success" });
    } else {
      return res
        .status(500)
        .json({ status: "An error occurred deleting the user" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send("An internal error occured");
  } finally {
    client.release();
  }
});

router.post(
  "/users",
  authenticateToken,
  async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      const salt = genSaltSync(10);
      const hashedPassword = hashSync(req.body.password, salt);
      const result = await client.query(
        "INSERT INTO users(name,email,password,phone_number,is_admin,company) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
        [
          req.body.name,
          req.body.email,
          hashedPassword,
          req.body.phoneNumber,
          req.body.is_admin,
          req.body.company,
        ],
      );
      if (result.rows[0].id) {
        res.json({ status: "success" });
      } else {
        return res.status(500).send("There was an error creating user");
      }
    } catch (e) {
      console.error(e);
      return res.status(500).send("An internal error occured");
    } finally {
      client.release();
    }
  },
);
router.post("/auth/login", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log(`POST /auth/login`);
    const result: QueryResult<User> = await client.query(
      "SELECT * FROM users WHERE email=$1",
      [req.body.email],
    );
    console.log(req.body);
    if (result.rows.length > 0) {
      const hashCompareResult = compareSync(
        req.body.password,
        result.rows[0].password,
      );
      if (hashCompareResult) {
        return res.status(200).json({
          token: generateAccessToken(req.body.password),
          status: "success",
          isAdmin: result.rows[0].is_admin,
        });
      } else {
        return res.status(404).json({ status: "credential miss match" });
      }
    } else {
      return res.status(404).send("User with email not found");
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send("An internal error occured");
  } finally {
    client.release();
  }
});
router.put(
  "/users/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
      console.log(req.body);
      console.log(`PUT /users/${req.params.id}`);
      const result = await client.query(
        "UPDATE users SET name = $1,email=$2,phone_number=$3 WHERE id=$4",
        [req.body.name, req.body.email, req.body.phoneNumber, req.params.id],
      );
      if (result.rowCount! > 0) {
        return res.status(200).json({
          status: "Updated successfully",
        });
      } else {
        return res.status(200).json({
          status: "An error occured updating user",
        });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).send("An internal error occured");
    } finally {
      client.release();
    }
  },
);

app.use(router);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

function generateAccessToken(password: string) {
  return jwt.sign(
    { data: password, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
    process.env.TOKEN_SECRET as string,
  );
}
