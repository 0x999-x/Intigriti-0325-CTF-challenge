import { Redis } from "ioredis";
import Cookies from "cookies";

const redisOptions = {
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT,
};

export default async function handler(req, res) {
  const redis = new Redis(redisOptions);
  const cookies = new Cookies(req, res);

  try {
    const { method, body } = req;

    switch (method) {
      case "POST":
        if (!req.headers["content-type"].startsWith("application/json")) {
          return res.status(400).json({ message: "Invalid content type" });
        }
        if (!body.username || typeof body.username !== "string" || !body.password || typeof body.password !== "string") {
          return res.status(400).json({ message: "Missing/invalid username or password" });
        }
        if (cookies.get("secret")) {
          return res.status(200).json({ message: "Session already exists" });
        }

        const password = String(body.password);
        const username = String(body.username);
        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()\-_=+{}.]{3,64}$/;
        const usernameRegex = /^[a-zA-Z0-9]{3,32}$/;
        if (!usernameRegex.test(username)) {
          return res.status(400).json({
            message:
              "Username must be 3-32 characters long and contain only a-z, A-Z, 0-9",
          });
        }
        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            message:
              "Password must be between 3 and 64 characters long and contain only the following characters: " +
              "a-z, A-Z, 0-9, !@#$%^&*()-_=+{}.",
          });
        }
        try {
          const redisKey = "nextjs:"+btoa(`${username}:${password}`);
          const userExists = await redis.get(redisKey);

          const cookieOptions = [
            `HttpOnly`,
            `Secure`,
            `Max-Age=${60 * 60}`,
            `SameSite=None`,
            `Path=/`,
            process.env.DOMAIN && `Domain=${process.env.DOMAIN}`,
          ]
            .filter(Boolean)
            .join("; ");

          if (userExists) {
            res.setHeader("Set-Cookie", `secret=${redisKey.replace('nextjs:', '')}; ${cookieOptions}`);
            return res.status(200).json({ message: "Cookie set successfully" });
          }

          await redis.set(redisKey, "[]", "EX", 60 * 60);
          res.setHeader("Set-Cookie", `secret=${redisKey.replace('nextjs:', '')}; ${cookieOptions}`);
          return res.status(200).json({ message: "Cookie set successfully" });
        } catch (error) {
          console.error("Redis error:", error);
          return res.status(500).json({ message: "Internal server error" });
        }

      case "DELETE":
        try {
          const deleteCookie = [
            "secret=",
            "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
            "HttpOnly",
            "Secure",
            "SameSite=None",
            "Max-Age=0",
            "Path=/",
            process.env.DOMAIN && `Domain=${process.env.DOMAIN}`,
          ]
            .filter(Boolean)
            .join("; ");

          res.setHeader("Set-Cookie", deleteCookie);
          return res.status(200).json({ message: "You will be missed 😭💔" });
        } catch (error) {
          console.error("ERROR:", error);
          return res.status(500).json({ message: "Internal server error" });
        }

      default:
        res.setHeader("Allow", ["POST", "DELETE"]);
        return res.status(200).json({ message: "ok" });
    }
  } finally {
    await redis.quit();
  }
}

