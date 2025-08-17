/**
 * @swagger
 * components:
 *   schemas:
 *     UserDto:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         email:
 *           type: string
 *         
 */
export interface IUserDto {
    id: number;
    email: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCredentials:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         
 */
export interface IUserCredentials {
    email: string;
    password: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         firstname:
 *           type: string
 *         lastname:
 *           type: string
 *         pict_url:
 *           type: string
 *         createdAt:
 *           type: string
 *         
 */
export interface IUser extends IUserDto, IUserCredentials {
    firstname: string;
    lastname: string;
    name: string;
    pict_url: string;
    created_at: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *         
 */
export interface IUserInfo extends Omit<IUser, 'password'> {}