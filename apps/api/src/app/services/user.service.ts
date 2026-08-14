import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { UserRepository } from '../database/repositories/user.repository';
import { NewUser, User } from '../database/types';
import {
  createUserSchema,
  loginUserSchema,
  resetPasswordSchema,
  updateUserSchema,
} from '../schemas/user.schema';
import { ConflictError, NotFoundError, UnauthorizedError } from '../shared/errors';
import type { z } from 'zod/v4';

const scrypt = promisify(scryptCallback);
const passwordKeyLength = 64;

type CreateUserInput = z.infer<typeof createUserSchema>;
type LoginUserInput = z.infer<typeof loginUserSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type PublicUser = Omit<User, 'passwordHash'>;

export class UserService {
  private readonly userRepository: UserRepository;

  constructor(opts: { userRepository: UserRepository }) {
    this.userRepository = opts.userRepository;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.findAll();
    return users.map(toPublicUser);
  }

  /**
   * Get a user by ID
   * @throws Error if user not found
   */
  async getUserById(userId: number): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    return toPublicUser(user);
  }

  /**
   * Get a user by email address
   * @throws Error if user not found
   */
  async getUserByEmail(emailAddress: string): Promise<PublicUser> {
    const user = await this.userRepository.findByEmail(emailAddress);
    if (!user) {
      throw new NotFoundError(`User with email ${emailAddress} not found`);
    }
    return toPublicUser(user);
  }

  /**
   * Check if a user exists by email address
   */
  async userExistsByEmail(emailAddress: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(emailAddress);
    return user !== undefined;
  }

  /**
   * Authenticate a user by email and password.
   * @throws Error if credentials are invalid
   */
  async authenticateUser(data: LoginUserInput): Promise<PublicUser> {
    const validatedData = loginUserSchema.parse(data);
    const user = await this.userRepository.findByEmail(validatedData.emailAddress);

    if (!user?.passwordHash) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    const passwordMatches = await verifyPassword(validatedData.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    return toPublicUser(user);
  }

  /**
   * Reset a user's password by email.
   * @throws Error if user not found
   */
  async resetPassword(data: ResetPasswordInput): Promise<PublicUser> {
    const validatedData = resetPasswordSchema.parse(data);
    const user = await this.userRepository.findByEmail(validatedData.emailAddress);

    if (!user) {
      throw new NotFoundError(`User with email ${validatedData.emailAddress} not found`);
    }

    const passwordHash = await hashPassword(validatedData.password);
    const updatedUser = await this.userRepository.update(user.userId, { passwordHash });

    return toPublicUser(updatedUser);
  }

  /**
   * Create a new user
   * @throws Error if email already exists
   */
  async createUser(data: CreateUserInput): Promise<PublicUser> {
    // Validate with Zod schema
    const validatedData = createUserSchema.parse(data);

    // Check if user with this email already exists
    const existingUser = await this.userRepository.findByEmail(validatedData.emailAddress);
    if (existingUser) {
      throw new ConflictError(`User with email ${validatedData.emailAddress} already exists`);
    }

    const passwordHash = await hashPassword(validatedData.password);

    const newUser: NewUser = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      emailAddress: validatedData.emailAddress,
      passwordHash,
    };

    const user = await this.userRepository.create(newUser);
    return toPublicUser(user);
  }

  /**
   * Update a user
   * @throws Error if user not found or email already in use by another user
   */
  async updateUser(userId: number, data: UpdateUserInput): Promise<PublicUser> {
    // Verify user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Validate with Zod schema
    const validatedData = updateUserSchema.parse(data);

    // If email is being updated, check if it's already in use
    if (validatedData.emailAddress && validatedData.emailAddress !== existingUser.emailAddress) {
      const userWithEmail = await this.userRepository.findByEmail(validatedData.emailAddress);
      if (userWithEmail && userWithEmail.userId !== userId) {
        throw new ConflictError(
          `Email ${validatedData.emailAddress} is already in use by another user`,
        );
      }
    }

    const user = await this.userRepository.update(userId, validatedData);
    return toPublicUser(user);
  }

  /**
   * Delete a user
   * @throws Error if user not found
   */
  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    const deleted = await this.userRepository.delete(userId);
    if (!deleted) {
      throw new Error(`Failed to delete user with ID ${userId}`);
    }
  }
}

function toPublicUser(user: User): PublicUser {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, passwordKeyLength)) as Buffer;

  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const storedKey = Buffer.from(hash, 'hex');
  const derivedKey = (await scrypt(password, salt, storedKey.length)) as Buffer;

  return timingSafeEqual(storedKey, derivedKey);
}
