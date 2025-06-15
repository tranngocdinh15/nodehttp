import * as fs from 'fs';
import * as path from 'path';

interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

export class UserDtos {
    private filePath: string;
    private users: User[];

    constructor() {
        this.filePath = path.join(__dirname, '../data/users.json');
        this.users = this.loadUsers();
    }

    private loadUsers(): User[] {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf8');
                console.log(data)
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
        return [];
    }

    private saveUsers(): void {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.filePath, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Error saving users:', error);
            throw new Error('Failed to save users');
        }
    }

    getAllUsers(): User[] {
        return this.users;
    }

    getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
        const newUser: User = {
            id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
            ...userData,
            createdAt: new Date()
        };

        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    updateUser(id: number, userData: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
        const userIndex = this.users.findIndex(user => user.id === id);

        if (userIndex === -1) {
            return null;
        }

        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        this.saveUsers();
        return this.users[userIndex];
    }

    deleteUser(id: number): boolean {
        const userIndex = this.users.findIndex(user => user.id === id);

        if (userIndex === -1) {
            return false;
        }

        this.users.splice(userIndex, 1);
        this.saveUsers();
        return true;
    }
}