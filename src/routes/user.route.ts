// src/routes/user.route.ts
import { Router } from '../router/router';
import * as userController from '../controller/user.controller';

const router = new Router();

// GET /api/users - Return list of users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Return user by ID
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

export { router as userRoutes };