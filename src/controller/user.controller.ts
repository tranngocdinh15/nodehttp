// src/controller/user.controller.ts
import { Request, Response } from '../router/router';
import { UserDtos } from '../dtos/user.dtos';

const userService = new UserDtos();

export const getAllUsers = (req: Request, res: Response) => {
  try {
    const users = userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params!.id);
    const user = userService.getUserById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const newUser = userService.createUser({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params!.id);
    const { name, email } = req.body;

    const updatedUser = userService.updateUser(id, { name, email });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params!.id);
    const success = userService.deleteUser(id);

    if (!success) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};