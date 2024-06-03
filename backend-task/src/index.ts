import express, { Express, Request, RequestHandler, Response } from "express";
import dotenv from "dotenv";
const cors = require("cors");
import { client, pool } from "./utils/pool-inst";
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
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});
const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      console.log(err);

      if (err) {
        return res.sendStatus(403);
      }
      next();
    },
  );
};
router.get("/users", async (req: Request, res: Response) => {
  console.log("GET /users");
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM users");
    console.log(result);
    return res.json({ users: result?.rows, status: "success" });
  } catch (e) {
    console.error(e);
    return res.status(500).send("An internal error occured");
  } finally {
    client.release();
  }
});
router.post("/auth/register", async (req: Request, res: Response) => {});
router.get("/user/:id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
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

router.post("/users", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(req.body.password, salt);
    const result = await client.query(
      "INSERT INTO users(name,email,password,phoneNumber,isAdmin) VALUES($1,$2,$3,$4,$5) RETURNINGid",
      [
        req.body.name,
        req.body.email,
        hashedPassword,
        req.body.phoneNumber,
        req.body.is_admin,
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
});
router.post("/auth/login", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const result: QueryResult<User> = await client.query(
      "SELECT * FROM users WHERE email=$1",
      [req.body.email],
    );
    if (result.rows.length > 0) {
      const hashCompareResult = compareSync(
        req.body.password,
        result.rows[0].password,
      );
      if (hashCompareResult) {
        return res.status(200).json({
          token: generateAccessToken(req.body.password),
          status: "success",
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

function generateAccessToken(username: string) {
  return jwt.sign(username, process.env.TOKEN_SECRET as string, {
    expiresIn: "1800s",
  });
}
