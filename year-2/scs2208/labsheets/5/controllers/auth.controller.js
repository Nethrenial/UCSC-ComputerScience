import {PrismaClient} from "@prisma/client";
import validator from "validator";
import {v1 as uuid1, v4 as uuid4} from "uuid";
import {hash as bcryptHash, compare as bcryptCompare} from "bcrypt";

const prisma = new PrismaClient();

class AuthController {
    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    getRegisterPage(req, res) {
        res.locals.title = "Sign up - Nethrenial Co.";
        return res.render("pages/auth/register", {
            errors: {},
        });
    }

    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    async register(req, res) {
        const {email, password, confirmPassword} = req.body;

        const errors = {
            email: [],
            password: [],
            confirmPassword: [],
        };

        if (!email) {
            errors.email.push("Email is required");
        }
        if (!validator.isEmail(email)) {
            errors.email.push("Email is not a valid email");
        }
        if (!password) {
            errors.password.push("Password is required");
        }
        if (!confirmPassword) {
            errors.confirmPassword.push("Confirm password is required");
        }

        if (password.length < 6) {
            errors.password.push("Password must be 6 characters or more");
        }

        if (password !== confirmPassword) {
            errors.password.push("Password and Confirm Password doesn't match");
            errors.confirmPassword.push(
                "Password and Confirm Password doesn't match"
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            errors.email.push(
                "This email is already registered, please use another one"
            );
        }

        if (
            errors.email.length !== 0 ||
            errors.password.length !== 0 ||
            errors.confirmPassword.length !== 0
        ) {
            res.locals.title = "Sign up - Nethrenial Co.";
            return res.render("pages/auth/register", {
                errors,
                email,
                password,
                confirmPassword,
            });
        }

        const hashedPassword = await bcryptHash(password, 10);

        const createdUser = await prisma.user.create({
            data: {
                id: uuid1() + uuid4(),
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                password: true,
            },
        });
        res.redirect('/auth/login');
    }

    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    async getLoginPage(req, res) {
        res.locals.title = "Sign in - Nethrenial Co.";
        return res.render("pages/auth/login", {errors: {}});
    }

    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    async login(req, res) {
        const {email, password} = req.body;
        const errors = {
            email: [],
            password: [],
        };

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!existingUser) {
            errors.email.push("Email address is not used in an account");
            res.locals.title = "Login - Nethrenial Co.";
            res.render("pages/auth/login", {
                errors,
                email,
                password,
            });
        } else {
            const matchesPassword = await bcryptCompare(
                password,
                existingUser.password
            );

            if (!matchesPassword) {
                errors.password.push("Password is incorrect");
                res.locals.title = "Login - Nethrenial Co.";
                res.render("pages/auth/login", {
                    errors,
                    email,
                    password,
                });
            } else {
                req.logIn({...existingUser, password: undefined}, (err) => {
                    if (err) {
                        return res.status(400).send({
                            message: "Something ocurred",
                        });
                    } else {
                        res.redirect("/");
                    }
                });
            }
        }
    }

    /**
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    logout(req, res, next) {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    }
}

export const authController = new AuthController();
